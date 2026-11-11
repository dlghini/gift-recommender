// Plain CSS bars for the research page. Server component, no chart library.
export interface BarItem {
  label: string;
  value: number;
  /** Text shown at the end of the row; defaults to the value with a percent sign. */
  display?: string;
  note?: string;
}

export function BarList({
  items,
  max,
  unit = "%",
  tone = "amber",
}: {
  items: BarItem[];
  /** Value that fills the whole bar. Defaults to the largest value in the list. */
  max?: number;
  unit?: string;
  tone?: "amber" | "stone";
}) {
  const top = max ?? Math.max(...items.map((i) => i.value), 1);
  const bar = tone === "amber" ? "bg-amber-400" : "bg-stone-300";
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-stone-700">{item.label}</span>
            <span className="shrink-0 tabular-nums text-stone-500">
              {item.display ?? `${item.value}${unit}`}
            </span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-stone-100" role="presentation">
            <div
              className={`h-2 rounded-full ${bar}`}
              style={{ width: `${Math.max(2, Math.min(100, (item.value / top) * 100))}%` }}
            />
          </div>
          {item.note && <p className="mt-0.5 text-xs text-stone-400">{item.note}</p>}
        </li>
      ))}
    </ul>
  );
}
