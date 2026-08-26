"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Gift as GiftIcon, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pickRelationshipEmoji } from "@/components/relationship-emoji";
import { applicableHolidays } from "@/lib/holidays";
import { CreateLovedOneDialog } from "@/components/create-loved-one-dialog";
import { AssignGiftDialog, type AssignableGift } from "@/components/assign-gift-dialog";

interface LovedOneRow {
  id: string;
  name: string;
  relationship: string;
  birthday_month: number | null;
  birthday_day: number | null;
  anniversary_month: number | null;
  anniversary_day: number | null;
}

const LEGACY_SAVED_KEY = "giftspark_saved";

function nextOccasion(lo: LovedOneRow): { label: string; date: Date } | null {
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const years = [todayUtc.getUTCFullYear(), todayUtc.getUTCFullYear() + 1];
  const candidates: { label: string; date: Date }[] = [];

  const consider = (label: string, month: number | null, day: number | null) => {
    if (!month || !day) return;
    for (const year of years) {
      const date = new Date(Date.UTC(year, month - 1, day));
      if (date.getTime() >= todayUtc.getTime()) {
        candidates.push({ label, date });
        return;
      }
    }
  };

  consider("Birthday", lo.birthday_month, lo.birthday_day);
  consider("Anniversary", lo.anniversary_month, lo.anniversary_day);
  for (const rule of applicableHolidays(lo.relationship)) {
    for (const year of years) {
      const { month, day } = rule.getDate(year);
      const date = new Date(Date.UTC(year, month - 1, day));
      if (date.getTime() >= todayUtc.getTime()) {
        candidates.push({ label: rule.label, date });
        break;
      }
    }
  }

  candidates.sort((a, b) => a.date.getTime() - b.date.getTime());
  return candidates[0] ?? null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LovedOnesList() {
  const router = useRouter();
  const [lovedOnes, setLovedOnes] = useState<LovedOneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingLegacyGifts, setPendingLegacyGifts] = useState<AssignableGift[]>([]);
  const [assigningGift, setAssigningGift] = useState<AssignableGift | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/loved-ones")
      .then((res) => res.json())
      .then((data) => setLovedOnes(data.lovedOnes ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    try {
      const stored = localStorage.getItem(LEGACY_SAVED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AssignableGift[];
        if (Array.isArray(parsed) && parsed.length > 0) setPendingLegacyGifts(parsed);
      }
    } catch {
      // ignore malformed local data
    }
  }, []);

  const resolveLegacyGift = (gift: AssignableGift) => {
    const remaining = pendingLegacyGifts.filter((g) => g !== gift);
    setPendingLegacyGifts(remaining);
    if (remaining.length === 0) {
      localStorage.removeItem(LEGACY_SAVED_KEY);
    } else {
      localStorage.setItem(LEGACY_SAVED_KEY, JSON.stringify(remaining));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-stone-900">Loved ones</h1>
          <p className="text-stone-400 text-sm mt-1">People you buy gifts for, remembered.</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {pendingLegacyGifts.length > 0 && (
        <Card className="bg-white border-0 shadow-sm mb-6">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-stone-700 mb-3">
              Assign your {pendingLegacyGifts.length} saved gift idea{pendingLegacyGifts.length > 1 ? "s" : ""} to someone
            </p>
            <div className="flex flex-col gap-2">
              {pendingLegacyGifts.map((gift, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-stone-600 truncate">{gift.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setAssigningGift(gift)}
                      className="text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => resolveLegacyGift(gift)}
                      className="text-stone-300 hover:text-stone-500 cursor-pointer"
                      aria-label="Skip"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-stone-400 text-sm">Loading…</p>
      ) : lovedOnes.length === 0 ? (
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-10 text-center">
            <GiftIcon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-stone-600 text-sm">
              Add the people you buy gifts for so we can remember their birthdays and past gifts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lovedOnes.map((lo) => {
            const occasion = nextOccasion(lo);
            return (
              <Link key={lo.id} href={`/loved-ones/${lo.id}`}>
                <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-5 flex items-center gap-3">
                    <span className="text-3xl shrink-0">{pickRelationshipEmoji(lo.relationship)}</span>
                    <div className="min-w-0">
                      <p className="font-heading text-base text-stone-900 truncate">{lo.name}</p>
                      <p className="text-xs text-stone-400">{lo.relationship}</p>
                      {occasion && (
                        <p className="text-xs text-amber-600 font-medium mt-1">
                          {occasion.label} · {formatDate(occasion.date)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <CreateLovedOneDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => router.push(`/loved-ones/${id}`)}
      />
      <AssignGiftDialog
        gift={assigningGift}
        open={assigningGift !== null}
        onOpenChange={(open) => {
          if (!open) setAssigningGift(null);
        }}
        onAssigned={() => {
          if (assigningGift) resolveLegacyGift(assigningGift);
        }}
      />
    </div>
  );
}
