import Anthropic from "@anthropic-ai/sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getDb } from "@/lib/db";
import { fetchPixabayImage } from "@/lib/pixabay";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(25, "1 h"),
      prefix: "giftwhisperer:ratelimit",
    })
  : null;

const client = new Anthropic();

// Sandbox and production keys only authenticate against their matching host.
const VIATOR_API_BASE =
  process.env.NODE_ENV === "production" ? "https://api.viator.com/partner" : "https://api.sandbox.viator.com/partner";

const SYSTEM_PROMPT = `You are a thoughtful gift recommendation expert. Given details about a gift recipient, recommend exactly 3 gifts that are genuinely well-suited to them.

Only suggest real products or experiences that actually exist and are widely available for purchase/booking. Stick to well-known brands and real, bookable experience types — do not invent product names or combine brand names with model numbers you are not sure about.

For each gift provide:
- name: a specific, real product name (e.g. "Kindle Paperwhite" not "e-reader") or a specific experience type (e.g. "Sunset Sailing Cruise" not "boat activity")
- price: a realistic price matching the stated budget, formatted as "$X" or "$X–$Y". For experiences, this is a placeholder — real pricing is fetched separately.
- rationale: a warm, personalized rationale (2–3 sentences) explaining why this gift suits this specific person
- tags: 2–4 short interest or theme tags
- affiliateUrl: set to "#"
- type: either "product" or "experience". Use "experience" for real, in-person bookable tours, classes, activities, workshops, or tastings. Use "product" for physical items.
- store: "etsy" for handmade, personalized, custom, artisan, vintage, or unique physical items. "amazon" for mainstream branded products, electronics, books, fitness equipment, and anything mass-produced. "viator" for any "experience"-type gift. Viator's catalog is in-person only — do not suggest purely virtual/online-only experiences (e.g. a "virtual cooking class" or "online workshop") for this store, since there's no real inventory for those and the resulting link will be irrelevant.
- searchQuery: a concise 2–5 word search query that will reliably surface this product/experience. For "amazon"/"etsy" gifts, optimize for that store's search. For "viator" gifts, optimize for Viator's search (e.g. "sunset sailing cruise" or "pottery making class").

Make the gifts feel personal and considered. Since the recipient's location is unknown, favor experience types that are common and widely available in most cities (e.g. a sunset sailing cruise, a cooking class, a wine tasting) rather than something hyper-specific to one place — Viator surfaces options near the person once they click through.`;

const GIFT_SCHEMA = {
  type: "object",
  properties: {
    gifts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "string" },
          rationale: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          affiliateUrl: { type: "string" },
          type: { type: "string", enum: ["product", "experience"] },
          store: { type: "string", enum: ["amazon", "etsy", "viator"] },
          searchQuery: { type: "string" },
        },
        required: ["name", "price", "rationale", "tags", "affiliateUrl", "type", "store", "searchQuery"],
        additionalProperties: false,
      },
    },
  },
  required: ["gifts"],
  additionalProperties: false,
};

const GIFT_PREFERENCE_INSTRUCTIONS: Record<string, string> = {
  experiences: "The user said they're shopping for someone who prefers experiences over physical gifts. All 3 recommendations must be type \"experience\".",
  gifts: "The user said they're shopping for someone who prefers physical gifts over experiences. All 3 recommendations must be type \"product\".",
  both: "The user said this person likes both experiences and physical gifts. At most 1 of the 3 recommendations should be type \"experience\" — the rest should be type \"product\".",
};

interface ViatorProductResult {
  title: string;
  productUrl: string;
  pricing?: { summary?: { fromPrice?: number } };
  duration?: { fixedDurationInMinutes?: number };
  images?: { variants?: { width?: number; height?: number; url?: string }[] }[];
}

// Viator returns several resolutions per image — pick the one closest to our card thumbnail size.
function pickViatorImageUrl(images?: ViatorProductResult["images"]): string | undefined {
  const variants = images?.[0]?.variants;
  if (!variants?.length) return undefined;
  const target = 200;
  const best = variants.reduce((closest, v) =>
    Math.abs((v.width ?? 0) - target) < Math.abs((closest.width ?? 0) - target) ? v : closest
  );
  return best.url;
}

async function fetchViatorListing(
  searchQuery: string
): Promise<{ price: string; affiliateUrl: string; imageUrl?: string } | null> {
  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`${VIATOR_API_BASE}/search/freetext`, {
      method: "POST",
      headers: {
        "exp-api-key": apiKey,
        "Accept-Language": "en-US",
        Accept: "application/json;version=2.0",
        "Content-Type": "application/json;version=2.0",
      },
      body: JSON.stringify({
        searchTerm: searchQuery,
        searchTypes: [{ searchType: "PRODUCTS", pagination: { start: 1, count: 1 } }],
        currency: "USD",
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { products?: { results?: ViatorProductResult[] } };
    const top = data.products?.results?.[0];
    if (!top?.productUrl) return null;
    const fromPrice = top.pricing?.summary?.fromPrice;
    return {
      price: fromPrice ? `From $${Math.round(fromPrice)} per person` : "See price on Viator",
      affiliateUrl: top.productUrl,
      imageUrl: pickViatorImageUrl(top.images),
    };
  } catch (err) {
    console.error("[viator search]", err);
    return null;
  }
}

const BUDGET_LABELS: Record<string, string> = {
  "under-25": "under $25",
  "25-50": "$25–$50",
  "50-100": "$50–$100",
  "100-250": "$100–$250",
  "250+": "$250 or more",
};

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    if (ratelimit) {
      try {
        const { success, remaining } = await ratelimit.limit(ip);
        if (!success) {
          return Response.json(
            { error: "Too many requests. Please try again in an hour." },
            { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
          );
        }
      } catch (rateLimitError) {
        // Fail open: an unreachable rate limiter shouldn't take down the whole feature.
        console.error("[rate limit]", rateLimitError);
      }
    }

    const { relationship, ageRange, occasion, interests, freetext, budget, giftPreference, attempt, exclude } =
      (await request.json()) as {
        relationship: string;
        ageRange: string;
        occasion: string;
        interests: string[];
        freetext: string;
        budget: string;
        giftPreference: "experiences" | "gifts" | "both";
        attempt: number;
        exclude: string[];
      };

    const budgetLabel = BUDGET_LABELS[budget] ?? budget;
    const interestList = interests.join(", ");

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          // Cache the stable system prompt — saves input tokens on repeated calls
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: GIFT_SCHEMA,
        },
      },
      messages: [
        {
          role: "user",
          content: `Recommend 3 gifts for:
- Recipient: ${relationship}, age range ${ageRange}
- Occasion: ${occasion}
- Interests: ${interestList}
- Budget: ${budgetLabel}${freetext ? `\n- Additional context: ${freetext}` : ""}

${GIFT_PREFERENCE_INSTRUCTIONS[giftPreference] ?? GIFT_PREFERENCE_INSTRUCTIONS.both}${exclude.length > 0 ? `\n\nDo NOT suggest any of the following gifts — they have already been shown to the user:\n${exclude.map((n) => `- ${n}`).join("\n")}\n\nExplore more creative, unexpected options instead.` : ""}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "No response from AI" }, { status: 500 });
    }

    const data = JSON.parse(textBlock.text) as {
      gifts: {
        name: string;
        price: string;
        rationale: string;
        tags: string[];
        affiliateUrl: string;
        type: "product" | "experience";
        store: "amazon" | "etsy" | "viator";
        searchQuery: string;
      }[];
    };

    const gifts = await Promise.all(
      data.gifts.map(async (gift) => {
        const query = gift.searchQuery || gift.name;

        if (gift.store !== "viator") {
          const imageUrl = await fetchPixabayImage(query, gift.tags);
          return { ...gift, imageUrl };
        }

        const listing = await fetchViatorListing(query);
        const imageUrl = listing?.imageUrl ?? (await fetchPixabayImage(query, gift.tags));
        if (!listing) return { ...gift, imageUrl };
        return { ...gift, price: listing.price, affiliateUrl: listing.affiliateUrl, imageUrl };
      })
    );

    // Log session to database — errors here don't affect the user response
    try {
      const sql = getDb();
      await sql`
        INSERT INTO sessions (relationship, age_range, occasion, interests, freetext, budget, gifts, attempt)
        VALUES (
          ${relationship},
          ${ageRange},
          ${occasion},
          ${JSON.stringify(interests)},
          ${freetext ?? ""},
          ${budget},
          ${JSON.stringify(gifts)},
          ${attempt}
        )
      `;
    } catch (dbError) {
      console.error("[session logging]", dbError);
    }

    return Response.json(gifts);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/recommend]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
