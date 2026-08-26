export const RELATIONSHIPS = [
  "Husband",
  "Wife",
  "Boyfriend",
  "Girlfriend",
  "Partner",
  "Mother",
  "Father",
  "Brother",
  "Sister",
  "Child",
  "Friend",
  "Other",
] as const;

export type Relationship = (typeof RELATIONSHIPS)[number];

/** Relationship values whose partner-type profile also collects an anniversary date. */
export const PARTNER_RELATIONSHIPS: string[] = ["Husband", "Wife", "Boyfriend", "Girlfriend", "Partner"];

const RELATIONSHIP_EMOJI: Record<string, string> = {
  Husband: "🤵",
  Wife: "👰",
  Boyfriend: "💑",
  Girlfriend: "💑",
  Partner: "💞",
  Mother: "👩",
  Father: "👨",
  Brother: "🧑",
  Sister: "👧",
  Child: "🧒",
  Friend: "🙂",
  Other: "⭐",
};

export function pickRelationshipEmoji(relationship: string): string {
  return RELATIONSHIP_EMOJI[relationship] ?? "⭐";
}
