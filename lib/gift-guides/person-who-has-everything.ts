import type { GiftGuide } from "./types";

export const personWhoHasEverything: GiftGuide = {
  slug: "person-who-has-everything",
  keyword: "gifts for the person who has everything",
  h1: "Gifts for the Person Who Has Everything",
  title: "Gifts for the Person Who Has Everything",
  description:
    "Gift ideas for someone who needs nothing: experiences, consumables that get used up, deeply personal keepsakes, and gifts that give to someone else.",
  intro: [
    "Someone who “has everything” has run out of shelf space, not out of things they would enjoy. The trick is to stop shopping for objects. Give an experience they will talk about, something good enough to use up, a keepsake tied to a specific memory, or a gift that helps someone else in their name.",
    "Consumables are underrated here. A person with a full house will still finish a box of great olive oil, a rare bottle, or a tin of single-origin coffee, and there is nothing left to store afterwards. Personal beats expensive: a photo book from one particular year lands harder than another gadget.",
    "Everything links to a store search rather than one listing. Prices are estimates. If you know one thing they are quietly into, tell the Whisperer about them and get a shorter, sharper list.",
  ],
  sections: [
    {
      heading: "Experiences and time",
      picks: [
        { name: "A meal at a restaurant they have talked about", price: "$50–$300", why: "A tasting menu or a hard-to-book table, ideally with you along.", tags: ["Experience", "Food"], store: "viator", searchQuery: "fine dining experience" },
        { name: "A class in something they keep mentioning", price: "From $50 per person", why: "Pottery, sailing, letterpress, sourdough. The thing they say they would love to try.", tags: ["Experience"], store: "viator", searchQuery: "hands on workshop class" },
        { name: "A local day tour or tasting", price: "From $40 per person", why: "A food walk, a distillery visit, or a guided hike in their own city, which people rarely do at home.", tags: ["Experience", "Travel"], store: "viator", searchQuery: "food walking tour" },
        { name: "Tickets to a show, match, or concert", price: "$40–$200", why: "An evening out beats another object, especially with dinner attached.", tags: ["Experience"], store: "viator", searchQuery: "theatre and show tickets" },
        { name: "A weekend away nearby", price: "$150–$500", why: "One or two nights somewhere within driving distance. A cabin, a coast, a city they have not explored.", tags: ["Experience", "Travel"], store: "viator", searchQuery: "weekend getaway stay" },
      ],
    },
    {
      heading: "Good enough to use up",
      picks: [
        { name: "Small-producer olive oil or pantry set", price: "$30–$80", why: "Single-estate oil, aged vinegar, flaky salt, good honey. A person with a full house will still cook with it.", tags: ["Food", "Luxury"], store: "amazon", searchQuery: "single estate olive oil gift set" },
        { name: "A rare bottle in their category", price: "$50–$150", why: "A wine, whisky, or non-alcoholic spirit a step above what they buy for themselves.", tags: ["Drinks", "Luxury"], store: "amazon", searchQuery: "rare whisky gift bottle" },
        { name: "A serious box of chocolate or confection", price: "$25–$70", why: "Single-origin bars or a bean-to-bar sampler, not a supermarket box.", tags: ["Food"], store: "amazon", searchQuery: "bean to bar chocolate gift box" },
        { name: "A three-month tasting subscription", price: "$40–$120", why: "Coffee, tea, hot sauce, cheese, or cured meat. Arrives, gets enjoyed, leaves nothing to store.", tags: ["Subscription", "Food"], store: "amazon", searchQuery: "gourmet food subscription gift 3 months" },
        { name: "A candle worth burning", price: "$25–$60", why: "A hand-poured candle from a real perfumer. Even a minimalist runs one down.", tags: ["Home", "Luxury"], store: "etsy", searchQuery: "hand poured luxury candle" },
      ],
    },
    {
      heading: "Personal, and giving onward",
      picks: [
        { name: "A photo book from one specific year or trip", price: "$30–$80", why: "Well-designed and printed, about one occasion. Beats a gadget every time.", tags: ["Personalized", "Keepsake"], store: "etsy", searchQuery: "custom photo book hardcover" },
        { name: "A custom star map or coordinates print", price: "$25–$60", why: "The sky on a date that matters to them, or the coordinates of a place they love.", tags: ["Personalized", "Keepsake", "Art"], store: "etsy", searchQuery: "custom star map print date" },
        { name: "An engraved keepsake box or pen", price: "$30–$90", why: "One well-made object with their initials, for the desk or the shelf.", tags: ["Personalized", "Keepsake", "Luxury"], store: "etsy", searchQuery: "personalized wooden keepsake box engraved" },
        { name: "A donation in their name to a cause they back", price: "$25–$150", why: "For the person who genuinely needs nothing. Pick a cause they actually care about and pair it with a card.", tags: ["Keepsake"], store: "amazon", searchQuery: "charity gift donation card" },
        { name: "A tree, hive, or animal sponsored in their name", price: "$30–$100", why: "A symbolic gift with a certificate. Sentimental without adding to the shelf.", tags: ["Keepsake", "Experience"], store: "amazon", searchQuery: "sponsor a tree gift certificate" },
      ],
    },
  ],
  faq: [
    { q: "What do you buy for someone who has everything?", a: "Something that is not an object to keep. An experience like a dinner, a class, or a weekend away. A consumable good enough to enjoy and finish. A personal keepsake tied to one memory. Or a donation in their name to a cause they care about." },
    { q: "They say “don't get me anything.” Should I listen?", a: "Half listen. Skip the stuff, but a small consumable, a shared experience, or a donation with a handwritten card almost always lands well. Doing nothing usually reads as forgetting." },
    { q: "What is a good sentimental gift for them?", a: "A photo book about one particular year or trip, a custom star map or coordinates print for a date that matters, or an engraved keepsake box. Personal beats expensive here." },
    { q: "Under $50?", a: "A small-producer pantry set, a serious box of chocolate, a photo book, a custom print, a good candle, or the first months of a tasting subscription." },
  ],
  related: ["men-who-have-everything", "wine-lovers", "coffee-lovers"],
  updated: "2026-08-27",
};
