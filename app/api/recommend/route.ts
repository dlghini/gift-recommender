import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a thoughtful gift recommendation expert. Given details about a gift recipient, recommend exactly 3 gifts that are genuinely well-suited to them.

Only suggest real products that actually exist and are widely available for purchase. Stick to well-known brands and products you are certain are real — do not invent product names or combine brand names with model numbers you are not sure about.

For each gift provide:
- name: a specific, real product name (e.g. "Kindle Paperwhite" not "e-reader"). Must be a product that genuinely exists.
- price: a realistic price matching the stated budget, formatted as "$X" or "$X–$Y"
- rationale: a warm, personalized rationale (2–3 sentences) explaining why this gift suits this specific person
- tags: 2–4 short interest or theme tags
- affiliateUrl: set to "#"
- searchQuery: a concise 2–5 word Amazon search query that will reliably surface this product or very close alternatives (e.g. "Kindle Paperwhite e-reader" or "Yeti Rambler tumbler"). Keep it broad enough that slight naming variations still return good results.

Make the gifts feel personal and considered. Vary the types across physical items, experiences, and subscriptions where appropriate.`;

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
          searchQuery: { type: "string" },
        },
        required: ["name", "price", "rationale", "tags", "affiliateUrl", "searchQuery"],
        additionalProperties: false,
      },
    },
  },
  required: ["gifts"],
  additionalProperties: false,
};

const BUDGET_LABELS: Record<string, string> = {
  "under-25": "under $25",
  "25-50": "$25–$50",
  "50-100": "$50–$100",
  "100-250": "$100–$250",
  "250+": "$250 or more",
};

export async function POST(request: Request) {
  try {
    const { relationship, ageRange, occasion, interests, freetext, budget, attempt, exclude } =
      (await request.json()) as {
        relationship: string;
        ageRange: string;
        occasion: string;
        interests: string[];
        freetext: string;
        budget: string;
        attempt: number;
        exclude: string[];
      };

    const budgetLabel = BUDGET_LABELS[budget] ?? budget;
    const interestList = interests.join(", ");

    const response = await client.messages.create({
      model: "claude-opus-4-7",
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
- Budget: ${budgetLabel}${freetext ? `\n- Additional context: ${freetext}` : ""}${exclude.length > 0 ? `\n\nDo NOT suggest any of the following gifts — they have already been shown to the user:\n${exclude.map((n) => `- ${n}`).join("\n")}\n\nExplore more creative, unexpected options instead.` : ""}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "No response from AI" }, { status: 500 });
    }

    const data = JSON.parse(textBlock.text) as {
      gifts: { name: string; price: string; rationale: string; tags: string[]; affiliateUrl: string; searchQuery: string }[];
    };

    return Response.json(data.gifts);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/recommend]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
