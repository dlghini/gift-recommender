"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUIZ, scoreQuiz } from "@/lib/gifting-style";

export function GiftingStyleQuiz() {
  const router = useRouter();
  const posthog = usePostHog();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [started, setStarted] = useState(false);

  const question = QUIZ[step];
  const progress = Math.round((step / QUIZ.length) * 100);

  const choose = (optionIndex: number) => {
    if (!started) {
      posthog?.capture("quiz_started");
      setStarted(true);
    }
    const next = [...answers];
    next[step] = optionIndex;
    setAnswers(next);

    if (step < QUIZ.length - 1) {
      setStep(step + 1);
      return;
    }
    const archetype = scoreQuiz(next);
    posthog?.capture("quiz_completed", { archetype });
    router.push(`/gifting-style/${archetype}`);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
          <span>
            Question {step + 1} of {QUIZ.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
      </div>

      <h1 className="font-heading text-2xl sm:text-3xl text-stone-900 mb-6 leading-snug">
        {question.prompt}
      </h1>

      <div className="flex flex-col gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => choose(idx)}
            className={cn(
              "text-left rounded-xl border px-4 py-3.5 text-sm font-medium transition-all cursor-pointer",
              "bg-white border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50/60"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-6 inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}
    </div>
  );
}
