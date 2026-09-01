import { GiftingStyleQuiz } from "@/components/gifting-style-quiz";
import { routeMeta } from "@/lib/site";

export const metadata = routeMeta(
  "/gifting-style",
  "What's your gifting style?",
  "A quick six-question quiz. Are you the Overthinker, the Last-Minute Legend, the Experience Giver, or something else? Find out and see what to do about it."
);

export default function GiftingStylePage() {
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <GiftingStyleQuiz />
      </div>
    </div>
  );
}
