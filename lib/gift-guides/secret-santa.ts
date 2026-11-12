import type { GiftGuide } from "./types";

export const secretSanta: GiftGuide = {
  slug: "secret-santa",
  keyword: "secret santa gifts",
  h1: "Secret Santa Gifts",
  title: "Secret Santa Gifts",
  description:
    "Secret Santa ideas for coworkers and friends you do not know well: safe picks, desk picks, and small personal ones, mostly under $30. Each has a reason.",
  intro: [
    "Secret Santa gives you one name and a budget, which is harder than it sounds when the name is a coworker you have only seen on calls. The goal is a gift that is good for nearly anyone, a little more thoughtful than a gift card, and clearly within the limit.",
    "That points to a few safe categories. Comforts like candles, chocolate, and warm socks work for most people. Desk items get used right away at the office. And small personal gifts show that you paid some attention, like an ornament with their name or a puzzle for the holidays.",
    "Everything below links to a store search rather than one listing, so it still works if a version sells out. Prices are estimates. If you know one thing about the person you drew, tell the Whisperer and get a shorter list built around them.",
  ],
  sections: [
    {
      heading: "Safe for almost anyone",
      picks: [
        { name: "Soy candle in a neutral scent", price: "$15–$30", why: "Pick something like cedar, vanilla, or clean linen. Strong or unusual scents divide people, and this one does not.", tags: ["Home"], store: "amazon", searchQuery: "soy candle gift cedar" },
        { name: "Assorted chocolate box", price: "$15–$25", why: "Nearly everyone eats chocolate, and a box is easy to share at the office. Check for nut allergies if you can.", tags: ["Food"], store: "amazon", searchQuery: "ghirardelli assorted chocolate gift box" },
        { name: "Mug and coffee or tea set", price: "$20–$35", why: "A good mug paired with something to put in it. Easy to get right, and it looks nice on a desk.", tags: ["Coffee", "Tea"], store: "amazon", searchQuery: "coffee mug gift set" },
        { name: "Cozy socks gift set", price: "$15–$25", why: "Soft, warm, and sized to fit most feet. A good pick when you do not know anything about the person.", tags: ["Fashion", "Home"], store: "amazon", searchQuery: "fuzzy socks gift set" },
        { name: "Hand cream trio", price: "$15–$30", why: "Dry hands are common in winter, and a small set is a gift people use up. Pick unscented if you are unsure.", tags: ["Practical"], store: "amazon", searchQuery: "hand cream gift set" },
      ],
    },
    {
      heading: "For the desk or the home office",
      picks: [
        { name: "Desk succulent in a pot", price: "$15–$25", why: "A plant that is hard to kill and does not need much light. Adds a little life to a cubicle or a shelf.", tags: ["Plants", "Home"], store: "amazon", searchQuery: "desk succulent gift potted" },
        { name: "Leather desk pad", price: "$20–$35", why: "A large mat for the keyboard and mouse. It makes a desk look tidier and gets used every day.", tags: ["Practical", "Home"], store: "amazon", searchQuery: "leather desk pad mat" },
        { name: "Insulated water bottle", price: "$25–$40", why: "A 24 oz bottle that keeps water cold all day. Useful for anyone who sits at a desk or travels.", tags: ["Practical", "Fitness"], store: "amazon", searchQuery: "insulated water bottle 24 oz" },
        { name: "Fast wireless charging pad", price: "$15–$30", why: "Works with most recent phones and clears a charging cable off the desk. A small gift that gets used daily.", tags: ["Tech", "Practical"], store: "amazon", searchQuery: "wireless charging pad" },
        { name: "Leuchtturm1917 notebook", price: "$20–$28", why: "A well-made hardcover notebook with numbered pages. For anyone who takes notes, plans, or doodles in meetings.", tags: ["Creative", "Practical"], store: "amazon", searchQuery: "leuchtturm1917 notebook" },
      ],
    },
    {
      heading: "Small and a little personal",
      picks: [
        { name: "Personalized Christmas ornament", price: "$12–$25", why: "Their name or initial on a small ornament. Feels thoughtful, takes seconds to open, and is easy to keep.", tags: ["Personalized", "Keepsake"], store: "etsy", searchQuery: "personalized christmas ornament" },
        { name: "Engraved pen", price: "$12–$25", why: "A good pen with their name on it. Works for anyone who signs things, writes notes, or likes small upgrades.", tags: ["Personalized", "Practical"], store: "etsy", searchQuery: "personalized engraved pen" },
        { name: "Air plant gift set", price: "$15–$30", why: "A few small plants that need only a bit of water. Good for a person with limited space.", tags: ["Plants", "Home"], store: "etsy", searchQuery: "air plant gift set" },
        { name: "Coffee sampler set", price: "$20–$40", why: "Several small bags from different roasters. Let them find a new favorite without a big commitment.", tags: ["Coffee", "Food"], store: "amazon", searchQuery: "coffee sampler gift set" },
        { name: "1,000-piece jigsaw puzzle", price: "$15–$25", why: "Something to do over the holidays that is not a screen. Pick a calm scene like a landscape or a library.", tags: ["Gaming", "Home"], store: "amazon", searchQuery: "1000 piece jigsaw puzzle" },
      ],
    },
  ],
  faq: [
    { q: "How much should a Secret Santa gift cost?", a: "Follow the limit your group set. Office exchanges often land between $15 and $30. It is better to spend a little under and add a thoughtful note than to go over and make others feel awkward." },
    { q: "What are good Secret Santa gifts for coworkers?", a: "Pick something nearly anyone would use: a candle, chocolate, a mug set, a desk plant, or a good notebook. Skip anything personal, like clothing sizes or fragrances, and be careful with alcohol unless your workplace allows it." },
    { q: "What should I get a Secret Santa I barely know?", a: "Choose a safe category from the first section and add one small personal touch, like a handwritten note. If you can learn one fact about them, like a favorite drink or a hobby, use it to narrow the list." },
    { q: "Is Secret Santa the same as white elephant?", a: "No. In Secret Santa you buy for one specific person you drew, so you can match the gift to them. [White elephant](/gifts-for/white-elephant) is a game where everyone brings a gift and people open or steal them, so the gift is not for anyone in particular." },
  ],
  related: ["white-elephant", "person-who-has-everything", "coffee-lovers"],
  published: "2026-11-11",
  updated: "2026-11-11",
};
