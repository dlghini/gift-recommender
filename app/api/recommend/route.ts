import Anthropic from "@anthropic-ai/sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getDb } from "@/lib/db";
import { fetchPixabayImage } from "@/lib/pixabay";
import { logRunEvent, isValidRunId } from "@/lib/run-events";

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

// The LLM produces a ranked candidate pool; we show the top SHOWN_COUNT and keep
// the rest (unenriched) so a future re-ranker has something to re-rank. Logging
// the full pool now is the one thing we can't backfill later.
const CANDIDATE_POOL_SIZE = 12;
const SHOWN_COUNT = 3;

// Sandbox and production keys only authenticate against their matching host.
const VIATOR_API_BASE =
  process.env.NODE_ENV === "production" ? "https://api.viator.com/partner" : "https://api.sandbox.viator.com/partner";

const SYSTEM_PROMPT = `You are a thoughtful gift recommendation expert. Given details about a gift recipient, recommend a ranked list of exactly ${CANDIDATE_POOL_SIZE} gifts (best fit first) that are genuinely well-suited to them. Return all ${CANDIDATE_POOL_SIZE}. Vary the list across price points, categories, and a mix of safe and slightly unexpected picks.

Only suggest real products or experiences that actually exist and are widely available for purchase/booking. Stick to well-known brands and real, bookable experience types — do not invent product names or combine brand names with model numbers you are not sure about.

For each gift provide:
- name: a specific, real product name (e.g. "Kindle Paperwhite" not "e-reader") or a specific experience type (e.g. "Sunset Sailing Cruise" not "boat activity")
- price: a realistic price matching the stated budget, formatted as "$X" or "$X–$Y". For experiences, this is a placeholder — real pricing is fetched separately.
- rationale: a warm, personalized rationale (2–3 sentences) explaining why this gift suits this specific person. Use plain punctuation: no em dashes, use commas or periods instead
- tags: 2–4 short interest or theme tags
- affiliateUrl: set to "#"
- type: either "product" or "experience". Use "experience" for real, in-person bookable tours, classes, activities, workshops, or tastings. Use "product" for physical items.
- store: "etsy" for handmade, personalized, custom, artisan, vintage, or unique physical items. "amazon" for mainstream branded products, electronics, books, fitness equipment, and anything mass-produced. "viator" for any "experience"-type gift. Viator's catalog is in-person only — do not suggest purely virtual/online-only experiences (e.g. a "virtual cooking class" or "online workshop") for this store, since there's no real inventory for those and the resulting link will be irrelevant.
- searchQuery: the exact text a shopper would type into the store's own search box so the results page fills with the right item. Write it the way someone searches, not the way a catalog titles a listing. Rules:
    * 2 to 6 words. Lead with the concrete object, then the 1-2 attributes that matter most (material, style, format, "personalized", "for <interest>").
    * If "name" is a specific real product you are confident exists (e.g. "Yeti Rambler", "Lodge Cast Iron Skillet", "Kindle Paperwhite"), the searchQuery should surface THAT product: use the distinctive part of its name. Never pair a brand with a model number you are guessing at.
    * If "name" is more of a product type, or the item is niche, or you are not fully sure it exists under that exact name, use a broad category query instead ("linen throw blanket", not "stonewashed Belgian flax lumbar throw"; "over-ear gaming headset", not an invented model).
    * Drop filler words: "great", "unique", "perfect", "best", "gift for", "high quality".
    * By store — amazon: category + key attributes ("cast iron tea kettle", "weighted blanket 15 lb", "beginner watercolor set"). etsy: material or technique + object + personalization/style ("personalized cutting board", "hand poured soy candle set", "custom star map print"). viator: the activity type only, never a city or country ("sunset sailing cruise", "pasta making class", "wine tasting tour").

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
  experiences: "The user said they're shopping for someone who prefers experiences over physical gifts. Every recommendation must be type \"experience\".",
  gifts: "The user said they're shopping for someone who prefers physical gifts over experiences. Every recommendation must be type \"product\".",
  both: "The user said this person likes both experiences and physical gifts. Roughly a quarter of the recommendations should be type \"experience\", the rest type \"product\".",
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

    const body = (await request.json()) as {
      relationship: string;
      ageRange: string;
      occasion: string;
      interests: string[];
      freetext: string;
      budget: string;
      giftPreference: "experiences" | "gifts" | "both";
      attempt: number;
      exclude: string[];
      runId?: string;
      isInternal?: boolean;
      questionMeta?: unknown;
    };
    const { relationship, ageRange, occasion, interests, freetext, budget, giftPreference, attempt, exclude } = body;
    const runId = isValidRunId(body.runId) ? body.runId : null;
    const isInternal = body.isInternal === true;

    const budgetLabel = BUDGET_LABELS[budget] ?? budget;
    const interestList = interests.join(", ");

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3500,
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
          content: `Recommend ${CANDIDATE_POOL_SIZE} gift ideas, ranked best fit first, for:
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

    // Enrich only the SHOWN_COUNT we'll display (images + real Viator pricing).
    // The rest of the pool is kept raw for a future re-ranker.
    const shownRaw = data.gifts.slice(0, SHOWN_COUNT);
    const restRaw = data.gifts.slice(SHOWN_COUNT);

    const gifts = await Promise.all(
      shownRaw.map(async (gift) => {
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

    const candidates = [
      ...gifts.map((g, i) => ({ ...g, shown: true, position: i })),
      ...restRaw.map((g, i) => ({ ...g, shown: false, position: SHOWN_COUNT + i })),
    ];

    // Log session to database — errors here don't affect the user response
    try {
      const sql = getDb();
      await sql`
        INSERT INTO sessions (
          relationship, age_range, occasion, interests, freetext, budget, gifts, attempt,
          run_id, candidates, is_internal, question_meta
        )
        VALUES (
          ${relationship}, ${ageRange}, ${occasion}, ${JSON.stringify(interests)},
          ${freetext ?? ""}, ${budget}, ${JSON.stringify(gifts)}, ${attempt},
          ${runId}, ${JSON.stringify(candidates)}, ${isInternal},
          ${body.questionMeta ? JSON.stringify(body.questionMeta) : null}
        )
      `;
      if (runId) {
        await logRunEvent(sql, runId, "recommend_generated", {
          attempt,
          poolSize: data.gifts.length,
          isInternal,
        });
      }
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
