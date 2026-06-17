import type { TimeSheetEntryIntervals } from "./types";

export function parseMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export interface TaggedInterval {
  start: number;
  end: number;
  projectId: string;
  entryId: string;
}

export function extractTaggedIntervals(entry: TimeSheetEntryIntervals): TaggedInterval[] {
  const intervals: TaggedInterval[] = [];
  const add = (startStr?: string | null, endStr?: string | null) => {
    if (!startStr || !endStr) return;
    let start = parseMinutes(startStr);
    let end = parseMinutes(endStr);
    if (end < start) end += 24 * 60;
    intervals.push({ start, end, projectId: entry.projectId, entryId: entry.id });
  };

  add(entry.startTime, entry.endTime);
  add(entry.startTime2, entry.endTime2);
  add(entry.startTime3, entry.endTime3);
  add(entry.startTime4, entry.endTime4);

  return intervals;
}

export function sumDeclaredMinutes(entry: TimeSheetEntryIntervals): number {
  return extractTaggedIntervals(entry).reduce(
    (sum, interval) => sum + (interval.end - interval.start),
    0,
  );
}

export function unionPhysicalMinutes(intervals: TaggedInterval[]): number {
  if (intervals.length === 0) return 0;

  const points = new Set<number>();
  for (const interval of intervals) {
    points.add(interval.start);
    points.add(interval.end);
  }

  const sorted = [...points].sort((a, b) => a - b);
  let total = 0;

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const segStart = sorted[i];
    const segEnd = sorted[i + 1];
    if (segEnd <= segStart) continue;

    const active = intervals.some(
      (interval) => interval.start < segEnd && interval.end > segStart,
    );
    if (active) total += segEnd - segStart;
  }

  return total;
}

export interface TimelineSegment {
  start: number;
  end: number;
  projectIds: string[];
}

export function buildTimelineSegments(intervals: TaggedInterval[]): TimelineSegment[] {
  if (intervals.length === 0) return [];

  const points = new Set<number>();
  for (const interval of intervals) {
    points.add(interval.start);
    points.add(interval.end);
  }

  const sorted = [...points].sort((a, b) => a - b);
  const segments: TimelineSegment[] = [];

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const start = sorted[i];
    const end = sorted[i + 1];
    if (end <= start) continue;

    const projectIds = [
      ...new Set(
        intervals
          .filter((interval) => interval.start < end && interval.end > start)
          .map((interval) => interval.projectId),
      ),
    ].sort();

    if (projectIds.length > 0) {
      segments.push({ start, end, projectIds });
    }
  }

  return segments;
}

export function splitMinutesEqually(
  totalMinutes: number,
  projectIds: string[],
): Map<string, number> {
  const sorted = [...projectIds].sort();
  const n = sorted.length;
  const base = Math.floor(totalMinutes / n);
  let remainder = totalMinutes % n;
  const result = new Map<string, number>();

  for (const projectId of sorted) {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder -= 1;
    result.set(projectId, base + extra);
  }

  return result;
}

export function checkIntraProjectOverlaps(entries: TimeSheetEntryIntervals[]): string | null {
  const byProjectAndDate = new Map<string, TaggedInterval[]>();

  for (const entry of entries) {
    const workDate = entry.workDate.split("T")[0];
    const key = `${entry.projectId}::${workDate}`;
    const intervals = extractTaggedIntervals(entry);
    if (!byProjectAndDate.has(key)) {
      byProjectAndDate.set(key, []);
    }
    byProjectAndDate.get(key)!.push(...intervals);
  }

  for (const [key, intervals] of byProjectAndDate) {
    const workDate = key.split("::")[1] ?? "";
    for (let i = 0; i < intervals.length; i += 1) {
      for (let j = i + 1; j < intervals.length; j += 1) {
        const a = intervals[i];
        const b = intervals[j];
        if (a.start < b.end && b.start < a.end) {
          const formattedDate = workDate.split("-").reverse().join("/");
          return `Conflito de horarios no mesmo projeto no dia ${formattedDate}.`;
        }
      }
    }
  }

  return null;
}

export function checkCrossProjectOverlap(entries: TimeSheetEntryIntervals[]): boolean {
  const projectIds = new Set(entries.map((entry) => entry.projectId));
  if (projectIds.size < 2) return false;

  const intervals = entries.flatMap((entry) => extractTaggedIntervals(entry));
  const segments = buildTimelineSegments(intervals);

  return segments.some((segment) => segment.projectIds.length >= 2);
}
