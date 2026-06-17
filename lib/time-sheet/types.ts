export interface TimeSheetEntryIntervals {
  id: string;
  projectId: string;
  projectCode?: string;
  projectName?: string;
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

export interface SharedConflictProject {
  projectId: string;
  projectCode: string;
  projectName: string;
  sharedMinutes: number;
  overlapRanges: { start: string; end: string }[];
  splitRatio: number;
}

export interface SharedConflictSnapshot {
  conflictingProjects: SharedConflictProject[];
}

export interface LaborPolicyPercents {
  weekdayFirstTwoPercent: number;
  weekdayAfterTwoPercent: number;
  saturdayPercent: number;
  sundayPercent: number;
  holidayPercent: number;
  nightPercent: number;
}

export interface EmployeeLaborContext {
  hoursPerDay: number;
  hourlyBase: number;
  policy: LaborPolicyPercents;
}

export interface ProcessedDayEntry {
  id: string;
  projectId: string;
  projectCode?: string;
  projectName?: string;
  declaredMinutes: number;
  exclusiveMinutes: number;
  sharedMinutes: number;
  effectiveMinutes: number;
  hasSharedMinutes: boolean;
  sharedConflictSnapshot: SharedConflictSnapshot | null;
  overlapGroupId: string | null;
  normalMinutes: number;
  overtimeFirstTwoMinutes: number;
  overtimeAfterTwoMinutes: number;
  saturdayMinutes: number;
  sundayOrHolidayMinutes: number;
  nightMinutes: number;
  calculatedAmount: number;
  physicalUniqueMinutes: number;
}

export interface ConflictPreviewProject {
  projectId: string;
  projectCode: string;
  projectName: string;
  declaredMinutes: number;
  effectiveMinutes: number;
  exclusiveMinutes: number;
  sharedMinutes: number;
}

export interface ConflictPreview {
  workDate: string;
  hasConflict: boolean;
  conflictingMinutes: number;
  physicalUniqueMinutes: number;
  overlapRanges: {
    start: string;
    end: string;
    durationMinutes: number;
    projectIds: string[];
  }[];
  projects: ConflictPreviewProject[];
}

export interface DeleteImpactPreview {
  workDate: string;
  entryId: string;
  hasImpact: boolean;
  remainingProjects: ConflictPreviewProject[];
}
