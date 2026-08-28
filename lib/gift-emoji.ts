// Emoji fallback for a gift with no usable photo. Same idea as the maps in the
// wizard and landing page, extended with a few interest tags the guides use.
export const TAG_EMOJI: Record<string, string> = {
  Cooking: "🍳", Travel: "✈️", Fitness: "💪", Gaming: "🎮",
  Reading: "📚", Books: "📚", Music: "🎵", Art: "🎨", Outdoors: "🏕️",
  Tech: "💻", Fashion: "👗", Kitchen: "🍳", Creative: "✏️",
  Mindfulness: "🧘", Practical: "⚙️", Food: "🍽️", Coffee: "☕",
  Wine: "🍷", Tea: "🫖", Pets: "🐾", Dogs: "🐶", Cats: "🐱",
  Garden: "🪴", Home: "🏠", Personalized: "🎀", Keepsake: "🎀",
  Experience: "🎟️", Luxury: "✨", Drinks: "🥂", Subscription: "📦",
  Retro: "📼",
};

export function pickEmoji(tags: string[]): string {
  for (const tag of tags) {
    if (TAG_EMOJI[tag]) return TAG_EMOJI[tag];
  }
  return "🎁";
}
