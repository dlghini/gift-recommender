import type { GiftGuide } from "./types";

export const bookLovers: GiftGuide = {
  slug: "book-lovers",
  keyword: "gifts for book lovers",
  h1: "Gifts for Book Lovers",
  title: "Gifts for Book Lovers",
  description:
    "Gift ideas for the reader in your life: reading-nook upgrades, bookish keepsakes, and subscriptions worth renewing. Curated, with a reason for each pick.",
  intro: [
    "Book lovers are one of the easier people to shop for and one of the easiest to get wrong. The trap is buying them a book. Unless you know exactly what is on their to-be-read list, a book is a coin flip, and a duplicate is worse than nothing.",
    "The gifts that work sit around the reading: better light, back support, a warm blanket, a way to keep the tea hot. Then there are keepsakes, which only land when they point at a specific book or author rather than generic “reader” merch. And for the person who already owns everything, an audiobook membership or a literary tour is something they probably do not.",
    "Everything below links to a store search rather than a single listing, so it still works if a version sells out. Prices are estimates. If none of it fits the reader you have in mind, tell the Whisperer about them and get a shorter list.",
  ],
  sections: [
    {
      heading: "For the reading nook",
      picks: [
        { name: "Rechargeable clip-on book light", price: "$16–$28", why: "A warm, adjustable light that clips to the page, so they can read in bed without lighting the whole room.", tags: ["Reading", "Practical"], store: "amazon", searchQuery: "rechargeable clip on book light warm" },
        { name: "Weighted reading blanket", price: "$45–$80", why: "Turns the couch into the reading spot. Heavy enough to feel like a hug, breathable enough for a long session.", tags: ["Reading", "Home"], store: "amazon", searchQuery: "weighted blanket 15 lb" },
        { name: "Bed rest reading pillow with arms", price: "$35–$55", why: "Back support for people who read sitting up in bed for hours. The arms hold a mug or a paperback.", tags: ["Reading", "Home"], store: "amazon", searchQuery: "bed rest reading pillow with arms" },
        { name: "Adjustable book stand", price: "$20–$35", why: "Props the book open at an angle so their hands are free for tea, notes, or nothing at all.", tags: ["Reading", "Practical"], store: "amazon", searchQuery: "adjustable book stand holder" },
        { name: "Electric mug warmer", price: "$18–$30", why: "The tea goes cold three chapters in. This holds it at drinking temperature without a thought.", tags: ["Reading", "Coffee"], store: "amazon", searchQuery: "electric mug warmer coaster" },
      ],
    },
    {
      heading: "Bookish keepsakes",
      picks: [
        { name: "Literary-scented candle (Frostbeard Studio)", price: "$20–$28", why: "Candles named after books and libraries: “Old Books,” “Reading at the Cafe,” “Cliffhanger.” A small, specific delight.", tags: ["Books", "Keepsake", "Home"], store: "etsy", searchQuery: "frostbeard literary candle old books" },
        { name: "Personalized library embosser", price: "$28–$45", why: "Stamps “From the library of ___” into the title page. It makes their books unmistakably theirs.", tags: ["Books", "Personalized", "Keepsake"], store: "etsy", searchQuery: "personalized book embosser from the library of" },
        { name: "Custom leather bookmark", price: "$12–$25", why: "Hand-stitched and monogrammed, and far less likely to be lost than a receipt or a boarding pass.", tags: ["Books", "Personalized"], store: "etsy", searchQuery: "personalized leather bookmark monogram" },
        { name: "Book darts (tin of 50)", price: "$10–$16", why: "Thin metal markers that clip to a single line, not just a page. For the reader who annotates in their head.", tags: ["Books", "Practical"], store: "amazon", searchQuery: "book darts line markers tin" },
        { name: "Literary first-line art print", price: "$18–$40", why: "A print of a favorite book's opening line, or a map of a fictional world, sized to frame for the shelf wall.", tags: ["Books", "Art", "Home"], store: "etsy", searchQuery: "literary first line print book quote poster" },
      ],
    },
    {
      heading: "For the to-be-read pile: books, subscriptions, experiences",
      picks: [
        { name: "Book of the Month membership", price: "$50–$120", why: "A hardcover they choose from five picks each month. Good for readers who want new releases without the paralysis of a full bookstore.", tags: ["Books", "Subscription"], store: "amazon", searchQuery: "book of the month gift membership" },
        { name: "Kindle Paperwhite", price: "$140–$180", why: "Waterproof, warm backlight, weeks of battery. The right pick when their stack has outgrown the nightstand.", tags: ["Books", "Tech"], store: "amazon", searchQuery: "kindle paperwhite" },
        { name: "Libro.fm audiobook gift membership", price: "$15–$90", why: "Audiobook credits that support an independent bookstore of their choice. For commuters and dog-walkers who still want to read.", tags: ["Books", "Subscription"], store: "amazon", searchQuery: "libro.fm audiobook gift membership" },
        { name: "Independent bookstore gift card", price: "$25–$100", why: "Let them browse their favorite local shop. Bookshop.org works if they do not have one nearby.", tags: ["Books", "Personalized"], store: "amazon", searchQuery: "bookshop.org gift card" },
        { name: "Literary walking tour", price: "From $25 per person", why: "A guided walk through a city's literary landmarks, or a tour tied to one author. Something the reader who owns every book does not have.", tags: ["Books", "Experience", "Travel"], store: "viator", searchQuery: "literary walking tour" },
      ],
    },
  ],
  faq: [
    { q: "What do you get a book lover who already has everything?", a: "Move away from objects. An audiobook or Book of the Month membership keeps giving after the wrapping is gone, and a literary walking tour is something they almost certainly do not own. A gift card to their favorite independent bookstore also works, because for them the fun is the browsing." },
    { q: "What is a good gift for someone who only reads ebooks?", a: "Skip physical books. A Kindle Paperwhite upgrade, an audiobook membership, a warm clip-on light for older Kindles that lack a backlight, or bookish decor and candles that celebrate reading without adding to a shelf." },
    { q: "Are book-themed candles and decor a safe gift, or too generic?", a: "They land when they are specific. A candle named after an actual book, or a print of a favorite opening line, feels personal. A mug that just says “Book Nerd” does not. Aim for the specific end." },
    { q: "How much should I spend on a gift for a book lover?", a: "Most picks here sit between $15 and $50, which covers keepsakes, reading accessories, and a short subscription. A Kindle or a longer membership runs $120 to $180 if you want the gift to be the main event." },
  ],
  related: ["coffee-lovers", "wine-lovers", "person-who-has-everything"],
  updated: "2026-08-27",
};
