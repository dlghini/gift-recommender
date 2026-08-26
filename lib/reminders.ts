import { applicableHolidays } from "@/lib/holidays";

export const REMINDER_LEAD_DAYS = 14;

export interface LovedOneRow {
  id: string;
  name: string;
  relationship: string;
  birthday_month: number | null;
  birthday_day: number | null;
  anniversary_month: number | null;
  anniversary_day: number | null;
  birthday_reminder_enabled: boolean;
  anniversary_reminder_enabled: boolean;
}

export interface DueOccasion {
  lovedOneId: string;
  occasionKey: string; // "birthday" | "anniversary" | a holiday key
  occasionYear: number;
  label: string;
  date: Date;
}

function toUtcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function withinLeadWindow(today: Date, occasion: Date): boolean {
  const diffDays = (occasion.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= REMINDER_LEAD_DAYS;
}

/**
 * `disabledHolidayKeys` holds `${lovedOneId}:${holidayKey}` for every explicit
 * per-profile opt-out (rows in `holiday_reminder_prefs` with enabled=false).
 * Absence from the set means the holiday is on, matching the DB's
 * opt-out-only storage model.
 */
export function findDueOccasions(
  lovedOnes: LovedOneRow[],
  disabledHolidayKeys: Set<string>,
  today: Date = new Date()
): DueOccasion[] {
  const due: DueOccasion[] = [];
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  // Check this year and next, so occasions just after Dec 31 are still caught in late-December windows.
  const years = [todayUtc.getUTCFullYear(), todayUtc.getUTCFullYear() + 1];

  for (const lovedOne of lovedOnes) {
    if (lovedOne.birthday_reminder_enabled && lovedOne.birthday_month && lovedOne.birthday_day) {
      for (const year of years) {
        const date = toUtcDate(year, lovedOne.birthday_month, lovedOne.birthday_day);
        if (withinLeadWindow(todayUtc, date)) {
          due.push({
            lovedOneId: lovedOne.id,
            occasionKey: "birthday",
            occasionYear: year,
            label: `${lovedOne.name}'s birthday`,
            date,
          });
        }
      }
    }

    if (lovedOne.anniversary_reminder_enabled && lovedOne.anniversary_month && lovedOne.anniversary_day) {
      for (const year of years) {
        const date = toUtcDate(year, lovedOne.anniversary_month, lovedOne.anniversary_day);
        if (withinLeadWindow(todayUtc, date)) {
          due.push({
            lovedOneId: lovedOne.id,
            occasionKey: "anniversary",
            occasionYear: year,
            label: `your anniversary with ${lovedOne.name}`,
            date,
          });
        }
      }
    }

    for (const rule of applicableHolidays(lovedOne.relationship)) {
      if (disabledHolidayKeys.has(`${lovedOne.id}:${rule.key}`)) continue;
      for (const year of years) {
        const { month, day } = rule.getDate(year);
        const date = toUtcDate(year, month, day);
        if (withinLeadWindow(todayUtc, date)) {
          due.push({
            lovedOneId: lovedOne.id,
            occasionKey: rule.key,
            occasionYear: year,
            label: `${rule.label} for ${lovedOne.name}`,
            date,
          });
        }
      }
    }
  }

  return due;
}
