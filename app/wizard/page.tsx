import type { Metadata } from "next";
import WizardClient from "./wizard-client";

// Thin server wrapper: the wizard itself is a client component, but the route
// still needs its own metadata (title, description, self-referencing canonical).
// The canonical also collapses the `?share=` / `?lovedOneId=` variants of this
// URL onto the clean /wizard path for indexing.
export const metadata: Metadata = {
  title: "Find a gift",
  description:
    "Answer a few quick questions about who you're shopping for and get gift ideas matched to them.",
  alternates: { canonical: "/wizard" },
};

export default function Page() {
  return <WizardClient />;
}
