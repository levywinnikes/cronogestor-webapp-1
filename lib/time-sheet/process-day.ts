import { allocateBucketsToProjects } from "./daily-classifier";
import {
  buildTimelineSegments,
  checkCrossProjectOverlap,
  extractTaggedIntervals,
  minutesToTime,
  unionPhysicalMinutes,
} from "./intervals";
import {
  allocateProjectMinutes,
  buildSharedConflictSnapshot,
  getDeclaredMinutesMap,
} from "./split-resolver";
import type {
  ConflictPreview,
  DeleteImpactPreview,
  EmployeeLaborContext,
  ProcessedDayEntry,
  TimeSheetEntryIntervals,
} from "./types";

function buildOverlapGroupId(workDate: string, employeeKey: string, projectIds: string[]): string | null {
  if (projectIds.length < 2) return null;
  return `${workDate}:${employeeKey}:${[...projectIds].sort().join("|")}`;
}

export function processEmployeeDay(
  entries: TimeSheetEntryIntervals[],
  workDate: string,
  employeeKey: string,
  isHoliday: boolean,
  labor: EmployeeLaborContext,
): ProcessedDayEntry[] {
  const dayEntries = entries.filter((entry) => entry.workDate === workDate);
  if (dayEntries.length === 0) return [];

  const intervals = dayEntries.flatMap((entry) => extractTaggedIntervals(entry));
  const physicalUniqueMinutes = unionPhysicalMinutes(intervals);
  const allocation = allocateProjectMinutes(dayEntries);
  const declaredMap = getDeclaredMinutesMap(dayEntries);

  const effectiveMap = new Map<string, number>();
  for (const [projectId, value] of allocation) {
    effectiveMap.set(projectId, value.effectiveMinutes);
  }

  const bucketMap = allocateBucketsToProjects({
    workDate,
    isHoliday,
    totalUniqueMinutes: physicalUniqueMinutes,
    projectEffectiveMinutes: effectiveMap,
    labor,
  });

  const sharedProjectIds = [...allocation.entries()]
    .filter(([, value]) => value.sharedMinutes > 0)
    .map(([projectId]) => projectId);

  const overlapGroupId =
    sharedProjectIds.length >= 2
      ? buildOverlapGroupId(workDate, employeeKey, sharedProjectIds)
      : null;

  return dayEntries.map((entry) => {
    const projectAllocation = allocation.get(entry.projectId) ?? {
      exclusiveMinutes: 0,
      sharedMinutes: 0,
      effectiveMinutes: 0,
    };
    const buckets = bucketMap.get(entry.projectId) ?? {
      normalMinutes: 0,
      overtimeFirstTwoMinutes: 0,
      overtimeAfterTwoMinutes: 0,
      saturdayMinutes: 0,
      sundayOrHolidayMinutes: 0,
      nightMinutes: 0,
      calculatedAmount: 0,
    };

    const sharedConflictSnapshot = buildSharedConflictSnapshot(
      entry,
      dayEntries,
      allocation,
    );

    return {
      id: entry.id,
      projectId: entry.projectId,
      projectCode: entry.projectCode,
      projectName: entry.projectName,
      declaredMinutes: declaredMap.get(entry.projectId) ?? 0,
      exclusiveMinutes: projectAllocation.exclusiveMinutes,
      sharedMinutes: projectAllocation.sharedMinutes,
      effectiveMinutes: projectAllocation.effectiveMinutes,
      hasSharedMinutes: projectAllocation.sharedMinutes > 0,
      sharedConflictSnapshot,
      overlapGroupId: projectAllocation.sharedMinutes > 0 ? overlapGroupId : null,
      normalMinutes: buckets.normalMinutes,
      overtimeFirstTwoMinutes: buckets.overtimeFirstTwoMinutes,
      overtimeAfterTwoMinutes: buckets.overtimeAfterTwoMinutes,
      saturdayMinutes: buckets.saturdayMinutes,
      sundayOrHolidayMinutes: buckets.sundayOrHolidayMinutes,
      nightMinutes: buckets.nightMinutes,
      calculatedAmount: buckets.calculatedAmount,
      physicalUniqueMinutes,
    };
  });
}

export function buildConflictPreview(
  entries: TimeSheetEntryIntervals[],
  workDate: string,
): ConflictPreview {
  const dayEntries = entries.filter((entry) => entry.workDate === workDate);
  const intervals = dayEntries.flatMap((entry) => extractTaggedIntervals(entry));
  const segments = buildTimelineSegments(intervals);
  const allocation = allocateProjectMinutes(dayEntries);
  const declaredMap = getDeclaredMinutesMap(dayEntries);
  const hasConflict = checkCrossProjectOverlap(dayEntries);

  let conflictingMinutes = 0;
  const overlapRanges: ConflictPreview["overlapRanges"] = [];

  for (const segment of segments) {
    if (segment.projectIds.length >= 2) {
      const duration = segment.end - segment.start;
      conflictingMinutes += duration;
      overlapRanges.push({
        start: minutesToTime(segment.start),
        end: minutesToTime(segment.end),
        durationMinutes: duration,
        projectIds: segment.projectIds,
      });
    }
  }

  const projects = dayEntries.map((entry) => {
    const alloc = allocation.get(entry.projectId);
    return {
      projectId: entry.projectId,
      projectCode: entry.projectCode ?? entry.projectId,
      projectName: entry.projectName ?? entry.projectId,
      declaredMinutes: declaredMap.get(entry.projectId) ?? 0,
      effectiveMinutes: alloc?.effectiveMinutes ?? 0,
      exclusiveMinutes: alloc?.exclusiveMinutes ?? 0,
      sharedMinutes: alloc?.sharedMinutes ?? 0,
    };
  });

  return {
    workDate,
    hasConflict,
    conflictingMinutes,
    physicalUniqueMinutes: unionPhysicalMinutes(intervals),
    overlapRanges,
    projects,
  };
}

export function buildDeleteImpactPreview(
  entries: TimeSheetEntryIntervals[],
  workDate: string,
  entryIdToDelete: string,
  employeeKey: string,
  isHoliday: boolean,
  labor: EmployeeLaborContext,
): DeleteImpactPreview {
  const before = processEmployeeDay(entries, workDate, employeeKey, isHoliday, labor);
  const remainingEntries = entries.filter((entry) => entry.id !== entryIdToDelete);
  const after = processEmployeeDay(remainingEntries, workDate, employeeKey, isHoliday, labor);

  const entryToDelete = entries.find((entry) => entry.id === entryIdToDelete);
  const hadShared =
    before.find((entry) => entry.id === entryIdToDelete)?.hasSharedMinutes ?? false;

  const remainingProjects = after.map((entry) => ({
    projectId: entry.projectId,
    projectCode: entry.projectCode ?? entry.projectId,
    projectName: entry.projectName ?? entry.projectId,
    declaredMinutes: entry.declaredMinutes,
    effectiveMinutes: entry.effectiveMinutes,
    exclusiveMinutes: entry.exclusiveMinutes,
    sharedMinutes: entry.sharedMinutes,
  }));

  return {
    workDate,
    entryId: entryIdToDelete,
    hasImpact: hadShared || (entryToDelete != null && remainingProjects.length > 0),
    remainingProjects,
  };
}

export function mergeDayEntry(
  entries: TimeSheetEntryIntervals[],
  candidate: TimeSheetEntryIntervals,
): TimeSheetEntryIntervals[] {
  const withoutSameProjectDay = entries.filter(
    (entry) =>
      !(
        entry.projectId === candidate.projectId &&
        entry.workDate === candidate.workDate
      ),
  );

  return [...withoutSameProjectDay, candidate];
}
