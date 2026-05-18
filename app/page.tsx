"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ExternalLink, ArrowLeft, Sparkles, Gift, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | "loading" | "results";

interface FormState {
  relationship: string;
  ageRange: string;
  occasion: string;
  interests: string[];
  freetext: string;
  budget: string;
}

interface GiftResult {
  name: string;
  price: string;
  rationale: string;
  tags: string[];
  affiliateUrl: string;
  searchQuery: string;
}

const RELATIONSHIPS = ["Partner", "Friend", "Parent", "Sibling", "Child", "Colleague"];
const AGE_RANGES = ["Under 18", "18–25", "26–35", "36–50", "51–65", "65+"];
const OCCASIONS = [
  { label: "Birthday", emoji: "🎂" },
  { label: "Holiday", emoji: "🎁" },
  { label: "Anniversary", emoji: "💍" },
  { label: "Graduation", emoji: "🎓" },
  { label: "Baby Shower", emoji: "👶" },
  { label: "Just Because", emoji: "💝" },
];
const INTERESTS = ["Cooking", "Travel", "Fitness", "Gaming", "Reading", "Music", "Art", "Outdoors", "Tech", "Fashion"];
const BUDGETS = [
  { label: "Under $25", value: "under-25" },
  { label: "$25 – $50", value: "25-50" },
  { label: "$50 – $100", value: "50-100" },
  { label: "$100 – $250", value: "100-250" },
  { label: "$250+", value: "250+" },
];

const TAG_EMOJI: Record<string, string> = {
  Cooking: "🍳", Travel: "✈️", Fitness: "💪", Gaming: "🎮",
  Reading: "📚", Music: "🎵", Art: "🎨", Outdoors: "🏕️",
  Tech: "💻", Fashion: "👗", Kitchen: "🍳", Creative: "✏️",
  Mindfulness: "🧘", Practical: "⚙️", Food: "🍽️", Coffee: "☕",
};

function pickEmoji(tags: string[]): string {
  for (const tag of tags) {
    const match = TAG_EMOJI[tag];
    if (match) return match;
  }
  return "🎁";
}

const pillClass = (selected: boolean) =>
  cn(
    "px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer",
    selected
      ? "bg-amber-500 text-white border-amber-500"
      : "bg-white text-stone-700 border-stone-200 hover:border-amber-300 hover:text-amber-700"
  );

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [attempt, setAttempt] = useState(0);
  const [gifts, setGifts] = useState<GiftResult[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    relationship: "",
    ageRange: "",
    occasion: "",
    interests: [],
    freetext: "",
    budget: "",
  });

  const progress = typeof step === "number" ? (step / 4) * 100 : 100;

  const canProceed =
    step === 1
      ? form.relationship !== "" && form.ageRange !== ""
      : step === 2
        ? form.occasion !== ""
        : step === 3
          ? form.interests.length > 0
          : step === 4
            ? form.budget !== ""
            : false;

  const fetchRecommendations = async () => {
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);
    setApiError(null);
    setSaved(new Set());
    setStep("loading");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attempt: nextAttempt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "API error");
      setGifts(data as GiftResult[]);
      setStep("results");
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStep(4);
    }
  };

  const next = async () => {
    if (step === 4) {
      fetchRecommendations();
    } else if (typeof step === "number") {
      setStep((step + 1) as Step);
    }
  };

  const back = () => {
    if (step === "results") { setStep(4); setAttempt(0); }
    else if (typeof step === "number" && step > 1) setStep((step - 1) as Step);
  };

  const toggleInterest = (interest: string) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const toggleSaved = (idx: number) => {
    setSaved((s) => {
      const next = new Set(s);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl animate-bounce">🎁</div>
        <p className="font-heading text-2xl text-stone-800">Finding your perfect gifts…</p>
        <p className="text-stone-400 text-sm">Our AI is thinking through thousands of ideas</p>
      </div>
    );
  }

  if (step === "results") {
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={back}
              className="flex items-center gap-1 text-stone-400 hover:text-stone-700 text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Start over
            </button>
            <button
              onClick={fetchRecommendations}
              className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try different gifts
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">
              Your picks
            </span>
          </div>
          <h1 className="font-heading text-3xl text-stone-900 mb-1">3 gifts they&apos;ll love</h1>
          <p className="text-stone-400 text-sm mb-8">
            Curated for {form.relationship.toLowerCase() || "them"} •{" "}
            {form.occasion || "any occasion"}
          </p>

          <div className="flex flex-col gap-4">
            {gifts.map((gift, idx) => (
              <Card key={idx} className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl shrink-0">{pickEmoji(gift.tags)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="font-heading text-lg text-stone-900 leading-tight">
                            {gift.name}
                          </h2>
                          <p className="text-amber-600 font-semibold text-sm mt-0.5">{gift.price}</p>
                        </div>
                        <button
                          onClick={() => toggleSaved(idx)}
                          className="shrink-0 p-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                          aria-label={saved.has(idx) ? "Remove from wishlist" : "Save to wishlist"}
                        >
                          <Heart
                            className={cn(
                              "w-5 h-5 transition-colors",
                              saved.has(idx)
                                ? "fill-rose-500 text-rose-500"
                                : "text-stone-300"
                            )}
                          />
                        </button>
                      </div>
                      <p className="text-stone-500 text-sm mt-3 leading-relaxed">{gift.rationale}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {gift.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Button
                        className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold h-9 text-sm"
                        onClick={() =>
                          window.open(
                            `https://www.amazon.com/s?k=${encodeURIComponent(gift.searchQuery || gift.name)}`,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Buy now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Gift className="w-5 h-5 text-amber-500" />
          <span className="font-heading text-xl font-bold text-stone-900 tracking-tight">
            giftspark
          </span>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-stone-400 uppercase tracking-wider">
                Step {step} of 4
              </span>
              <span className="text-xs text-stone-400">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-1.5 w-full rounded-full bg-amber-100 mb-8">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {apiError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {apiError}
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 className="font-heading text-2xl text-stone-900 mb-1">
                  Who are you buying for?
                </h1>
                <p className="text-stone-400 text-sm mb-6">
                  Select their relationship and age range
                </p>

                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Relationship
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {RELATIONSHIPS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setForm((f) => ({ ...f, relationship: r }))}
                      className={pillClass(form.relationship === r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Age range
                </p>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((a) => (
                    <button
                      key={a}
                      onClick={() => setForm((f) => ({ ...f, ageRange: a }))}
                      className={pillClass(form.ageRange === a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="font-heading text-2xl text-stone-900 mb-1">
                  What&apos;s the occasion?
                </h1>
                <p className="text-stone-400 text-sm mb-6">Pick the one that fits best</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {OCCASIONS.map((o) => (
                    <button
                      key={o.label}
                      onClick={() => setForm((f) => ({ ...f, occasion: o.label }))}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                        form.occasion === o.label
                          ? "bg-amber-50 border-amber-500 text-amber-700"
                          : "bg-white border-stone-200 text-stone-700 hover:border-amber-200 hover:bg-amber-50/50"
                      )}
                    >
                      <span className="text-2xl">{o.emoji}</span>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="font-heading text-2xl text-stone-900 mb-1">
                  What are they into?
                </h1>
                <p className="text-stone-400 text-sm mb-6">Select all that apply</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {INTERESTS.map((i) => (
                    <button
                      key={i}
                      onClick={() => toggleInterest(i)}
                      className={pillClass(form.interests.includes(i))}
                    >
                      {i}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Anything else we should know? (optional)"
                  value={form.freetext}
                  onChange={(e) => setForm((f) => ({ ...f, freetext: e.target.value }))}
                  className="border-stone-200 focus:border-amber-400"
                />
              </div>
            )}

            {step === 4 && (
              <div>
                <h1 className="font-heading text-2xl text-stone-900 mb-1">
                  What&apos;s your budget?
                </h1>
                <p className="text-stone-400 text-sm mb-6">
                  We&apos;ll find the best options within your range
                </p>
                <div className="flex flex-col gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b.value}
                      onClick={() => setForm((f) => ({ ...f, budget: b.value }))}
                      className={cn(
                        "w-full text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                        form.budget === b.value
                          ? "bg-amber-50 border-amber-500 text-amber-700"
                          : "bg-white border-stone-200 text-stone-700 hover:border-amber-200 hover:bg-amber-50/30"
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              {typeof step === "number" && step > 1 ? (
                <button
                  onClick={back}
                  className="flex items-center gap-1 text-stone-400 hover:text-stone-700 text-sm transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}
              <Button
                onClick={next}
                disabled={!canProceed}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold h-9 px-5"
              >
                {step === 4 ? "Find my perfect gifts ✨" : "Next →"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
