import WizardClient from "./wizard-client";
import { routeMeta } from "@/lib/site";

// Thin server wrapper: the wizard itself is a client component, but the route
// still needs its own metadata (title, description, self-referencing canonical +
// matching og:url). The canonical also collapses the `?share=` / `?lovedOneId=`
// variants of this URL onto the clean /wizard path for indexing.
export const metadata = routeMeta(
  "/wizard",
  "Find a gift",
  "Answer a few quick questions about the person and the occasion, and get a short list of gift ideas actually matched to them. Free, no sign-up."
);

export default function Page() {
  return <WizardClient />;
}
