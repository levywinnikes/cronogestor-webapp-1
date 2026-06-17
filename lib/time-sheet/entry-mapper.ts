import type { TimeSheetEntryIntervals } from "./types";

export interface RawTimeSheetEntryRow {
  id: string;
  projectId: string;
  workDate: Date;
  startDateTime: Date;
  endDateTime: Date;
  startDateTime2: Date | null;
  endDateTime2: Date | null;
  startDateTime3: Date | null;
  endDateTime3: Date | null;
  startDateTime4: Date | null;
  endDateTime4: Date | null;
  project?: {
    projectCode: string | null;
    name: string;
  } | null;
}

function formatTimeFromDate(date: Date): string {
  return date.toISOString().substring(11, 16);
}

export function workDateToString(workDate: Date): string {
  return workDate.toISOString().slice(0, 10);
}

export function mapRowToIntervalEntry(row: RawTimeSheetEntryRow): TimeSheetEntryIntervals {
  return {
    id: row.id,
    projectId: row.projectId,
    projectCode: row.project?.projectCode ?? undefined,
    projectName: row.project?.name ?? undefined,
    workDate: workDateToString(row.workDate),
    startTime: formatTimeFromDate(row.startDateTime),
    endTime: formatTimeFromDate(row.endDateTime),
    startTime2: row.startDateTime2 ? formatTimeFromDate(row.startDateTime2) : null,
    endTime2: row.endDateTime2 ? formatTimeFromDate(row.endDateTime2) : null,
    startTime3: row.startDateTime3 ? formatTimeFromDate(row.startDateTime3) : null,
    endTime3: row.endDateTime3 ? formatTimeFromDate(row.endDateTime3) : null,
    startTime4: row.startDateTime4 ? formatTimeFromDate(row.startDateTime4) : null,
    endTime4: row.endDateTime4 ? formatTimeFromDate(row.endDateTime4) : null,
  };
}

export interface PayloadEntryInput {
  workDate: string;
  startTime: string;
  endTime: string;
  startTime2?: string | null;
  endTime2?: string | null;
  startTime3?: string | null;
  endTime3?: string | null;
  startTime4?: string | null;
  endTime4?: string | null;
}

export function mapPayloadEntryToIntervalEntry(
  projectId: string,
  entry: PayloadEntryInput,
  id: string,
  projectMeta?: { projectCode?: string; projectName?: string },
): TimeSheetEntryIntervals {
  return {
    id,
    projectId,
    projectCode: projectMeta?.projectCode,
    projectName: projectMeta?.projectName,
    workDate: entry.workDate,
    startTime: entry.startTime,
    endTime: entry.endTime,
    startTime2: entry.startTime2 || null,
    endTime2: entry.endTime2 || null,
    startTime3: entry.startTime3 || null,
    endTime3: entry.endTime3 || null,
    startTime4: entry.startTime4 || null,
    endTime4: entry.endTime4 || null,
  };
}

export function buildDateTime(workDate: string, time: string): Date {
  return new Date(`${workDate}T${time}:00.000Z`);
}

export function calculateBreakMinutes(entry: PayloadEntryInput): number {
  const parseMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const intervals: { start: number; end: number }[] = [];
  const addInterval = (startStr?: string | null, endStr?: string | null) => {
    if (startStr && endStr) {
      let start = parseMinutes(startStr);
      let end = parseMinutes(endStr);
      if (end < start) end += 24 * 60;
      intervals.push({ start, end });
    }
  };

  addInterval(entry.startTime, entry.endTime);
  addInterval(entry.startTime2, entry.endTime2);
  addInterval(entry.startTime3, entry.endTime3);
  addInterval(entry.startTime4, entry.endTime4);
  intervals.sort((a, b) => a.start - b.start);

  let breakMinutes = 0;
  for (let i = 0; i < intervals.length - 1; i += 1) {
    const gap = intervals[i + 1].start - intervals[i].end;
    if (gap > 0) breakMinutes += gap;
  }

  return Math.round(breakMinutes);
}
