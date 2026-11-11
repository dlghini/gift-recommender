import { Card } from "@/components/ui/card";

export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <Card className="items-center gap-1 px-3 py-5 text-center ring-stone-200">
      <p className="font-heading text-3xl text-stone-900 tabular-nums">{value}</p>
      <p className="text-xs leading-snug text-stone-500">{label}</p>
    </Card>
  );
}
