export interface HolidayRule {
  key: string;
  label: string;
  /** Relationship values this holiday applies to; empty array means it applies to every profile. */
  relationships: string[];
  getDate: (year: number) => { month: number; day: number };
}

/** Returns the {month, day} of the nth given weekday (0=Sunday) of a month, for a given year. */
function nthWeekdayOfMonth(month: number, weekday: number, n: number) {
  return (year: number) => {
    const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const firstWeekdayOffset = (7 + weekday - firstOfMonth.getUTCDay()) % 7;
    const day = 1 + firstWeekdayOffset + (n - 1) * 7;
    return { month, day };
  };
}

export const HOLIDAY_RULES: HolidayRule[] = [
  {
    key: "mothers_day",
    label: "Mother's Day",
    relationships: ["Mother"],
    getDate: nthWeekdayOfMonth(5, 0, 2), // 2nd Sunday of May
  },
  {
    key: "fathers_day",
    label: "Father's Day",
    relationships: ["Father"],
    getDate: nthWeekdayOfMonth(6, 0, 3), // 3rd Sunday of June
  },
  {
    key: "valentines_day",
    label: "Valentine's Day",
    relationships: ["Husband", "Wife", "Boyfriend", "Girlfriend", "Partner"],
    getDate: () => ({ month: 2, day: 14 }),
  },
  {
    key: "christmas",
    label: "Christmas",
    relationships: [],
    getDate: () => ({ month: 12, day: 25 }),
  },
];

/** Which HOLIDAY_RULES apply by default to a given relationship value (before any per-profile opt-out). */
export function applicableHolidays(relationship: string): HolidayRule[] {
  return HOLIDAY_RULES.filter(
    (rule) => rule.relationships.length === 0 || rule.relationships.includes(relationship)
  );
}
