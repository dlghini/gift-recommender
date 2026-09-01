import type { Metadata } from "next";
import { GiftListView } from "@/components/gift-list-view";

// A share link is private by nature: never index it.
export const metadata: Metadata = {
  title: "Group gift list",
  robots: { index: false, follow: false },
};

export default async function GiftListPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <GiftListView shareId={shareId} />
      </div>
    </div>
  );
}
