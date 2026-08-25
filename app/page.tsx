"use client";

import { usePostHog } from "posthog-js/react";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Sparkles, Gift } from "lucide-react";

const EXAMPLE_GIFTS = [
  {
    name: "Leather-Bound Travel Journal with Vintage World Map",
    price: "$35–$50",
    rationale: "For the friend who romanticizes every trip they take — this isn't just a notebook, it's a place to collect stamps, ticket stubs, and memories. The kind of gift that gets better-looking the more it's used.",
    tags: ["Travel", "Writing", "Personalized"],
    searchQuery: "leather bound travel journal vintage world map",
  },
  {
    name: "Japanese Cast Iron Tetsubin Tea Kettle Set",
    price: "$55–$80",
    rationale: "A ritual disguised as a kitchen item. For the person who takes their morning routine seriously — this cast iron kettle turns making tea into something meditative. Functional art that lasts decades.",
    tags: ["Cooking", "Mindfulness", "Home"],
    searchQuery: "japanese cast iron tetsubin tea kettle set",
  },
  {
    name: "Stargazing Night Sky Constellation Projector",
    price: "$40–$65",
    rationale: "Transforms any bedroom ceiling into a planetarium. Perfect for the dreamer, the curious kid, or the couple who met at a rooftop bar and still talks about the stars. Unexpectedly moving for what it is.",
    tags: ["Tech", "Outdoors", "Ambiance"],
    searchQuery: "stargazing night sky constellation projector room",
  },
];

const TAG_EMOJI: Record<string, string> = {
  Cooking: "🍳", Travel: "✈️", Fitness: "💪", Gaming: "🎮",
  Reading: "📚", Music: "🎵", Art: "🎨", Outdoors: "🏕️",
  Tech: "💻", Fashion: "👗", Writing: "✏️", Mindfulness: "🧘",
  Personalized: "🎀", Home: "🏠", Ambiance: "🌟",
};

function pickEmoji(tags: string[]): string {
  for (const tag of tags) {
    if (TAG_EMOJI[tag]) return TAG_EMOJI[tag];
  }
  return "🎁";
}

export default function Home() {
  const posthog = usePostHog();

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Gift className="w-5 h-5 text-amber-500" />
          <span className="font-heading text-xl font-bold text-stone-900 tracking-tight">The Gift Whisperer</span>
        </div>
        <h1 className="font-heading text-5xl text-stone-900 leading-tight mb-4">
          Never give a bad<br />gift again.
        </h1>
        <p className="text-stone-500 text-lg mb-10 max-w-xl mx-auto">
          Tell us about who you&apos;re buying for. We&apos;ll do the thinking — and find something they&apos;ll actually love.
        </p>
        <a
          href="/wizard"
          onClick={() => posthog?.capture("cta_clicked", { location: "hero" })}
          className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold h-16 px-12 text-xl rounded-full transition-colors shadow-lg shadow-amber-200"
        >
          Find the perfect gift ✨
        </a>
      </div>

      {/* Example gifts */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="text-amber-600 text-base font-semibold uppercase tracking-widest">Examples only — yours will be personalized</span>
        </div>
        <div className="flex flex-col gap-4">
          {EXAMPLE_GIFTS.map((gift, idx) => (
            <Card key={idx} className="bg-white border-0 shadow-sm opacity-90">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl shrink-0">{pickEmoji(gift.tags)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-medium">Example</span>
                    </div>
                    <h3 className="font-heading text-lg text-stone-900 leading-tight">{gift.name}</h3>
                    <p className="text-amber-600 font-semibold text-sm mt-0.5">{gift.price}</p>
                    <p className="text-stone-500 text-sm mt-3 leading-relaxed">{gift.rationale}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {gift.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">{tag}</span>
                      ))}
                    </div>
                    <a
                      href={`https://www.amazon.com/s?k=${encodeURIComponent(gift.searchQuery)}&tag=giftwhisper0e-20`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => posthog?.capture("example_buy_clicked", { gift: gift.name })}
                      className="mt-4 w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold h-9 text-sm rounded-md transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Buy now
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl text-stone-900 mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { emoji: "🧠", title: "Tell us about them", desc: "Relationship, age, occasion, interests — takes under a minute." },
              { emoji: "✨", title: "We pick the gifts", desc: "We think through thousands of ideas and surface 3 picks tailored to them." },
              { emoji: "🛍️", title: "Buy with one click", desc: "Each gift links directly to the store so you can order instantly." },
            ].map((item) => (
              <div key={item.title}>
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-heading text-base text-stone-900 mb-1">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <a
            href="/wizard"
            onClick={() => posthog?.capture("cta_clicked", { location: "how_it_works" })}
            className="mt-12 inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-semibold h-12 px-8 text-base rounded-full transition-colors"
          >
            Try it now — it&apos;s free ✨
          </a>
        </div>
      </div>
    </div>
  );
}
