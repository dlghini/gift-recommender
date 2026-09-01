"use client";

import { useState, useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import { applyInternalParam, getIsInternal, runEvent } from "@/lib/wizard-telemetry";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ExternalLink, ArrowLeft, Sparkles, Gift, AlertCircle, RefreshCw, Share2, Check, Ticket, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { DoodleIcon, type DoodleName } from "@/components/doodle-icon";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { AssignGiftDialog } from "@/components/assign-gift-dialog";
import { pickRelationshipEmoji } from "@/components/relationship-emoji";
import { CLERK_ENABLED } from "@/lib/clerk-enabled";
import { INTERESTS } from "@/lib/interests";
import { useResolvedImage } from "@/lib/use-resolved-image";

function encodeSharePayload(form: FormState, gifts: GiftResult[]): string {
  return btoa(encodeURIComponent(JSON.stringify({ form, gifts })));
}

function decodeSharePayload(encoded: string): { form: FormState; gifts: GiftResult[] } | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}

type Step = 1 | 2 | 3 | 4 | "loading" | "results";

interface FormState {
  relationship: string;
  ageRange: string;
  occasion: string;
  interests: string[];
  freetext: string;
  budget: string;
  giftPreference: "experiences" | "gifts" | "both";
}

interface GiftResult {
  id: string;
  name: string;
  price: string;
  rationale: string;
  tags: string[];
  affiliateUrl: string;
  type: "product" | "experience";
  store: "amazon" | "etsy" | "viator";
  searchQuery: string;
  imageUrl?: string;
  runId?: string;
}

const RAKUTEN_ID = "wa9JRgUhXO8";
const ETSY_MID = "54027";
const VIATOR_PID = "P00304135";

function buildBuyUrl(gift: GiftResult): string {
  if (gift.store === "viator") {
    // affiliateUrl is a real, pre-attributed Viator productUrl when available; fall back to a basic search link
    if (gift.affiliateUrl && gift.affiliateUrl !== "#") return gift.affiliateUrl;
    return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(gift.searchQuery || gift.name)}&pid=${VIATOR_PID}`;
  }
  if (gift.store === "etsy") {
    const etsyUrl = `https://www.etsy.com/search?q=${encodeURIComponent(gift.searchQuery || gift.name)}`;
    return `https://click.linksynergy.com/deeplink?id=${RAKUTEN_ID}&mid=${ETSY_MID}&murl=${encodeURIComponent(etsyUrl)}`;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(gift.searchQuery || gift.name)}&tag=giftwhisper0e-20`;
}

const RELATIONSHIPS = ["Partner", "Friend", "Parent", "Sibling", "Child", "Colleague"];
const AGE_RANGES = ["Under 10", "10–17", "18–30", "31–60", "60+"];
const OCCASIONS: { label: string; icon: DoodleName }[] = [
  { label: "Birthday", icon: "cake" },
  { label: "Holiday", icon: "gift" },
  { label: "Anniversary", icon: "ring" },
  { label: "Graduation", icon: "gradcap" },
  { label: "Baby Shower", icon: "pram" },
  { label: "Just Because", icon: "heart" },
];
const GIFT_PREFERENCES: { label: string; value: FormState["giftPreference"] }[] = [
  { label: "Physical gifts", value: "gifts" },
  { label: "Experiences", value: "experiences" },
  { label: "Both", value: "both" },
];
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

function pickEmoji(tags: string[], type?: "product" | "experience"): string {
  for (const tag of tags) {
    const match = TAG_EMOJI[tag];
    if (match) return match;
  }
  return type === "experience" ? "🎟️" : "🎁";
}

// Renders the gift's real photo when we have one; falls back to an emoji if there's no image
// (no key set up, lookup miss, or the image URL failed to load and a re-resolve also came up empty).
function GiftThumb({ gift, size = "lg" }: { gift: GiftResult; size?: "lg" | "sm" }) {
  const { src, failed, handleError } = useResolvedImage(gift.imageUrl, gift.searchQuery || gift.name, gift.tags);
  const boxClass = size === "lg" ? "w-14 h-14" : "w-10 h-10";
  const textClass = size === "lg" ? "text-4xl" : "text-2xl";

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={gift.name}
        className={cn(boxClass, "shrink-0 rounded-lg object-cover bg-stone-100")}
        onError={handleError}
      />
    );
  }
  return <div className={cn(textClass, "shrink-0")}>{pickEmoji(gift.tags, gift.type)}</div>;
}

const pillClass = (selected: boolean) =>
  cn(
    "px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer",
    selected
      ? "bg-amber-500 text-white border-amber-500"
      : "bg-white text-stone-700 border-stone-200 hover:border-amber-300 hover:text-amber-700"
  );

function ageRangeFromBirthYear(year: number | null | undefined): string {
  if (!year) return "";
  const age = new Date().getFullYear() - year;
  if (age < 10) return "Under 10";
  if (age <= 17) return "10–17";
  if (age <= 30) return "18–30";
  if (age <= 60) return "31–60";
  return "60+";
}

// useUser() throws unless a <ClerkProvider> is actually mounted above it, and
// that only happens when Clerk keys are configured (see lib/clerk-enabled.ts).
// Isolating the hook call in its own component — only ever rendered when
// Clerk is enabled — keeps this file safe to load either way, without
// conditionally calling a hook inside WizardPageContent itself.
function ClerkAwareWizardPage() {
  const { isSignedIn } = useUser();
  return <WizardPageContent isSignedIn={!!isSignedIn} />;
}

export default function WizardPage() {
  return CLERK_ENABLED ? <ClerkAwareWizardPage /> : <WizardPageContent isSignedIn={false} />;
}

function WizardPageContent({ isSignedIn }: { isSignedIn: boolean }) {
  const posthog = usePostHog();
  const [step, setStep] = useState<Step>(1);
  const [assigningGift, setAssigningGift] = useState<GiftResult | null>(null);
  const [savedGifts, setSavedGifts] = useState<GiftResult[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("giftspark_saved");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const savedIds = new Set(savedGifts.map((g) => g.id));
  const [attempt, setAttempt] = useState(0);
  const [seenGifts, setSeenGifts] = useState<string[]>([]);
  const [gifts, setGifts] = useState<GiftResult[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    relationship: "",
    ageRange: "",
    occasion: "",
    interests: [],
    freetext: "",
    budget: "",
    giftPreference: "both",
  });
  const [copied, setCopied] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  // Set when the wizard is opened from a Loved One profile (?lovedOneId=). We
  // prefill everything the profile already knows and skip those steps.
  const [lovedOne, setLovedOne] = useState<{ name: string } | null>(null);
  const [prefilledSteps, setPrefilledSteps] = useState<{ s1: boolean; s3: boolean }>({ s1: false, s3: false });
  const [loadingLovedOne, setLoadingLovedOne] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("lovedOneId")
  );
  // Signed-in users see their saved profiles on step 1 as a shortcut.
  const [savedProfiles, setSavedProfiles] = useState<{ id: string; name: string; relationship: string }[]>([]);
  // Wizard-run instrumentation: a fresh id per recommendation request, plus a
  // lightweight per-question trail. See lib/run-events.ts.
  const runIdRef = useRef<string | null>(null);
  const questionMetaRef = useRef<{ step: number; tMs: number; prefilled: boolean }[]>([]);

  // Prefill from a Loved One profile and skip the steps it already answers.
  const applyLovedOne = (lo: {
    name: string;
    relationship: string;
    birthday_year: number | null;
    interests: unknown;
    interests_notes: string | null;
  }) => {
    const age = ageRangeFromBirthYear(lo.birthday_year);
    const notes = (lo.interests_notes || "").trim();
    const savedInterests: string[] = Array.isArray(lo.interests) ? lo.interests : [];
    setForm((f) => ({
      ...f,
      relationship: lo.relationship,
      ageRange: age || f.ageRange,
      interests: savedInterests.length ? savedInterests : f.interests,
      freetext: notes || f.freetext,
    }));
    setLovedOne({ name: lo.name });
    // Step 1 is relationship + age; relationship always comes from the profile,
    // so it's only "done" if we also got an age. Step 3 is covered if the
    // profile has interests checked or notes written.
    setPrefilledSteps({ s1: !!age, s3: savedInterests.length > 0 || !!notes });
    setStep(age ? 2 : 1);
  };

  const pickLovedOne = (id: string) => {
    setLoadingLovedOne(true);
    fetch(`/api/loved-ones/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.lovedOne) {
          applyLovedOne(data.lovedOne);
          posthog?.capture("wizard_loved_one_picked", { location: "step1" });
        }
        setLoadingLovedOne(false);
      })
      .catch(() => setLoadingLovedOne(false));
  };

  useEffect(() => {
    applyInternalParam();
    const params = new URLSearchParams(window.location.search);
    const r = params.get("r");
    if (r) {
      const decoded = decodeSharePayload(r);
      if (decoded) {
        setForm(decoded.form);
        setGifts(decoded.gifts);
        setStep("results");
      }
      setLoadingLovedOne(false);
      return;
    }
    const lovedOneId = params.get("lovedOneId");
    if (lovedOneId) {
      fetch(`/api/loved-ones/${lovedOneId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.lovedOne) applyLovedOne(data.lovedOne);
          setLoadingLovedOne(false);
        })
        .catch(() => setLoadingLovedOne(false));
    }
  }, []);

  // Load the user's saved profiles once Clerk reports them signed in (unless
  // they arrived via a share link or a specific profile already).
  useEffect(() => {
    if (!isSignedIn) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("r") || params.get("lovedOneId")) return;
    fetch("/api/loved-ones")
      .then((res) => res.json())
      .then((data) => setSavedProfiles(Array.isArray(data.lovedOnes) ? data.lovedOnes : []))
      .catch(() => {});
  }, [isSignedIn]);

  useEffect(() => {
    if (step === "results" && gifts.length > 0) {
      const encoded = encodeSharePayload(form, gifts);
      window.history.replaceState(null, "", `?r=${encoded}`);
    } else if (step !== "results" && step !== "loading") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [step, gifts, form]);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    posthog?.capture("results_shared");
    runEvent(runIdRef.current, "results_shared", {});
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = typeof step === "number" ? (step / 4) * 100 : 100;

  const canProceed =
    step === 1
      ? form.relationship !== "" && form.ageRange !== ""
      : step === 2
        ? form.occasion !== ""
        : step === 3
          ? form.interests.length > 0 || form.freetext.trim() !== ""
          : step === 4
            ? form.budget !== ""
            : false;

  const fetchRecommendations = async (isRegenerate = false) => {
    const nextAttempt = attempt + 1;
    const exclude = [...seenGifts, ...gifts.map((g) => g.name)];
    setAttempt(nextAttempt);
    setApiError(null);
    setStep("loading");

    // A regenerate is a new run against the same inputs.
    const runId = crypto.randomUUID();
    runIdRef.current = runId;
    const isInternal = getIsInternal();

    if (isRegenerate) {
      posthog?.capture("regenerate_clicked", { attempt: nextAttempt, ...form });
      runEvent(runId, "regenerate_clicked", { attempt: nextAttempt });
    } else {
      posthog?.capture("wizard_completed", form);
    }
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          attempt: nextAttempt,
          exclude,
          runId,
          isInternal,
          questionMeta: questionMetaRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "API error");
      const results = (data as Omit<GiftResult, "id">[]).map((g) => ({ ...g, id: crypto.randomUUID(), runId }));
      setSeenGifts((prev) => [...prev, ...results.map((g) => g.name)]);
      setGifts(results);
      setStep("results");
      posthog?.capture("recommendations_shown", { attempt: nextAttempt, gifts: results.map((g) => g.name) });
      runEvent(runId, "results_shown", { attempt: nextAttempt, count: results.length });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setApiError(msg);
      setStep(4);
      posthog?.capture("recommendations_error", { error: msg, ...form });
    }
  };

  const next = async () => {
    if (step === 4) {
      fetchRecommendations(false);
    } else if (typeof step === "number") {
      posthog?.capture("wizard_step_completed", { step, ...form });
      const prefilled = (step === 1 && prefilledSteps.s1) || (step === 3 && prefilledSteps.s3);
      questionMetaRef.current.push({ step, tMs: Date.now(), prefilled });
      let target = step + 1;
      if (target === 3 && prefilledSteps.s3) target = 4;
      setStep(target as Step);
    }
  };

  const back = () => {
    if (step === "results") { setStep(4); setAttempt(0); setSeenGifts([]); }
    else if (typeof step === "number" && step > 1) {
      let target = step - 1;
      if (target === 3 && prefilledSteps.s3) target = 2;
      setStep(target as Step);
    }
  };

  const toggleInterest = (interest: string) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  // Signed-out users keep the original local-only save. Signed-in users get
  // the "assign to a loved one" dialog instead of a flat local list.
  const handleHeartClick = (gift: GiftResult) => {
    if (isSignedIn) {
      setAssigningGift(gift);
      return;
    }
    setSavedGifts((prev) => {
      const isAlreadySaved = prev.some((g) => g.id === gift.id);
      const next = isAlreadySaved
        ? prev.filter((g) => g.id !== gift.id)
        : [...prev, gift];
      localStorage.setItem("giftspark_saved", JSON.stringify(next));
      posthog?.capture(isAlreadySaved ? "gift_unsaved" : "gift_saved", { gift: gift.name, store: gift.store });
      runEvent(gift.runId ?? runIdRef.current, isAlreadySaved ? "gift_unsaved" : "gift_saved", { gift: gift.name });
      return next;
    });
  };

  // Only used by the local "Saved gifts" section, which only exists for
  // signed-out users (or leftover local saves not yet migrated).
  const removeSavedLocally = (gift: GiftResult) => {
    setSavedGifts((prev) => {
      const next = prev.filter((g) => g.id !== gift.id);
      localStorage.setItem("giftspark_saved", JSON.stringify(next));
      posthog?.capture("gift_unsaved", { gift: gift.name, store: gift.store });
      return next;
    });
  };

  const handleSendEmail = async () => {
    if (!emailValue || emailStatus === "sending") return;
    setEmailStatus("sending");
    setEmailError(null);
    try {
      const res = await fetch("/api/send-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, gifts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Please try again.");
      setEmailStatus("sent");
      posthog?.capture("results_emailed", { gifts: gifts.map((g) => g.name) });
      runEvent(runIdRef.current, "results_emailed", {});
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setEmailError(msg);
      setEmailStatus("error");
      posthog?.capture("results_email_error", { error: msg });
    }
  };

  const handleBuyClick = (gift: GiftResult) => {
    posthog?.capture("buy_clicked", { gift: gift.name, store: gift.store, price: gift.price, ...form });
    runEvent(gift.runId ?? runIdRef.current, "buy_clicked", { gift: gift.name, store: gift.store });
    window.open(buildBuyUrl(gift), "_blank", "noopener,noreferrer");
  };

  if (loadingLovedOne) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4">
        <DoodleIcon name="gift" className="w-12 h-12 text-amber-600 animate-bounce" />
        <p className="font-heading text-2xl text-stone-800">Pulling up their profile…</p>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4">
        <DoodleIcon name="gift" className="w-12 h-12 text-amber-600 animate-bounce" />
        <p className="font-heading text-2xl text-stone-800">Finding your perfect gifts…</p>
        <p className="text-stone-400 text-sm">Thinking through thousands of ideas for you…</p>
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
            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm font-medium text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Share"}
              </button>
              <button
                onClick={() => fetchRecommendations(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try different gifts
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Your picks</span>
          </div>
          <h1 className="font-heading text-3xl text-stone-900 mb-3">3 gifts they&apos;ll love</h1>
          <AffiliateDisclosure className="mb-8" />

          <div className="flex flex-col gap-4">
            {gifts.map((gift, idx) => (
              <Card
                key={idx}
                className={cn(
                  "bg-white shadow-sm",
                  gift.type === "experience" ? "border-2 border-indigo-200" : "border-0"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <GiftThumb gift={gift} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {gift.type === "experience" && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 mb-1.5">
                              <Ticket className="w-3 h-3" /> Experience
                            </span>
                          )}
                          <h2 className="font-heading text-lg text-stone-900 leading-tight">{gift.name}</h2>
                          <p className={cn("font-semibold text-sm mt-0.5", gift.type === "experience" ? "text-indigo-600" : "text-amber-600")}>{gift.price}</p>
                        </div>
                        <button
                          onClick={() => handleHeartClick(gift)}
                          className="shrink-0 p-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                          aria-label={!isSignedIn && savedIds.has(gift.id) ? "Remove from wishlist" : "Save to wishlist"}
                        >
                          <Heart className={cn("w-5 h-5 transition-colors", !isSignedIn && savedIds.has(gift.id) ? "fill-rose-500 text-rose-500" : "text-stone-300")} />
                        </button>
                      </div>
                      <p className="text-stone-500 text-sm mt-3 leading-relaxed">{gift.rationale}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {gift.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">{tag}</span>
                        ))}
                      </div>
                      <Button
                        className={cn(
                          "mt-4 w-full text-white font-semibold h-9 text-sm",
                          gift.type === "experience" ? "bg-indigo-500 hover:bg-indigo-600" : "bg-amber-500 hover:bg-amber-600"
                        )}
                        onClick={() => handleBuyClick(gift)}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        {gift.type === "experience" ? "Book now" : "Buy now"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-stone-400 mt-4">
            We earn from qualifying purchases via affiliate partnerships.{" "}
            <a href="/disclosure" className="underline underline-offset-2 hover:text-stone-600">Learn more</a>
          </p>

          <Card className="bg-white border-0 shadow-sm mt-6">
            <CardContent className="p-5">
              {emailStatus === "sent" ? (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Check className="w-4 h-4" />
                  Sent! Check your inbox for these picks.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-stone-700">Send these to your inbox</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className="border-stone-200 focus:border-amber-400"
                    />
                    <Button
                      onClick={handleSendEmail}
                      disabled={!emailValue || emailStatus === "sending"}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shrink-0"
                    >
                      {emailStatus === "sending" ? "Sending…" : "Send"}
                    </Button>
                  </div>
                  {emailStatus === "error" && (
                    <p className="text-xs text-red-600 mt-2">{emailError}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {!isSignedIn && (
            <Card className="bg-white border-0 shadow-sm mt-6">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-semibold text-stone-700">Save these for next time</span>
                </div>
                <p className="text-stone-500 text-sm leading-relaxed">
                  A free Loved Ones profile keeps every idea, remembers what you&apos;ve already
                  given each person, and nudges you two weeks before every birthday, holiday,
                  and anniversary.
                </p>
                <a
                  href="/loved-ones"
                  onClick={() => posthog?.capture("cta_clicked", { location: "wizard_results_loved_ones" })}
                  className="mt-3 inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-semibold h-9 px-5 text-sm rounded-md transition-colors"
                >
                  Set up Loved Ones →
                </a>
              </CardContent>
            </Card>
          )}

          {savedGifts.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span className="text-stone-700 text-sm font-semibold">Saved gifts ({savedGifts.length})</span>
              </div>
              <div className="flex flex-col gap-3">
                {savedGifts.map((gift, idx) => (
                  <Card key={idx} className="bg-white border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <GiftThumb gift={gift} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-heading text-sm text-stone-900 truncate">{gift.name}</p>
                          <p className="text-amber-600 text-xs font-semibold">{gift.price}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => removeSavedLocally(gift)}
                            className="p-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                            aria-label="Remove from saved"
                          >
                            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                          </button>
                          <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-8 px-3"
                            onClick={() => handleBuyClick(gift)}
                          >
                            Buy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
        <AssignGiftDialog
          gift={assigningGift}
          open={assigningGift !== null}
          onOpenChange={(open) => {
            if (!open) setAssigningGift(null);
          }}
          onAssigned={() => posthog?.capture("gift_saved", { gift: assigningGift?.name, store: assigningGift?.store })}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Gift className="w-5 h-5 text-amber-500" />
          <span className="font-heading text-xl font-bold text-stone-900 tracking-tight">The Gift Whisperer</span>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-stone-400 uppercase tracking-wider">Step {step} of 4</span>
              <span className="text-xs text-stone-400">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-1.5 w-full rounded-full bg-amber-100 mb-8">
              <div className="h-full rounded-full bg-amber-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            {lovedOne && (
              <div className="flex items-start gap-2 mb-6 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5 text-sm text-amber-800">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Shopping for <span className="font-semibold">{lovedOne.name}</span>. We&apos;ve filled in
                  what their profile tells us, so you can skip ahead.
                </span>
              </div>
            )}

            {apiError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {apiError}
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 className="font-heading text-2xl text-stone-900 mb-1">Who are you buying for?</h1>
                <p className="text-stone-400 text-sm mb-6">Select their relationship and age range</p>
                {savedProfiles.length > 0 && !lovedOne && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                      Shopping for someone you&apos;ve saved?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {savedProfiles.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => pickLovedOne(p.id)}
                          className="px-4 py-2 rounded-full text-sm font-medium border border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer"
                        >
                          <span className="mr-1">{pickRelationshipEmoji(p.relationship)}</span>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Relationship</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {RELATIONSHIPS.map((r) => (
                    <button key={r} onClick={() => setForm((f) => ({ ...f, relationship: r }))} className={pillClass(form.relationship === r)}>{r}</button>
                  ))}
                </div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Age range</p>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((a) => (
                    <button key={a} onClick={() => setForm((f) => ({ ...f, ageRange: a }))} className={pillClass(form.ageRange === a)}>{a}</button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="font-heading text-2xl text-stone-900 mb-1">What&apos;s the occasion?</h1>
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
                      <DoodleIcon
                        name={o.icon}
                        className={cn("w-7 h-7", form.occasion === o.label ? "text-amber-700" : "text-amber-600")}
                      />
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="font-heading text-2xl text-stone-900 mb-1">What are they into?</h1>
                <p className="text-stone-400 text-sm mb-6">Select all that apply</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {INTERESTS.map((i) => (
                    <button key={i} onClick={() => toggleInterest(i)} className={pillClass(form.interests.includes(i))}>{i}</button>
                  ))}
                </div>
                <Input
                  placeholder="Anything else we should know? (optional)"
                  value={form.freetext}
                  onChange={(e) => setForm((f) => ({ ...f, freetext: e.target.value }))}
                  className="border-stone-200 focus:border-amber-400 mb-6"
                />
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Do they prefer experiences or physical gifts?</p>
                <div className="flex flex-wrap gap-2">
                  {GIFT_PREFERENCES.map((p) => (
                    <button key={p.value} onClick={() => setForm((f) => ({ ...f, giftPreference: p.value }))} className={pillClass(form.giftPreference === p.value)}>{p.label}</button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h1 className="font-heading text-2xl text-stone-900 mb-1">What&apos;s your budget?</h1>
                <p className="text-stone-400 text-sm mb-6">We&apos;ll find the best options within your range</p>
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
                <button onClick={back} className="flex items-center gap-1 text-stone-400 hover:text-stone-700 text-sm transition-colors cursor-pointer">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}
              <Button onClick={next} disabled={!canProceed} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold h-9 px-5">
                {step === 4 ? "Find my perfect gifts" : "Next →"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
