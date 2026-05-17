import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a thoughtful gift recommendation expert. Given details about a gift recipient, recommend exactly 3 gifts that are genuinely well-suited to them.

For each gift provide:
- A specific, real product name (not generic — e.g. "Kindle Paperwhite" not "e-reader")
- A realistic price matching the stated budget, formatted as "$X" or "$X–$Y"
- A warm, personalized rationale (2–3 sentences) explaining why this gift suits this specific person
- 2–4 short interest or theme tags
- affiliateUrl set to "#"

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
        },
        required: ["name", "price", "rationale", "tags", "affiliateUrl"],
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
    const { relationship, ageRange, occasion, interests, freetext, budget, attempt } =
      (await request.json()) as {
        relationship: string;
        ageRange: string;
        occasion: string;
        interests: string[];
        freetext: string;
        budget: string;
        attempt: number;
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
- Budget: ${budgetLabel}${freetext ? `\n- Additional context: ${freetext}` : ""}${attempt > 1 ? `\n\nThis is regeneration #${attempt - 1}. You must suggest completely different gifts from any previous recommendations — avoid your most predictable or obvious picks for this profile and explore more creative, unexpected options.` : ""}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "No response from AI" }, { status: 500 });
    }

    const data = JSON.parse(textBlock.text) as {
      gifts: { name: string; price: string; rationale: string; tags: string[]; affiliateUrl: string }[];
    };

    return Response.json(data.gifts);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/recommend]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
