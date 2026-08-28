import type { GiftGuide } from "./types";
import { bookLovers } from "./book-lovers";
import { coffeeLovers } from "./coffee-lovers";
import { dogLovers } from "./dog-lovers";
import { catLovers } from "./cat-lovers";
import { wineLovers } from "./wine-lovers";
import { menWhoHaveEverything } from "./men-who-have-everything";
import { personWhoHasEverything } from "./person-who-has-everything";
import { peopleWhoGrewUpInThe70s } from "./people-who-grew-up-in-the-70s";
import { peopleWhoGrewUpInThe80s } from "./people-who-grew-up-in-the-80s";
import { peopleWhoGrewUpInThe90s } from "./people-who-grew-up-in-the-90s";

// Order here is the order they appear on the /gifts-for index.
export const GIFT_GUIDES: GiftGuide[] = [
  bookLovers,
  coffeeLovers,
  wineLovers,
  dogLovers,
  catLovers,
  menWhoHaveEverything,
  personWhoHasEverything,
  peopleWhoGrewUpInThe80s,
  peopleWhoGrewUpInThe90s,
  peopleWhoGrewUpInThe70s,
];

const BY_SLUG = new Map(GIFT_GUIDES.map((g) => [g.slug, g]));

export function getGuide(slug: string): GiftGuide | undefined {
  return BY_SLUG.get(slug);
}

export function allGuideSlugs(): string[] {
  return GIFT_GUIDES.map((g) => g.slug);
}

export type { GiftGuide } from "./types";
