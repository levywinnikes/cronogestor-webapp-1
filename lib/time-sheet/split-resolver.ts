import {
  buildTimelineSegments,
  extractTaggedIntervals,
  minutesToTime,
  splitMinutesEqually,
  sumDeclaredMinutes,
  type TaggedInterval,
} from "./intervals";
import type {
  SharedConflictProject,
  SharedConflictSnapshot,
  TimeSheetEntryIntervals,
} from "./types";

export interface ProjectMinuteAllocation {
  exclusiveMinutes: number;
  sharedMinutes: number;
  effectiveMinutes: number;
}

export function allocateProjectMinutes(
  entries: TimeSheetEntryIntervals[],
): Map<string, ProjectMinuteAllocation> {
  const intervals = entries.flatMap((entry) => extractTaggedIntervals(entry));
  const segments = buildTimelineSegments(intervals);
  const totals = new Map<string, { exclusive: number; shared: number }>();

  for (const entry of entries) {
    totals.set(entry.projectId, { exclusive: 0, shared: 0 });
  }

  for (const segment of segments) {
    const duration = segment.end - segment.start;
    if (duration <= 0) continue;

    const shares = splitMinutesEqually(duration, segment.projectIds);

    for (const projectId of segment.projectIds) {
      const minutes = shares.get(projectId) ?? 0;
      const bucket = totals.get(projectId) ?? { exclusive: 0, shared: 0 };

      if (segment.projectIds.length === 1) {
        bucket.exclusive += minutes;
      } else {
        bucket.shared += minutes;
      }

      totals.set(projectId, bucket);
    }
  }

  const result = new Map<string, ProjectMinuteAllocation>();

  for (const [projectId, bucket] of totals) {
    result.set(projectId, {
      exclusiveMinutes: bucket.exclusive,
      sharedMinutes: bucket.shared,
      effectiveMinutes: bucket.exclusive + bucket.shared,
    });
  }

  return result;
}

function overlapRangesBetweenProjects(
  intervals: TaggedInterval[],
  projectA: string,
  projectB: string,
): { start: string; end: string }[] {
  const ranges: { start: string; end: string }[] = [];
  const segments = buildTimelineSegments(intervals);

  for (const segment of segments) {
    if (
      segment.projectIds.length >= 2 &&
      segment.projectIds.includes(projectA) &&
      segment.projectIds.includes(projectB)
    ) {
      ranges.push({
        start: minutesToTime(segment.start),
        end: minutesToTime(segment.end),
      });
    }
  }

  return ranges;
}

function sharedMinutesBetweenProjects(
  allocation: Map<string, ProjectMinuteAllocation>,
  intervals: TaggedInterval[],
  projectA: string,
  projectB: string,
): number {
  const segments = buildTimelineSegments(intervals);
  let total = 0;

  for (const segment of segments) {
    if (
      segment.projectIds.length >= 2 &&
      segment.projectIds.includes(projectA) &&
      segment.projectIds.includes(projectB)
    ) {
      const shares = splitMinutesEqually(segment.end - segment.start, segment.projectIds);
      total += shares.get(projectA) ?? 0;
    }
  }

  return total;
}

export function buildSharedConflictSnapshot(
  entry: TimeSheetEntryIntervals,
  allEntries: TimeSheetEntryIntervals[],
  allocation: Map<string, ProjectMinuteAllocation>,
): SharedConflictSnapshot | null {
  const projectAllocation = allocation.get(entry.projectId);
  if (!projectAllocation || projectAllocation.sharedMinutes <= 0) {
    return null;
  }

  const intervals = allEntries.flatMap((item) => extractTaggedIntervals(item));
  const conflictingProjects: SharedConflictProject[] = [];

  for (const other of allEntries) {
    if (other.projectId === entry.projectId) continue;

    const sharedWithOther = sharedMinutesBetweenProjects(
      allocation,
      intervals,
      entry.projectId,
      other.projectId,
    );

    if (sharedWithOther <= 0) continue;

    const overlapRanges = overlapRangesBetweenProjects(
      intervals,
      entry.projectId,
      other.projectId,
    );

    const maxProjectsInOverlap = buildTimelineSegments(intervals)
      .filter(
        (segment) =>
          segment.projectIds.includes(entry.projectId) &&
          segment.projectIds.includes(other.projectId) &&
          segment.projectIds.length >= 2,
      )
      .reduce((max, segment) => Math.max(max, segment.projectIds.length), 2);

    conflictingProjects.push({
      projectId: other.projectId,
      projectCode: other.projectCode ?? other.projectId,
      projectName: other.projectName ?? other.projectId,
      sharedMinutes: sharedWithOther,
      overlapRanges,
      splitRatio: 1 / maxProjectsInOverlap,
    });
  }

  if (conflictingProjects.length === 0) return null;

  return { conflictingProjects };
}

export function getDeclaredMinutesMap(
  entries: TimeSheetEntryIntervals[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of entries) {
    map.set(entry.projectId, sumDeclaredMinutes(entry));
  }
  return map;
}
