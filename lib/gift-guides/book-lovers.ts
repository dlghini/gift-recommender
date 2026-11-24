import type { GiftGuide } from "./types";

export const bookLovers: GiftGuide = {
  slug: "book-lovers",
  keyword: "gifts for book lovers",
  h1: "Gifts for Book Lovers",
  title: "Gifts for Book Lovers",
  description:
    "Gift ideas for the reader in your life: reading-nook upgrades, bookish keepsakes, and subscriptions worth renewing. Curated, with a reason for each pick.",
  intro: [
    "Book lovers are easy to shop for and easy to get wrong, and the usual mistake is buying them a book. Unless you know what is on their to-be-read list, a book is a coin flip, and a duplicate is worse than nothing.",
    "Our short answer: buy something that sits around the reading. A bookstore gift card is the safest pick here. For a reader who already owns the nice things, we would choose the reading pillow or the library embosser. We would skip the weighted blanket unless you know they run cold, and we would only buy a Kindle for someone who already reads on a screen.",
    "Below are 15 ideas in three groups, each with a line on the kind of reader it suits. Every link goes to a store search rather than one listing, so you can pick the version you like, and prices are estimates. If none of it fits, [tell the Whisperer about them](/wizard) and get a shorter, sharper list.",
  ],
  sections: [
    {
      heading: "For the reading nook",
      picks: [
        { name: "Rechargeable clip-on book light", price: "$16–$28", why: "A light that clips to the page so they can read in bed without lighting the whole room. Buy a warm-toned one, because a cold white beam is harsh at midnight.", bestFor: "Readers who share a bed with someone who sleeps early.", tags: ["Reading", "Practical"], store: "amazon", searchQuery: "rechargeable clip on book light warm" },
        { name: "Weighted reading blanket", price: "$45–$80", why: "Turns the couch into the reading spot. Weighted blankets run warm, so ask first, and for someone who sleeps hot a plain wool throw is the better gift.", bestFor: "Readers who are always cold.", tags: ["Reading", "Home"], store: "amazon", searchQuery: "weighted blanket 15 lb" },
        { name: "Bed rest reading pillow with arms", price: "$35–$55", why: "Our pick for this section. It props up the back and the arms hold a mug or a paperback, which is the thing people sitting up in bed for hours actually complain about.", bestFor: "Readers who finish most books in bed.", tags: ["Reading", "Home"], store: "amazon", searchQuery: "bed rest reading pillow with arms" },
        { name: "Adjustable book stand", price: "$20–$35", why: "Props the book open at an angle so their hands are free for tea or notes. Most useful for heavy hardcovers and cookbooks, so skip it for a paperback reader.", bestFor: "Readers with big hardcovers or a habit of taking notes.", tags: ["Reading", "Practical"], store: "amazon", searchQuery: "adjustable book stand holder" },
        { name: "Electric mug warmer", price: "$18–$30", why: "The tea goes cold three chapters in. This holds it at drinking temperature, but it only works with a flat-bottomed mug, so check what they drink from.", bestFor: "Slow readers who always have a mug nearby.", tags: ["Reading", "Coffee"], store: "amazon", searchQuery: "electric mug warmer coaster" },
      ],
    },
    {
      heading: "Bookish keepsakes",
      picks: [
        { name: "Literary-scented candle (Frostbeard Studio)", price: "$20–$28", why: "Candles named after books and libraries: “Old Books,” “Reading at the Cafe,” “Cliffhanger.” A small, specific delight, and a safe add-on to a bigger gift.", bestFor: "Readers who already have a shelf of candles.", tags: ["Books", "Keepsake", "Home"], store: "etsy", searchQuery: "frostbeard literary candle old books" },
        { name: "Personalized library embosser", price: "$28–$45", why: "Stamps “From the library of ___” into the title page. The best keepsake on this page, but only for someone who owns their books rather than borrowing them.", bestFor: "Readers who buy books and lend them out.", tags: ["Books", "Personalized", "Keepsake"], store: "etsy", searchQuery: "personalized book embosser from the library of" },
        { name: "Custom leather bookmark", price: "$12–$25", why: "Hand-stitched and monogrammed, and far less likely to be lost than a receipt or a boarding pass. Small, so it works best next to another gift.", bestFor: "Readers who use whatever is nearby as a bookmark.", tags: ["Books", "Personalized"], store: "etsy", searchQuery: "personalized leather bookmark monogram" },
        { name: "Book darts (tin of 50)", price: "$10–$16", why: "Thin metal markers that clip to a single line, not just a page. A niche pick: only buy them for someone who marks passages, because most readers will never open the tin.", bestFor: "Readers who annotate or collect quotes.", tags: ["Books", "Practical"], store: "amazon", searchQuery: "book darts line markers tin" },
        { name: "Literary first-line art print", price: "$18–$40", why: "A print of a favorite book's opening line, or a map of a fictional world, sized to frame for the shelf wall. It only works if you know the book, so find out their favorite first.", bestFor: "Readers with a favorite book they would reread.", tags: ["Books", "Art", "Home"], store: "etsy", searchQuery: "literary first line print book quote poster" },
      ],
    },
    {
      heading: "For the to-be-read pile: books, subscriptions, experiences",
      picks: [
        { name: "Book of the Month membership", price: "$50–$120", why: "A hardcover they choose from a handful of new releases each month. Good for readers who want current books without the paralysis of a full bookstore, and a poor fit for someone who mostly reads older or niche titles.", bestFor: "Readers who keep up with new fiction.", tags: ["Books", "Subscription"], store: "amazon", searchQuery: "book of the month gift membership" },
        { name: "Kindle Paperwhite", price: "$140–$180", why: "Waterproof, warm backlight, weeks of battery. Buy it for someone whose stack has outgrown the nightstand or who already reads on a phone. Handing one to a print loyalist can read like a hint.", bestFor: "Readers who travel a lot or already read on a screen.", tags: ["Books", "Tech"], store: "amazon", searchQuery: "kindle paperwhite" },
        { name: "Libro.fm audiobook gift membership", price: "$15–$90", why: "Audiobook credits that support an independent bookstore of their choice. Worth giving only if they already listen to audiobooks, because a gift they never start is wasted.", bestFor: "Commuters and dog-walkers who still want to read.", tags: ["Books", "Subscription"], store: "amazon", searchQuery: "libro.fm audiobook gift membership" },
        { name: "Independent bookstore gift card", price: "$25–$100", why: "The safest pick on the page. They browse their favorite local shop and choose their own books, and Bookshop.org works if they do not have a store nearby.", bestFor: "Any reader, especially one whose shelves you have never seen.", tags: ["Books", "Personalized"], store: "amazon", searchQuery: "bookshop.org gift card" },
        { name: "Literary walking tour", price: "From $25 per person", why: "A guided walk through a city's literary landmarks, or a tour tied to one author. It depends on where you live or travel, so it works best as an add-on to a trip.", bestFor: "Readers who love one author or a particular city.", tags: ["Books", "Experience", "Travel"], store: "viator", searchQuery: "literary walking tour" },
      ],
    },
  ],
  faq: [
    { q: "What do you get a book lover who already has everything?", a: "Move away from objects. An independent bookstore gift card is the safest choice, because the fun for them is the browsing. An audiobook or Book of the Month membership keeps giving after the wrapping is gone, and a literary walking tour is something they almost certainly do not own." },
    { q: "What should you not buy a book lover?", a: "Skip a book you have not checked against their shelf, since a duplicate is worse than no gift. Skip generic merch like a mug that just says “Book Nerd.” And do not give a Kindle to someone who loves print, or an audiobook membership to someone who never listens." },
    { q: "What is a good gift for someone who only reads ebooks?", a: "Skip physical books. A Kindle Paperwhite upgrade, an audiobook membership, a warm clip-on light for older Kindles that lack a backlight, or bookish decor and candles that celebrate reading without adding to a shelf." },
    { q: "Are book-themed candles and decor a safe gift, or too generic?", a: "They land when they are specific. A candle named after an actual book, or a print of a favorite opening line, feels personal. A mug that just says “Book Nerd” does not. Aim for the specific end." },
    { q: "How much should I spend on a gift for a book lover?", a: "Most picks here sit between $15 and $50, which covers keepsakes, reading accessories, and a short subscription. A Kindle or a longer membership runs $120 to $180 if you want the gift to be the main event. For an exchange with a set limit, see [Secret Santa gifts](/gifts-for/secret-santa)." },
  ],
  related: ["coffee-lovers", "wine-lovers", "person-who-has-everything"],
  published: "2026-08-27",
  updated: "2026-11-24",
};
