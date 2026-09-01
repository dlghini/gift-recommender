"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ListRow {
  id: string;
  share_id: string;
  recipient_name: string;
  occasion: string | null;
  item_count: number;
  claimed_count: number;
}

export function GiftListsDashboard() {
  const router = useRouter();
  const [lists, setLists] = useState<ListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/lists")
      .then((r) => r.json())
      .then((d) => setLists(d.lists ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createList = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName: name.trim(), occasion: occasion.trim() || null }),
      });
      const data = await res.json();
      if (data.list?.share_id) {
        router.push(`/lists/${data.list.share_id}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const deleteList = async (shareId: string) => {
    await fetch(`/api/lists/${shareId}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-heading text-3xl text-stone-900">Group gift lists</h1>
          <p className="text-stone-400 text-sm mt-1">
            Share a list so everyone claims a gift and nobody doubles up.
          </p>
        </div>
        <Button
          onClick={() => setCreating((v) => !v)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-1" /> New list
        </Button>
      </div>

      <Link
        href="/loved-ones"
        className="text-sm text-amber-600 hover:text-amber-700 font-medium"
      >
        &larr; Back to Loved ones
      </Link>

      {creating && (
        <Card className="bg-white border-0 shadow-sm mt-5">
          <CardContent className="p-5 flex flex-col gap-3">
            <Input
              placeholder="Who is the list for? (e.g. Mom)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-stone-200 focus:border-amber-400"
              autoFocus
            />
            <Input
              placeholder="Occasion (optional, e.g. her 60th)"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="border-stone-200 focus:border-amber-400"
            />
            <div className="flex gap-2">
              <Button
                onClick={createList}
                disabled={!name.trim() || busy}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                Create list
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCreating(false)}
                className="text-stone-500"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <p className="text-stone-400 text-sm">Loading…</p>
        ) : lists.length === 0 ? (
          <p className="text-stone-400 text-sm">
            No lists yet. Create one, add a few gift ideas, and share the link.
          </p>
        ) : (
          lists.map((list) => (
            <Card key={list.id} className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Link href={`/lists/${list.share_id}`} className="flex-1 min-w-0">
                  <p className="font-heading text-sm text-stone-900 truncate">
                    {list.recipient_name}
                    {list.occasion ? (
                      <span className="font-sans text-stone-400"> · {list.occasion}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3" />
                    {list.claimed_count} of {list.item_count} claimed
                  </p>
                </Link>
                <button
                  onClick={() => deleteList(list.share_id)}
                  className="text-stone-300 hover:text-stone-500 shrink-0 cursor-pointer"
                  aria-label="Delete list"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
