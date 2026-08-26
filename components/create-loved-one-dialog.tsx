"use client";

import { useState } from "react";
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

interface CreateLovedOneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (lovedOneId: string) => void;
}

export function CreateLovedOneDialog({ open, onOpenChange, onCreated }: CreateLovedOneDialogProps) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim() || !relationship) {
      setError("Enter a name and relationship first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/loved-ones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), relationship }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't create profile.");
      onCreated(data.lovedOne.id);
      setName("");
      setRelationship("");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a loved one</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <Input
            placeholder="Their name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-stone-200 focus:border-amber-400"
          />
          <Select value={relationship} onValueChange={(v) => setRelationship(v ?? "")}>
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
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={submitting}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold w-full"
          >
            {submitting ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
