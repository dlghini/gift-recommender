// "What's your gifting style?" quiz. A standalone marketing/acquisition asset.
// It is deliberately walled off from the recommendation engine: an archetype
// result only changes which call-to-action the result page shows. It never
// feeds the wizard, /api/recommend, or any scoring of gifts for a recipient.

export type ArchetypeId =
  | "overthinker"
  | "last-minute"
  | "experience"
  | "practical"
  | "sentimental"
  | "portfolio";

// Tiebreak order (first wins on an exact score tie).
export const ARCHETYPE_ORDER: ArchetypeId[] = [
  "overthinker",
  "last-minute",
  "experience",
  "practical",
  "sentimental",
  "portfolio",
];

type Weights = Partial<Record<ArchetypeId, number>>;

export interface QuizOption {
  label: string;
  weights: Weights;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "timing",
    prompt: "When do you start shopping for a gift?",
    options: [
      { label: "Weeks ahead, with a plan", weights: { overthinker: 2, portfolio: 1 } },
      { label: "A few days before", weights: { practical: 1, sentimental: 1 } },
      { label: "The night before, or the morning of", weights: { "last-minute": 3 } },
      { label: "I keep a running list all year", weights: { portfolio: 2, sentimental: 1 } },
    ],
  },
  {
    id: "stuck",
    prompt: "You have no idea what to get someone. Your move?",
    options: [
      { label: "Research for days and read every review", weights: { overthinker: 3 } },
      { label: "Ask the people who know them best", weights: { sentimental: 2, practical: 1 } },
      { label: "Grab something safe and solid", weights: { practical: 2, "last-minute": 1 } },
      { label: "Book an experience you'd both enjoy", weights: { experience: 3 } },
    ],
  },
  {
    id: "proudest",
    prompt: "The gift you're proudest of giving was...",
    options: [
      { label: "Something they mentioned once, months earlier", weights: { sentimental: 3, overthinker: 1 } },
      { label: "An experience you did together", weights: { experience: 3 } },
      { label: "Something practical they genuinely needed", weights: { practical: 3 } },
      { label: "Honestly I don't remember, I give a lot", weights: { portfolio: 2, "last-minute": 1 } },
    ],
  },
  {
    id: "budget",
    prompt: "Your take on gift budgets?",
    options: [
      { label: "Set a number and stick to it exactly", weights: { practical: 2, portfolio: 1 } },
      { label: "Spend more if it's the right thing", weights: { sentimental: 2, experience: 1 } },
      { label: "Whatever the card allows", weights: { "last-minute": 2, experience: 1 } },
      { label: "I have a spreadsheet", weights: { portfolio: 3, overthinker: 1 } },
    ],
  },
  {
    id: "shape",
    prompt: "You'd rather give...",
    options: [
      { label: "One big, considered thing", weights: { overthinker: 2, sentimental: 1 } },
      { label: "A few small thoughtful things", weights: { sentimental: 2, practical: 1 } },
      { label: "An experience or a trip", weights: { experience: 3 } },
      { label: "A reliable classic that always lands", weights: { practical: 2, "last-minute": 1 } },
    ],
  },
  {
    id: "count",
    prompt: "How many people do you regularly buy for?",
    options: [
      { label: "One or two", weights: { sentimental: 1, overthinker: 1 } },
      { label: "Three to five", weights: { practical: 1, experience: 1 } },
      { label: "Six to ten", weights: { portfolio: 2 } },
      { label: "More than I can keep track of", weights: { portfolio: 3, "last-minute": 2 } },
    ],
  },
];

export type CtaTarget = "/wizard" | "/loved-ones";

export interface Archetype {
  id: ArchetypeId;
  name: string;
  tagline: string;
  blurb: string;
  kryptonite: string;
  ctaHref: CtaTarget;
  ctaHeading: string;
  ctaBody: string;
  ctaLabel: string;
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  overthinker: {
    id: "overthinker",
    name: "The Overthinker",
    tagline: "You will find the perfect gift, eventually, after seventeen open tabs.",
    blurb:
      "You care a lot, and it shows in the hours you pour into it. You cross-reference reviews, imagine their reaction, and talk yourself out of three good options before landing on one. The gift is almost always great. The process just costs you a week.",
    kryptonite: "Analysis paralysis. The search could end sooner than it does.",
    ctaHref: "/wizard",
    ctaHeading: "Now, who are you shopping for?",
    ctaBody:
      "Answer a few quick questions about the person and we'll narrow thousands of options down to three, each with a line on why it fits. You still make the call, just faster.",
    ctaLabel: "Try the gift finder",
  },
  "last-minute": {
    id: "last-minute",
    name: "The Last-Minute Legend",
    tagline: "You do your best work at 11pm the night before. Somehow it lands.",
    blurb:
      "You are not disorganized, you are just running on a different clock. The date sneaks up, you improvise, and more often than not you pull off something good. It works until the one time it doesn't.",
    kryptonite: "The calendar. You don't need more willpower, you need a heads up.",
    ctaHref: "/loved-ones",
    ctaHeading: "Get a two-week head start",
    ctaBody:
      "Save the people you shop for and we'll nudge you two weeks before every birthday, holiday, and anniversary, with ideas ready to go.",
    ctaLabel: "Set up reminders",
  },
  experience: {
    id: "experience",
    name: "The Experience Giver",
    tagline: "You'd rather book the memory than wrap the box.",
    blurb:
      "A concert, a tasting, a weekend away. You believe the best gifts are things you do, not things you dust. People remember the day out long after they've forgotten what was in the bag.",
    kryptonite: "Some people really do just want a thing to hold. Read the room.",
    ctaHref: "/wizard",
    ctaHeading: "Now, who are you shopping for?",
    ctaBody:
      "Tell us who it's for and we'll mix in experiences they'd actually book, alongside a couple of physical options in case that's the mood.",
    ctaLabel: "Find an experience",
  },
  practical: {
    id: "practical",
    name: "The Practical Provider",
    tagline: "You give people the thing they didn't get around to buying themselves.",
    blurb:
      "The good knife. The warm coat. The upgrade they kept putting off. Your gifts get used every day, and quietly, that means a lot. You're the reason someone's kitchen actually works.",
    kryptonite: "\"Useful\" can read as \"unromantic\" if there's nothing else in the box.",
    ctaHref: "/wizard",
    ctaHeading: "Now, who are you shopping for?",
    ctaBody:
      "Tell us about them and we'll find something genuinely useful that still feels considered, not just efficient.",
    ctaLabel: "Try the gift finder",
  },
  sentimental: {
    id: "sentimental",
    name: "The Sentimental Curator",
    tagline: "You are going for the gift that makes them a little teary.",
    blurb:
      "You remember the offhand comment from six months ago. You want the personalized, the meaningful, the one that says \"I was paying attention.\" When you get it right, it's the gift they talk about for years.",
    kryptonite: "Meaning is great, but it still has to be something they'll use or want.",
    ctaHref: "/loved-ones",
    ctaHeading: "Keep the little things somewhere",
    ctaBody:
      "Save a profile for each person with the details they've let slip, so the meaningful gift is easier to find next time.",
    ctaLabel: "Start a profile",
  },
  portfolio: {
    id: "portfolio",
    name: "The Portfolio Manager",
    tagline: "You are running a small logistics operation, and it's December.",
    blurb:
      "A dozen people, four occasions each, a running spreadsheet. You've got systems. You buy in batches, track what's been sent, and you have never once been caught empty-handed. It's impressive. It's also a lot to hold in your head.",
    kryptonite: "Losing track of who got what last year. The system lives in your head.",
    ctaHref: "/loved-ones",
    ctaHeading: "Move the system out of your head",
    ctaBody:
      "A profile per person, a history of what you've already given each of them, and reminders for every date. Built for exactly how you already do this.",
    ctaLabel: "Set up your list",
  },
};

export function scoreQuiz(answers: number[]): ArchetypeId {
  const totals = new Map<ArchetypeId, number>(ARCHETYPE_ORDER.map((a) => [a, 0]));
  answers.forEach((optionIndex, questionIndex) => {
    const option = QUIZ[questionIndex]?.options[optionIndex];
    if (!option) return;
    for (const [archetype, weight] of Object.entries(option.weights)) {
      const key = archetype as ArchetypeId;
      totals.set(key, (totals.get(key) ?? 0) + (weight ?? 0));
    }
  });
  let best: ArchetypeId = ARCHETYPE_ORDER[0];
  let bestScore = -Infinity;
  for (const id of ARCHETYPE_ORDER) {
    const score = totals.get(id) ?? 0;
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}
