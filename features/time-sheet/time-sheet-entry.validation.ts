import type { TFunction } from "i18next";
import type { TimeEntryRecord } from "@/app/services/time-sheet.service";
import type { TimeSheetEntryFormValues } from "./time-sheet-entry.types";

type Interval = {
  start: number;
  end: number;
  label: string;
};

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function periodLabel(t: TFunction, index: number): string {
  return t("timesheet.form.period", { number: index });
}

function buildIntervalsFromForm(
  values: TimeSheetEntryFormValues,
  t: TFunction,
): Interval[] {
  if (!values.startTime || !values.endTime) {
    return [];
  }

  const intervals: Interval[] = [];

  const start1 = parseTime(values.startTime);
  let end1 = parseTime(values.endTime);
  if (end1 < start1) end1 += 24 * 60;
  intervals.push({ start: start1, end: end1, label: periodLabel(t, 1) });

  if (values.hasInterval2 && values.startTime2 && values.endTime2) {
    const start2 = parseTime(values.startTime2);
    let end2 = parseTime(values.endTime2);
    if (end2 < start2) end2 += 24 * 60;
    intervals.push({ start: start2, end: end2, label: periodLabel(t, 2) });
  }

  if (values.hasInterval3 && values.startTime3 && values.endTime3) {
    const start3 = parseTime(values.startTime3);
    let end3 = parseTime(values.endTime3);
    if (end3 < start3) end3 += 24 * 60;
    intervals.push({ start: start3, end: end3, label: periodLabel(t, 3) });
  }

  if (values.hasInterval4 && values.startTime4 && values.endTime4) {
    const start4 = parseTime(values.startTime4);
    let end4 = parseTime(values.endTime4);
    if (end4 < start4) end4 += 24 * 60;
    intervals.push({ start: start4, end: end4, label: periodLabel(t, 4) });
  }

  return intervals;
}

function buildIntervalsFromEntry(entry: TimeEntryRecord): Array<{ start: number; end: number }> {
  const intervals: Array<{ start: number; end: number }> = [];

  const start1 = parseTime(entry.startTime);
  let end1 = parseTime(entry.endTime);
  if (end1 < start1) end1 += 24 * 60;
  intervals.push({ start: start1, end: end1 });

  if (entry.startTime2 && entry.endTime2) {
    const start2 = parseTime(entry.startTime2);
    let end2 = parseTime(entry.endTime2);
    if (end2 < start2) end2 += 24 * 60;
    intervals.push({ start: start2, end: end2 });
  }

  if (entry.startTime3 && entry.endTime3) {
    const start3 = parseTime(entry.startTime3);
    let end3 = parseTime(entry.endTime3);
    if (end3 < start3) end3 += 24 * 60;
    intervals.push({ start: start3, end: end3 });
  }

  if (entry.startTime4 && entry.endTime4) {
    const start4 = parseTime(entry.startTime4);
    let end4 = parseTime(entry.endTime4);
    if (end4 < start4) end4 += 24 * 60;
    intervals.push({ start: start4, end: end4 });
  }

  return intervals;
}

function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function validateEntryFormOverlap(
  values: TimeSheetEntryFormValues,
  t: TFunction,
  options?: {
    otherEntries?: TimeEntryRecord[];
    editingEntryId?: string | null;
  },
): string | null {
  const intervals = buildIntervalsFromForm(values, t);
  if (intervals.length === 0) {
    return null;
  }

  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      if (intervalsOverlap(intervals[i], intervals[j])) {
        return t("timesheet.errors.periodOverlap", {
          periodA: intervals[i].label,
          periodB: intervals[j].label,
        });
      }
    }
  }

  const otherEntries = options?.otherEntries ?? [];
  const editingEntryId = options?.editingEntryId ?? null;
  const sameDayEntries = otherEntries.filter(
    (entry) =>
      entry.id !== editingEntryId &&
      entry.date === values.workDate &&
      entry.projectId === values.projectId &&
      entry.employeeId === values.employeeId,
  );

  for (const other of sameDayEntries) {
    const otherIntervals = buildIntervalsFromEntry(other);
    for (const current of intervals) {
      for (const otherInterval of otherIntervals) {
        if (current.start < otherInterval.end && otherInterval.start < current.end) {
          const formattedDate = values.workDate.split("-").reverse().join("/");
          return t("timesheet.errors.entryCollision", {
            date: formattedDate,
            range: `${minutesToTime(otherInterval.start)} - ${minutesToTime(otherInterval.end)}`,
          });
        }
      }
    }
  }

  return null;
}

export function validateEntriesDayOverlap(
  entries: TimeEntryRecord[],
  t: TFunction,
): string | null {
  const dateGroups: Record<string, TimeEntryRecord[]> = {};

  for (const entry of entries) {
    if (!dateGroups[entry.date]) {
      dateGroups[entry.date] = [];
    }
    dateGroups[entry.date].push(entry);
  }

  for (const [date, dayEntries] of Object.entries(dateGroups)) {
    const dayIntervals: Array<{ start: number; end: number }> = [];
    for (const entry of dayEntries) {
      dayIntervals.push(...buildIntervalsFromEntry(entry));
    }

    for (let i = 0; i < dayIntervals.length; i++) {
      for (let j = i + 1; j < dayIntervals.length; j++) {
        const a = dayIntervals[i];
        const b = dayIntervals[j];
        if (a.start < b.end && b.start < a.end) {
          const formattedDate = date.split("-").reverse().join("/");
          return t("timesheet.errors.generalDayConflict", { date: formattedDate });
        }
      }
    }
  }

  return null;
}

export function buildEntryFromForm(
  values: TimeSheetEntryFormValues,
  editingEntryId: string | null,
): TimeEntryRecord {
  return {
    id: editingEntryId ?? Math.random().toString(36).slice(2, 11),
    employeeId: values.employeeId,
    projectId: values.projectId,
    date: values.workDate,
    startTime: values.startTime,
    endTime: values.endTime,
    breakDurationMinutes: 0,
    startTime2:
      values.hasInterval2 && values.startTime2 && values.endTime2
        ? values.startTime2
        : null,
    endTime2:
      values.hasInterval2 && values.startTime2 && values.endTime2
        ? values.endTime2
        : null,
    startTime3:
      values.hasInterval3 && values.startTime3 && values.endTime3
        ? values.startTime3
        : null,
    endTime3:
      values.hasInterval3 && values.startTime3 && values.endTime3
        ? values.endTime3
        : null,
    startTime4:
      values.hasInterval4 && values.startTime4 && values.endTime4
        ? values.startTime4
        : null,
    endTime4:
      values.hasInterval4 && values.startTime4 && values.endTime4
        ? values.endTime4
        : null,
  };
}
