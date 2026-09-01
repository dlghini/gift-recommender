"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RELATIONSHIPS, pickRelationshipEmoji } from "@/components/relationship-emoji";

export interface AssignableGift {
  name: string;
  price?: string;
  rationale?: string;
  tags?: string[];
  affiliateUrl?: string;
  type?: "product" | "experience";
  store?: string;
  searchQuery?: string;
  imageUrl?: string;
  runId?: string;
}

interface LovedOne {
  id: string;
  name: string;
  relationship: string;
}

interface AssignGiftDialogProps {
  gift: AssignableGift | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: (lovedOneId: string) => void;
}

export function AssignGiftDialog({ gift, open, onOpenChange, onAssigned }: AssignGiftDialogProps) {
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setLoading(true);
    fetch("/api/loved-ones")
      .then((res) => res.json())
      .then((data) => {
        const rows: LovedOne[] = data.lovedOnes ?? [];
        setLovedOnes(rows);
        setCreatingNew(rows.length === 0);
        setSelectedId(rows[0]?.id ?? null);
      })
      .catch(() => setError("Couldn't load your loved ones. Try again."))
      .finally(() => setLoading(false));
  }, [open]);

  const reset = () => {
    setCreatingNew(false);
    setNewName("");
    setNewRelationship("");
    setError(null);
  };

  const handleSave = async () => {
    if (!gift) return;
    setSubmitting(true);
    setError(null);
    try {
      let lovedOneId = selectedId;

      if (creatingNew) {
        if (!newName.trim() || !newRelationship) {
          setError("Enter a name and relationship first.");
          setSubmitting(false);
          return;
        }
        const createRes = await fetch("/api/loved-ones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName.trim(), relationship: newRelationship }),
        });
        const createData = await createRes.json();
        if (!createRes.ok) throw new Error(createData?.error ?? "Couldn't create profile.");
        lovedOneId = createData.lovedOne.id;
      }

      if (!lovedOneId) {
        setError("Choose someone to save this for.");
        setSubmitting(false);
        return;
      }

      const giftRes = await fetch(`/api/loved-ones/${lovedOneId}/gifts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "idea",
          name: gift.name,
          price: gift.price,
          rationale: gift.rationale,
          tags: gift.tags ?? [],
          affiliateUrl: gift.affiliateUrl,
          type: gift.type,
          store: gift.store,
          searchQuery: gift.searchQuery,
          imageUrl: gift.imageUrl,
          runId: gift.runId,
        }),
      });
      const giftData = await giftRes.json();
      if (!giftRes.ok) throw new Error(giftData?.error ?? "Couldn't save this gift.");

      onAssigned?.(lovedOneId);
      reset();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Who&apos;s this gift for?</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-stone-400 py-4">Loading your loved ones…</p>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            {lovedOnes.length > 0 && !creatingNew && (
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {lovedOnes.map((lo) => (
                  <button
                    key={lo.id}
                    onClick={() => setSelectedId(lo.id)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                      selectedId === lo.id
                        ? "border-amber-400 bg-amber-50"
                        : "border-stone-200 hover:border-amber-200"
                    }`}
                  >
                    <span className="text-xl">{pickRelationshipEmoji(lo.relationship)}</span>
                    <span>
                      <span className="font-medium text-stone-800">{lo.name}</span>{" "}
                      <span className="text-stone-400">· {lo.relationship}</span>
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setCreatingNew(true)}
                  className="text-sm font-medium text-amber-600 hover:text-amber-700 text-left px-1 cursor-pointer"
                >
                  + Someone new
                </button>
              </div>
            )}

            {creatingNew && (
              <div className="flex flex-col gap-3">
                {lovedOnes.length > 0 && (
                  <button
                    onClick={() => setCreatingNew(false)}
                    className="text-xs text-stone-400 hover:text-stone-600 self-start cursor-pointer"
                  >
                    ← Choose someone existing
                  </button>
                )}
                <Input
                  placeholder="Their name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border-stone-200 focus:border-amber-400"
                />
                <Select value={newRelationship} onValueChange={(v) => setNewRelationship(v ?? "")}>
                  <SelectTrigger className="w-full border-stone-200">
                    <SelectValue placeholder="Relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {pickRelationshipEmoji(r)} {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={submitting || loading}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold w-full"
          >
            {submitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
