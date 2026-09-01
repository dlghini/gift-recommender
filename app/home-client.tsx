"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, ChevronDown, ArrowRight } from "lucide-react";
import { DoodleIcon } from "@/components/doodle-icon";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { cn } from "@/lib/utils";

const RAKUTEN_ID = "wa9JRgUhXO8";
const ETSY_MID = "54027";
const VIATOR_PID = "P00304135";

const EXAMPLE_GIFTS = [
  {
    name: "Japanese Cast Iron Tetsubin Tea Kettle Set",
    price: "$55–$80",
    rationale: "A ritual disguised as a kitchen item. For the person who takes their morning routine seriously, this cast iron kettle turns making tea into something meditative. Functional art that lasts decades.",
    tags: ["Cooking", "Mindfulness", "Home"],
    searchQuery: "japanese cast iron tetsubin tea kettle set",
    store: "amazon" as const,
    imageUrl: "https://images.unsplash.com/photo-1578920181445-0a0b285b9757?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    name: "Private Sunset Sailing Cruise",
    price: "From $85 per person",
    rationale: "A bookable experience instead of another object. A couple of hours on the water as the sky turns gold. Perfect for someone who'd rather collect memories than more stuff.",
    tags: ["Travel", "Romance", "Outdoors"],
    searchQuery: "private sunset sailing cruise",
    store: "viator" as const,
    imageUrl: "https://images.unsplash.com/photo-1647391410347-2eb84bb9cbbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    name: "Stargazing Night Sky Constellation Projector",
    price: "$40–$65",
    rationale: "Transforms any bedroom ceiling into a planetarium. Perfect for the dreamer, the curious kid, or the couple who met at a rooftop bar and still talks about the stars. Unexpectedly moving for what it is.",
    tags: ["Tech", "Outdoors", "Ambiance"],
    searchQuery: "stargazing night sky constellation projector room",
    store: "amazon" as const,
    imageUrl: "https://images.unsplash.com/photo-1560380416-f65464ef84b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    name: "Leather-Bound Travel Journal with Vintage World Map",
    price: "$35–$50",
    rationale: "For the friend who romanticizes every trip they take. This isn't just a notebook, it's a place to collect stamps, ticket stubs, and memories. The kind of gift that gets better-looking the more it's used.",
    tags: ["Travel", "Writing", "Personalized"],
    searchQuery: "leather bound travel journal vintage world map",
    store: "amazon" as const,
    imageUrl: "https://images.unsplash.com/photo-1709988795057-a13a7a612046?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
  {
    name: "Custom Constellation Star Map Print of Your First Date",
    price: "$25–$45",
    rationale: "A personalized print of exactly how the sky looked the night you met, engraved with the date and place. Handmade, sentimental, and the kind of thing they'll actually hang on the wall.",
    tags: ["Personalized", "Art", "Sentimental"],
    searchQuery: "custom star map print first date",
    store: "etsy" as const,
    imageUrl: "https://images.unsplash.com/photo-1765207663362-bad07a16fbb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  },
];

function buildExampleUrl(gift: (typeof EXAMPLE_GIFTS)[number]): string {
  if (gift.store === "viator") {
    return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(gift.searchQuery)}&pid=${VIATOR_PID}`;
  }
  if (gift.store === "etsy") {
    const etsyUrl = `https://www.etsy.com/search?q=${encodeURIComponent(gift.searchQuery)}`;
    return `https://click.linksynergy.com/deeplink?id=${RAKUTEN_ID}&mid=${ETSY_MID}&murl=${encodeURIComponent(etsyUrl)}`;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(gift.searchQuery)}&tag=giftwhisper0e-20`;
}

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

function ExampleThumb({ gift }: { gift: (typeof EXAMPLE_GIFTS)[number] }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (!imgFailed) {
    return (
      <img
        src={gift.imageUrl}
        alt={gift.name}
        className="w-14 h-14 shrink-0 rounded-lg object-cover bg-stone-100"
        onError={() => setImgFailed(true)}
      />
    );
  }
  return <div className="text-4xl shrink-0">{pickEmoji(gift.tags)}</div>;
}

export default function Home() {
  const posthog = usePostHog();
  const [accountNoteOpen, setAccountNoteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="flex items-center gap-2 justify-center mb-8">
          <DoodleIcon name="gift" className="w-5 h-5 text-amber-600" />
          <span className="font-heading text-xl font-bold text-stone-900 tracking-tight">The Gift Whisperer</span>
        </div>
        <h1 className="font-heading text-5xl text-stone-900 leading-tight mb-4">
          Never give a bad<br />gift again.
        </h1>
        <p className="text-stone-500 text-lg mb-10 max-w-xl mx-auto">
          Tell us about who you&apos;re buying for. We&apos;ll do the thinking, and find something they&apos;ll actually love.
        </p>
        <a
          href="/wizard"
          onClick={() => posthog?.capture("cta_clicked", { location: "hero" })}
          className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold h-16 px-12 text-xl rounded-full transition-colors shadow-lg shadow-amber-200"
        >
          Find the perfect gift
        </a>

        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-stone-500">
          <button
            type="button"
            onClick={() => {
              setAccountNoteOpen((open) => {
                if (!open) posthog?.capture("account_note_opened", { location: "hero" });
                return !open;
              });
            }}
            aria-expanded={accountNoteOpen}
            className="inline-flex items-center gap-1 font-medium text-amber-600 hover:text-amber-700"
          >
            Free to use. No account required.
            <ChevronDown className={cn("w-4 h-4 transition-transform", accountNoteOpen && "rotate-180")} />
          </button>
          {accountNoteOpen && (
            <div className="mt-1 max-w-sm rounded-xl border border-amber-100 bg-white px-4 py-3 text-left shadow-sm">
              <p className="font-heading text-sm text-stone-900 mb-1">The gift finder always works without signing in.</p>
              <p className="text-sm text-stone-600 leading-relaxed">
                An account adds <span className="font-medium text-stone-900">Loved Ones</span>: a saved profile for
                each person you shop for, a history of what you&apos;ve already given them, and a reminder two weeks
                before their birthday, a holiday, or an anniversary.
              </p>
              <a
                href="/loved-ones"
                onClick={() => posthog?.capture("cta_clicked", { location: "hero_account_note" })}
                className="mt-2 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                See how Loved Ones works →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Loved Ones */}
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <DoodleIcon name="heart" className="w-5 h-5 text-rose-500" />
          <span className="text-amber-600 text-base font-semibold uppercase tracking-widest">New: Loved Ones</span>
        </div>
        <h2 className="font-heading text-3xl text-stone-900 mb-4">Remember every person, every gift</h2>
        <p className="text-stone-500 text-base mb-10 max-w-xl mx-auto">
          Create a free profile for the people you shop for so you&apos;re never starting from scratch, or scrambling last minute.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          {[
            { icon: "save" as const, title: "Save ideas by person", desc: "Every recommendation gets tucked under the right profile instead of one big pile of favorites." },
            { icon: "pencil" as const, title: "Log what you've given", desc: "Keep a running history for each person so you're never guessing whether you already got them that." },
            { icon: "bell" as const, title: "Get reminded in time", desc: "We'll nudge you two weeks before their birthday, anniversary, or a holiday like Mother's Day." },
          ].map((item) => (
            <div key={item.title}>
              <DoodleIcon name={item.icon} className="w-8 h-8 mx-auto mb-3 text-amber-600" />
              <h3 className="font-heading text-base text-stone-900 mb-1">{item.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <a
          href="/loved-ones"
          onClick={() => posthog?.capture("cta_clicked", { location: "loved_ones" })}
          className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-semibold h-12 px-8 text-base rounded-full transition-colors"
        >
          Set up Loved Ones →
        </a>
      </div>

      {/* Gifting style quiz */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <a
          href="/gifting-style"
          onClick={() => posthog?.capture("cta_clicked", { location: "home_gifting_style" })}
          className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-white px-6 py-5 shadow-sm transition-colors hover:border-amber-300"
        >
          <span className="text-3xl shrink-0" aria-hidden>🎁</span>
          <span className="flex-1 min-w-0">
            <span className="block font-heading text-lg text-stone-900">What&apos;s your gifting style?</span>
            <span className="block text-stone-500 text-sm mt-0.5">
              A quick six-question quiz. Are you the Overthinker, the Last-Minute Legend, or something else?
            </span>
          </span>
          <ArrowRight className="w-5 h-5 text-amber-500 shrink-0" />
        </a>
      </div>

      {/* Example gifts */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <DoodleIcon name="sparkle" className="w-5 h-5 text-amber-600" />
          <span className="text-amber-600 text-base font-semibold uppercase tracking-widest">Example gifts. Yours will be personalized</span>
        </div>
        <AffiliateDisclosure className="mb-6 text-center" />
        <div className="flex flex-col gap-4">
          {EXAMPLE_GIFTS.map((gift, idx) => (
            <Card key={idx} className="bg-white border-0 shadow-sm opacity-90">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <ExampleThumb gift={gift} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-medium">Example</span>
                      {gift.store === "viator" && (
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Experience</span>
                      )}
                    </div>
                    <h3 className="font-heading text-lg text-stone-900 leading-tight">{gift.name}</h3>
                    <p className={cn("font-semibold text-sm mt-0.5", gift.store === "viator" ? "text-indigo-600" : "text-amber-600")}>{gift.price}</p>
                    <p className="text-stone-500 text-sm mt-3 leading-relaxed">{gift.rationale}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {gift.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">{tag}</span>
                      ))}
                    </div>
                    <a
                      href={buildExampleUrl(gift)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => posthog?.capture("example_buy_clicked", { gift: gift.name, store: gift.store })}
                      className={cn(
                        "mt-4 w-full flex items-center justify-center gap-1.5 text-white font-semibold h-9 text-sm rounded-md transition-colors",
                        gift.store === "viator" ? "bg-indigo-500 hover:bg-indigo-600" : "bg-amber-500 hover:bg-amber-600"
                      )}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {gift.store === "viator" ? "Book now" : "Buy now"}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-[#f3f6f1] py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl text-stone-900 mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: "person" as const, title: "Tell us about them", desc: "Relationship, age, occasion, interests. Takes under a minute." },
              { icon: "sparkle" as const, title: "We pick the gifts", desc: "We think through thousands of ideas and surface 3 picks tailored to them." },
              { icon: "bag" as const, title: "Buy with one click", desc: "Each gift links directly to the store so you can order instantly." },
            ].map((item) => (
              <div key={item.title}>
                <DoodleIcon name={item.icon} className="w-8 h-8 mx-auto mb-3 text-amber-600" />
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
            Try it now, it&apos;s free
          </a>
        </div>
      </div>
    </div>
  );
}
