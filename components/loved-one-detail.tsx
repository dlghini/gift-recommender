"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Check, Gift as GiftIcon, Heart, Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  RELATIONSHIPS,
  PARTNER_RELATIONSHIPS,
  pickRelationshipEmoji,
} from "@/components/relationship-emoji";
import { applicableHolidays } from "@/lib/holidays";
import { INTERESTS } from "@/lib/interests";
import { cn } from "@/lib/utils";
import { useResolvedImage } from "@/lib/use-resolved-image";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Today's calendar date in the viewer's own zone, as YYYY-MM-DD. Going through
// toISOString() would use UTC and record tomorrow's date for evening users west
// of UTC.
function todayLocalISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface LovedOneRow {
  id: string;
  name: string;
  relationship: string;
  birthday_month: number | null;
  birthday_day: number | null;
  birthday_year: number | null;
  anniversary_month: number | null;
  anniversary_day: number | null;
  interests: string[] | null;
  interests_notes: string | null;
  birthday_reminder_enabled: boolean;
  anniversary_reminder_enabled: boolean;
}

interface GiftRow {
  id: string;
  status: "idea" | "given";
  name: string;
  price: string | null;
  rationale: string | null;
  occasion_label: string | null;
  given_at: string | null;
  image_url: string | null;
  search_query: string | null;
  tags: string[] | null;
}

// Same real-photo-or-fallback pattern as the wizard's GiftThumb, with the same retry-before-giving-up
// behavior — these images can be weeks old by the time someone views a saved idea or gift history, well
// past Pixabay's ~24h URL validity, so a load failure here is the common case, not the rare one.
function LovedOneGiftThumb({ gift }: { gift: GiftRow }) {
  const { src, failed, handleError } = useResolvedImage(gift.image_url, gift.search_query || gift.name, gift.tags ?? []);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={gift.name}
        className="w-10 h-10 shrink-0 rounded-lg object-cover bg-stone-100"
        onError={handleError}
      />
    );
  }
  return (
    <div className="w-10 h-10 shrink-0 rounded-lg bg-amber-50 flex items-center justify-center">
      <GiftIcon className="w-4 h-4 text-amber-400" />
    </div>
  );
}

interface HolidayPref {
  holiday_key: string;
  enabled: boolean;
}

function DateFields({
  month,
  day,
  onChange,
}: {
  month: number | null;
  day: number | null;
  onChange: (month: number | null, day: number | null) => void;
}) {
  return (
    <div className="flex gap-2">
      <Select
        value={month ? String(month) : undefined}
        onValueChange={(v) => onChange(v ? Number(v) : null, day)}
      >
        <SelectTrigger className="w-28 border-stone-200">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m, idx) => (
            <SelectItem key={m} value={String(idx + 1)}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        min={1}
        max={31}
        placeholder="Day"
        value={day ?? ""}
        onChange={(e) => onChange(month, e.target.value ? Number(e.target.value) : null)}
        className="w-20 border-stone-200 focus:border-amber-400"
      />
    </div>
  );
}

export function LovedOneDetail({ id }: { id: string }) {
  const [lovedOne, setLovedOne] = useState<LovedOneRow | null>(null);
  const [holidayPrefs, setHolidayPrefs] = useState<HolidayPref[]>([]);
  const [gifts, setGifts] = useState<GiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [logName, setLogName] = useState("");
  const [logOccasion, setLogOccasion] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/loved-ones/${id}`).then((r) => r.json()),
      fetch(`/api/loved-ones/${id}/gifts`).then((r) => r.json()),
    ])
      .then(([detail, giftsData]) => {
        setLovedOne(detail.lovedOne ?? null);
        setHolidayPrefs(detail.holidayPrefs ?? []);
        setGifts(giftsData.gifts ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const isHolidayEnabled = (key: string) => {
    const pref = holidayPrefs.find((p) => p.holiday_key === key);
    return pref ? pref.enabled : true;
  };

  const toggleHoliday = async (key: string) => {
    const nextEnabled = !isHolidayEnabled(key);
    setHolidayPrefs((prev) => {
      const existing = prev.find((p) => p.holiday_key === key);
      if (existing) return prev.map((p) => (p.holiday_key === key ? { ...p, enabled: nextEnabled } : p));
      return [...prev, { holiday_key: key, enabled: nextEnabled }];
    });
    await fetch(`/api/loved-ones/${id}/holidays`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holidayKey: key, enabled: nextEnabled }),
    });
  };

  const saveProfile = async (patch: Partial<LovedOneRow>) => {
    if (!lovedOne) return;
    const next = { ...lovedOne, ...patch };
    setLovedOne(next);
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/loved-ones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: next.name,
          relationship: next.relationship,
          birthdayMonth: next.birthday_month,
          birthdayDay: next.birthday_day,
          birthdayYear: next.birthday_year,
          anniversaryMonth: next.anniversary_month,
          anniversaryDay: next.anniversary_day,
          interests: next.interests ?? [],
          interestsNotes: next.interests_notes,
          birthdayReminderEnabled: next.birthday_reminder_enabled,
          anniversaryReminderEnabled: next.anniversary_reminder_enabled,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  const toggleInterest = (interest: string) => {
    const current = lovedOne?.interests ?? [];
    const next = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    saveProfile({ interests: next });
  };

  const markGiven = async (giftId: string) => {
    await fetch(`/api/loved-ones/${id}/gifts/${giftId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ givenAt: todayLocalISO() }),
    });
    load();
  };

  const deleteGift = async (giftId: string) => {
    await fetch(`/api/loved-ones/${id}/gifts/${giftId}`, { method: "DELETE" });
    load();
  };

  const logPastGift = async () => {
    if (!logName.trim()) return;
    await fetch(`/api/loved-ones/${id}/gifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "given",
        name: logName.trim(),
        occasionLabel: logOccasion.trim() || undefined,
        givenAt: todayLocalISO(),
      }),
    });
    setLogName("");
    setLogOccasion("");
    load();
  };

  if (loading || !lovedOne) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Loading…</p>
      </div>
    );
  }

  const isPartnerType = PARTNER_RELATIONSHIPS.includes(lovedOne.relationship);
  const holidays = applicableHolidays(lovedOne.relationship);
  const ideas = gifts.filter((g) => g.status === "idea");
  const given = gifts.filter((g) => g.status === "given");

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/loved-ones"
          className="flex items-center gap-1 text-stone-400 hover:text-stone-700 text-sm transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> All loved ones
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">{pickRelationshipEmoji(lovedOne.relationship)}</span>
          <div>
            <h1 className="font-heading text-2xl text-stone-900">{lovedOne.name}</h1>
            <p className="text-stone-400 text-sm">{lovedOne.relationship}</p>
          </div>
        </div>

        <Link href={`/wizard?lovedOneId=${id}`}>
          <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold mb-8">
            <Sparkles className="w-4 h-4 mr-1.5" /> Get ideas for {lovedOne.name}
          </Button>
        </Link>

        <Card className="bg-white border-0 shadow-sm mb-6">
          <CardContent className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-end -mb-2 h-4">
              {saveStatus === "saving" && <p className="text-xs text-stone-400">Saving…</p>}
              {saveStatus === "saved" && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved
                </p>
              )}
              {saveStatus === "error" && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Couldn&apos;t save — try again
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Name</p>
              <Input
                value={lovedOne.name}
                onChange={(e) => setLovedOne({ ...lovedOne, name: e.target.value })}
                onBlur={() => saveProfile({})}
                className="border-stone-200 focus:border-amber-400"
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Relationship</p>
              <Select
                value={lovedOne.relationship}
                onValueChange={(v) => v && saveProfile({ relationship: v })}
              >
                <SelectTrigger className="w-full border-stone-200">
                  <SelectValue />
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

            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Birthday</p>
              <DateFields
                month={lovedOne.birthday_month}
                day={lovedOne.birthday_day}
                onChange={(m, d) => saveProfile({ birthday_month: m, birthday_day: d })}
              />
              <Input
                type="number"
                placeholder="Birth year (optional)"
                value={lovedOne.birthday_year ?? ""}
                onChange={(e) =>
                  setLovedOne({ ...lovedOne, birthday_year: e.target.value ? Number(e.target.value) : null })
                }
                onBlur={() => saveProfile({})}
                className="w-40 border-stone-200 focus:border-amber-400 mt-2"
              />
              <p className="text-xs text-stone-400 mt-1.5">
                Know their birth year? It helps us fine-tune recommendations — totally optional.
              </p>
              {lovedOne.birthday_month && lovedOne.birthday_day && (
                <label className="flex items-center gap-2 text-sm text-stone-600 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lovedOne.birthday_reminder_enabled}
                    onChange={(e) => saveProfile({ birthday_reminder_enabled: e.target.checked })}
                    className="accent-amber-500"
                  />
                  Remind me before their birthday
                </label>
              )}
            </div>

            {isPartnerType && (
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Anniversary</p>
                <DateFields
                  month={lovedOne.anniversary_month}
                  day={lovedOne.anniversary_day}
                  onChange={(m, d) => saveProfile({ anniversary_month: m, anniversary_day: d })}
                />
                {lovedOne.anniversary_month && lovedOne.anniversary_day && (
                  <label className="flex items-center gap-2 text-sm text-stone-600 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lovedOne.anniversary_reminder_enabled}
                      onChange={(e) => saveProfile({ anniversary_reminder_enabled: e.target.checked })}
                      className="accent-amber-500"
                    />
                    Remind me before your anniversary
                  </label>
                )}
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => {
                  const on = (lovedOne.interests ?? []).includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleInterest(i)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                        on
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-stone-400 border-stone-200 hover:border-amber-200"
                      )}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-stone-400 mt-1.5">
                Checked interests are sent straight to the search when you get ideas for {lovedOne.name}.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Notes</p>
              <textarea
                value={lovedOne.interests_notes ?? ""}
                onChange={(e) => setLovedOne({ ...lovedOne, interests_notes: e.target.value })}
                onBlur={() => saveProfile({})}
                placeholder="What do they love? Hobbies, things they already own, things they've mentioned wanting…"
                rows={3}
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:border-amber-400 focus:outline-none resize-none"
              />
            </div>

            {holidays.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Holiday reminders
                </p>
                <div className="flex flex-wrap gap-2">
                  {holidays.map((h) => {
                    const enabled = isHolidayEnabled(h.key);
                    return (
                      <button
                        key={h.key}
                        onClick={() => toggleHoliday(h.key)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                          enabled
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-white text-stone-400 border-stone-200"
                        )}
                      >
                        {h.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="ideas">
          <TabsList>
            <TabsTrigger value="ideas">Ideas ({ideas.length})</TabsTrigger>
            <TabsTrigger value="given">Given ({given.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ideas">
            {ideas.length === 0 ? (
              <p className="text-stone-400 text-sm py-6 text-center">
                No ideas saved yet — try &quot;Get ideas for {lovedOne.name}&quot; above.
              </p>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                {ideas.map((gift) => (
                  <Card key={gift.id} className="bg-white border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                      <LovedOneGiftThumb gift={gift} />
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm text-stone-900 truncate">{gift.name}</p>
                        {gift.price && <p className="text-amber-600 text-xs font-semibold">{gift.price}</p>}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => markGiven(gift.id)}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-8 px-3 shrink-0"
                      >
                        Mark as given
                      </Button>
                      <button
                        onClick={() => deleteGift(gift.id)}
                        className="text-stone-300 hover:text-stone-500 shrink-0 cursor-pointer"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="given">
            <Card className="bg-white border-0 shadow-sm mt-4">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Log a past gift
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="What did you get them?"
                    value={logName}
                    onChange={(e) => setLogName(e.target.value)}
                    className="border-stone-200 focus:border-amber-400"
                  />
                  <Input
                    placeholder="Occasion (optional)"
                    value={logOccasion}
                    onChange={(e) => setLogOccasion(e.target.value)}
                    className="border-stone-200 focus:border-amber-400 w-40"
                  />
                  <Button
                    onClick={logPastGift}
                    disabled={!logName.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                  >
                    Log
                  </Button>
                </div>
              </CardContent>
            </Card>

            {given.length > 0 && (
              <div className="flex flex-col gap-3 mt-4">
                {given.map((gift) => (
                  <Card key={gift.id} className="bg-white border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                      <LovedOneGiftThumb gift={gift} />
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm text-stone-900 truncate">{gift.name}</p>
                        <p className="text-xs text-stone-400">
                          {[gift.occasion_label, gift.given_at].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteGift(gift.id)}
                        className="text-stone-300 hover:text-stone-500 shrink-0 cursor-pointer"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <p className="text-xs text-stone-400 mt-8 flex items-center gap-1">
          <Heart className="w-3 h-3" /> Every gift here stays private to your account.
        </p>
      </div>
    </div>
  );
}
