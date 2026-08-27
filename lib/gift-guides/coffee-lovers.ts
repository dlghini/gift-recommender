import type { GiftGuide } from "./types";

export const coffeeLovers: GiftGuide = {
  slug: "coffee-lovers",
  keyword: "gifts for coffee lovers",
  h1: "Gifts for Coffee Lovers",
  title: "Gifts for Coffee Lovers",
  description:
    "Gift ideas for coffee lovers: brewing gear that changes the cup, ritual upgrades, and single-origin subscriptions. Curated, with a reason for each pick.",
  intro: [
    "Coffee lovers split into two camps, and the right gift depends on which one you are shopping for. Someone still finding their way wants gear: a pour-over set, an AeroPress, and above all a burr grinder, which is the single biggest jump in cup quality. Someone already deep in it wants beans and refinement, not another brewer.",
    "For the second camp, go around the machine. Fresh single-origin coffee on a subscription, a cupping class, a scale that weighs the pour to the gram. The espresso setup is settled; the beans, the grind, and the ritual are where it still gets better.",
    "Everything below links to a store search, not one listing, so it survives a product selling out. Prices are estimates. If you are not sure which camp your coffee lover is in, tell the Whisperer about them and get a shorter list.",
  ],
  sections: [
    {
      heading: "Better brewing",
      picks: [
        { name: "Fellow Stagg EKG electric kettle", price: "$150–$195", why: "Gooseneck spout and to-the-degree temperature control, which is what pour-over people actually want.", tags: ["Coffee", "Kitchen"], store: "amazon", searchQuery: "fellow stagg ekg electric kettle" },
        { name: "Hario V60 pour-over set with server", price: "$30–$50", why: "The classic starting point for manual brewing, and a clear step up from a drip machine.", tags: ["Coffee", "Kitchen"], store: "amazon", searchQuery: "hario v60 pour over set server" },
        { name: "AeroPress Original", price: "$35–$45", why: "Nearly unbreakable, fast, and forgiving. Good for a desk, a small kitchen, or travel.", tags: ["Coffee", "Practical"], store: "amazon", searchQuery: "aeropress coffee maker original" },
        { name: "Burr coffee grinder", price: "$100–$170", why: "The single biggest jump in cup quality for anyone still using a blade grinder. A Baratza Encore-class model is the safe pick.", tags: ["Coffee", "Kitchen"], store: "amazon", searchQuery: "baratza encore burr coffee grinder" },
        { name: "Coffee scale with timer", price: "$25–$150", why: "Weighs the dose and the pour to a tenth of a gram. For the person who has started saying “brew ratio.”", tags: ["Coffee", "Practical"], store: "amazon", searchQuery: "coffee scale with timer 0.1g" },
      ],
    },
    {
      heading: "For the daily ritual",
      picks: [
        { name: "Fellow Carter Move insulated mug", price: "$30–$38", why: "Leakproof, holds coffee hot for hours, and does not make it taste like a thermos.", tags: ["Coffee", "Practical"], store: "amazon", searchQuery: "fellow carter move mug" },
        { name: "Hand-thrown ceramic mug", price: "$28–$55", why: "A mug they would actually choose to hold, not a freebie from a conference.", tags: ["Coffee", "Home", "Keepsake"], store: "etsy", searchQuery: "handmade ceramic coffee mug stoneware" },
        { name: "Engraved wooden coffee scoop", price: "$20–$45", why: "Small, genuinely useful, and personalized so it reads as a gift rather than a kitchen tool.", tags: ["Coffee", "Personalized"], store: "etsy", searchQuery: "personalized coffee scoop engraved wood" },
        { name: "Coffee origin map print", price: "$20–$40", why: "A map of the world's coffee-growing regions, sized for the kitchen wall.", tags: ["Coffee", "Art", "Home"], store: "etsy", searchQuery: "coffee origin map print kitchen" },
        { name: "Reusable metal filter", price: "$12–$20", why: "Cuts the paper habit, shifts the cup slightly heavier, and costs almost nothing. Made for V60 or AeroPress.", tags: ["Coffee", "Practical"], store: "amazon", searchQuery: "reusable metal aeropress filter" },
      ],
    },
    {
      heading: "Beans, subscriptions, experiences",
      picks: [
        { name: "Specialty coffee subscription", price: "$20–$100", why: "Fresh single-origin from rotating roasters, matched to how they take it. Trade, Atlas, and Bean Box all do gift plans.", tags: ["Coffee", "Subscription"], store: "amazon", searchQuery: "trade coffee subscription gift" },
        { name: "Single-origin bean sampler", price: "$25–$45", why: "Three or four bags from a top roaster, meant to be brewed side by side.", tags: ["Coffee", "Food"], store: "amazon", searchQuery: "single origin coffee sampler gift set" },
        { name: "Local roaster gift card", price: "$25–$75", why: "Supports the shop they already like and covers whatever new lot they have been eyeing.", tags: ["Coffee", "Personalized"], store: "amazon", searchQuery: "coffee shop gift card" },
        { name: "Coffee tasting or latte-art class", price: "From $40 per person", why: "A hands-on session at a local roastery, for the person who wants to get properly nerdy about it.", tags: ["Coffee", "Experience"], store: "viator", searchQuery: "coffee tasting class" },
        { name: "Coffee farm or roastery tour", price: "From $35 per person", why: "Where available, a walk through how the beans get from cherry to cup.", tags: ["Coffee", "Experience", "Travel"], store: "viator", searchQuery: "coffee plantation tour" },
      ],
    },
  ],
  faq: [
    { q: "What do you get a coffee lover who already has an espresso machine?", a: "Go around the machine. Fresh single-origin beans on a subscription, a proper burr grinder if they are still using a blade one, a cupping class, or a hand-thrown mug worth reaching for. The machine is settled; the beans and the grind are where the cup still improves." },
    { q: "Is a mug too boring a gift for a coffee lover?", a: "A generic mug, yes. A hand-thrown ceramic one they would actually choose, or an insulated travel mug that keeps coffee hot for hours without a metallic taste, is a mug they will use every day. The line is between a freebie and something made." },
    { q: "What is a good coffee gift under $30?", a: "A specialty coffee subscription's first month, a single-origin sampler, a reusable metal filter, a bag of beans from a roaster they have not tried, or an engraved wooden scoop. Plenty lands well below $30." },
    { q: "Beans or gear?", a: "If they already brew, beans, because they run out and gear does not. If they are just getting into it, one good piece of gear, usually a burr grinder or a pour-over set, moves the cup more than anything else." },
  ],
  related: ["book-lovers", "wine-lovers", "person-who-has-everything"],
  updated: "2026-08-27",
};
