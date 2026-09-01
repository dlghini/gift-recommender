"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  name: string;
  price: string | null;
  rationale: string | null;
  url: string | null;
  imageUrl: string | null;
  claimedBy: string | null;
  claimedEmail?: string | null;
  purchased: boolean;
}

interface ListData {
  list: { shareId: string; recipientName: string; occasion: string | null };
  items: Item[];
  isOwner: boolean;
}

export function GiftListView({ shareId }: { shareId: string }) {
  const router = useRouter();
  const [data, setData] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [claimerName, setClaimerName] = useState("");
  const [copied, setCopied] = useState(false);

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addWhy, setAddWhy] = useState("");
  const [addUrl, setAddUrl] = useState("");

  const storeKey = `giftlist_claimer_${shareId}`;

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/lists/${shareId}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((d) => d && setData(d))
      .finally(() => setLoading(false));
  }, [shareId]);

  useEffect(() => {
    load();
    try {
      const stored = localStorage.getItem(storeKey);
      if (stored) {
        setClaimerName(stored);
        setFormName(stored);
      }
    } catch {
      // storage disabled; the claim form still works, just won't be remembered
    }
  }, [load, storeKey]);

  const rememberName = (name: string) => {
    setClaimerName(name);
    try {
      localStorage.setItem(storeKey, name);
    } catch {
      /* ignore */
    }
  };

  const claim = async (itemId: string) => {
    const name = formName.trim();
    if (!name) return;
    const res = await fetch(`/api/lists/${shareId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "claim", claimedBy: name, claimedEmail: formEmail.trim() || null }),
    });
    if (res.ok) {
      rememberName(name);
      setClaimingId(null);
      setFormEmail("");
    }
    load();
  };

  const patchClaim = async (itemId: string, action: "unclaim" | "purchase" | "unpurchase") => {
    await fetch(`/api/lists/${shareId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, claimedBy: claimerName }),
    });
    load();
  };

  const addItem = async () => {
    if (!addName.trim()) return;
    await fetch(`/api/lists/${shareId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addName.trim(),
        price: addPrice.trim() || null,
        rationale: addWhy.trim() || null,
        url: addUrl.trim() || null,
      }),
    });
    setAddName("");
    setAddPrice("");
    setAddWhy("");
    setAddUrl("");
    setAddOpen(false);
    load();
  };

  const deleteItem = async (itemId: string) => {
    await fetch(`/api/lists/${shareId}/items/${itemId}`, { method: "DELETE" });
    load();
  };

  const deleteList = async () => {
    await fetch(`/api/lists/${shareId}`, { method: "DELETE" });
    router.push("/lists");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked; the URL is visible in the field to copy manually */
    }
  };

  if (loading) return <p className="text-stone-400 text-sm">Loading…</p>;
  if (notFound || !data) {
    return (
      <div className="text-center py-20">
        <h1 className="font-heading text-2xl text-stone-900 mb-2">This list isn&apos;t available</h1>
        <p className="text-stone-500 text-sm">The link may be wrong, or the list was removed.</p>
      </div>
    );
  }

  const { list, items, isOwner } = data;
  const mineMatches = (item: Item) =>
    Boolean(claimerName) &&
    Boolean(item.claimedBy) &&
    claimerName.toLowerCase() === item.claimedBy!.toLowerCase();

  return (
    <div>
      <h1 className="font-heading text-2xl text-stone-900">Gift ideas for {list.recipientName}</h1>
      {list.occasion && <p className="text-stone-400 text-sm mt-1">{list.occasion}</p>}

      {isOwner && (
        <div className="mt-5 flex flex-col gap-2">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Share this list</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={typeof window !== "undefined" ? window.location.href : ""}
              className="flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-500"
              onFocus={(e) => e.target.select()}
            />
            <Button onClick={copyLink} className="bg-amber-500 hover:bg-amber-600 text-white text-sm">
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-stone-400">
            Anyone with this link can see the list and claim a gift. They don&apos;t need an account.
          </p>
        </div>
      )}

      {isOwner && (
        <div className="mt-5">
          {addOpen ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col gap-2">
                <Input placeholder="Gift name" value={addName} onChange={(e) => setAddName(e.target.value)} className="border-stone-200 focus:border-amber-400" autoFocus />
                <Input placeholder="Price (optional)" value={addPrice} onChange={(e) => setAddPrice(e.target.value)} className="border-stone-200 focus:border-amber-400" />
                <Input placeholder="Why it fits (optional)" value={addWhy} onChange={(e) => setAddWhy(e.target.value)} className="border-stone-200 focus:border-amber-400" />
                <Input placeholder="Link (optional)" value={addUrl} onChange={(e) => setAddUrl(e.target.value)} className="border-stone-200 focus:border-amber-400" />
                <div className="flex gap-2">
                  <Button onClick={addItem} disabled={!addName.trim()} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">Add</Button>
                  <Button variant="ghost" onClick={() => setAddOpen(false)} className="text-stone-500">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button onClick={() => setAddOpen(true)} variant="outline" className="border-stone-200 text-stone-600">
              <Plus className="w-4 h-4 mr-1" /> Add a gift
            </Button>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-stone-400 text-sm">
            {isOwner ? "No gifts yet. Add a few, then share the link." : "Nothing on this list yet."}
          </p>
        ) : (
          items.map((item) => {
            const mine = mineMatches(item);
            return (
              <Card key={item.id} className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm text-stone-900">{item.name}</p>
                      {item.price && <p className="text-amber-600 font-semibold text-xs mt-0.5">{item.price}</p>}
                      {item.rationale && <p className="text-stone-500 text-sm mt-1.5 leading-relaxed">{item.rationale}</p>}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700">
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      )}
                    </div>
                    {isOwner && (
                      <button onClick={() => deleteItem(item.id)} className="text-stone-300 hover:text-stone-500 shrink-0 cursor-pointer" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-stone-100">
                    {!item.claimedBy ? (
                      claimingId === item.id ? (
                        <div className="flex flex-col gap-2">
                          <Input placeholder="Your name" value={formName} onChange={(e) => setFormName(e.target.value)} className="border-stone-200 focus:border-amber-400 h-9" autoFocus />
                          <Input placeholder="Email (optional, for updates)" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="border-stone-200 focus:border-amber-400 h-9" />
                          <div className="flex gap-2">
                            <Button onClick={() => claim(item.id)} disabled={!formName.trim()} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold h-8 text-sm">Claim it</Button>
                            <Button variant="ghost" onClick={() => setClaimingId(null)} className="text-stone-500 h-8 text-sm">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setClaimingId(item.id); if (claimerName) setFormName(claimerName); }}
                          className="text-sm font-medium text-amber-600 hover:text-amber-700 cursor-pointer"
                        >
                          Claim this
                        </button>
                      )
                    ) : (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="text-sm text-stone-500">
                          Claimed by <span className="font-medium text-stone-700">{item.claimedBy}</span>
                        </span>
                        {item.purchased && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Purchased
                          </span>
                        )}
                        {mine ? (
                          <>
                            <button
                              onClick={() => patchClaim(item.id, item.purchased ? "unpurchase" : "purchase")}
                              className="text-xs font-medium text-amber-600 hover:text-amber-700 cursor-pointer"
                            >
                              {item.purchased ? "Undo purchased" : "Mark purchased"}
                            </button>
                            <button
                              onClick={() => patchClaim(item.id, "unclaim")}
                              className="text-xs font-medium text-stone-400 hover:text-stone-600 cursor-pointer"
                            >
                              Release
                            </button>
                          </>
                        ) : (
                          !claimerName && (
                            <button
                              onClick={() => {
                                const n = window.prompt("What name did you claim with?")?.trim();
                                if (n) rememberName(n);
                              }}
                              className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
                            >
                              This is my claim
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className={cn("mt-10 flex items-center justify-between", !isOwner && "justify-center")}>
        <Link href="/" className="text-xs text-stone-400 hover:text-stone-600">
          Made with The Gift Whisperer
        </Link>
        {isOwner && (
          <button onClick={deleteList} className="text-xs text-stone-400 hover:text-red-500 cursor-pointer">
            Delete this list
          </button>
        )}
      </div>
    </div>
  );
}
