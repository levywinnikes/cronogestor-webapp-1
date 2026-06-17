import {
  buildConflictPreview,
  checkIntraProjectOverlaps,
  mapPayloadEntryToIntervalEntry,
  type PayloadEntryInput,
} from "@/lib/time-sheet";
import {
  collectWorkDatesFromRows,
  fetchEmployeeDayEntries,
  recalculateAndPersistEmployeeDay,
} from "@/lib/time-sheet/persist-day";
import type { EmployeeLaborContext } from "@/lib/time-sheet/types";

import type { DbClient } from "@/lib/time-sheet/persist-day";
import type { PrismaClient } from "@prisma/client";

export interface TimeSheetLaborContext {
  hourlyBase: number;
  labor: EmployeeLaborContext;
  holidayDateSet: Set<string>;
  snapshots: {
    snapshotBaseSalary: number;
    snapshotChargesPercent: number;
    snapshotHourlyBase: number;
    snapshotWeekdayFirstTwoPercent: number;
    snapshotWeekdayAfterTwoPercent: number;
    snapshotSaturdayPercent: number;
    snapshotSundayPercent: number;
    snapshotHolidayPercent: number;
    snapshotNightAdditionalPercent: number;
  };
  project: { id: string; projectCode: string | null; name: string };
  employee: { id: string; salary: unknown; chargesPercent: unknown; hoursPerDay: unknown };
}

export async function loadTimeSheetLaborContext(
  prisma: PrismaClient,
  organizationId: string,
  employeeId: string,
  projectId: string,
  legacyCompanyId: string,
): Promise<TimeSheetLaborContext | null> {
  const employee = (await prisma.employee.findFirst({
    where: { id: employeeId, organizationId },
    select: { id: true, salary: true, chargesPercent: true, hoursPerDay: true },
  })) as TimeSheetLaborContext["employee"] | null;

  if (!employee) return null;

  const project = (await prisma.project.findFirst({
    where: { id: projectId, companyId: legacyCompanyId },
    select: { id: true, projectCode: true, name: true },
  })) as TimeSheetLaborContext["project"] | null;

  if (!project) return null;

  const defaultPolicy = (await prisma.organizationLaborPolicy.findFirst({
    where: { organizationId, isDefault: true },
    select: {
      weekdayFirstTwoHoursPercent: true,
      weekdayAfterTwoHoursPercent: true,
      saturdayPercent: true,
      sundayPercent: true,
      holidayPercent: true,
      nightAdditionalPercent: true,
    },
  })) as Record<string, unknown> | null;

  const holidayDates = (await prisma.organizationHoliday.findMany({
    where: { organizationId },
    select: { date: true },
  })) as { date: Date }[];

  const holidayDateSet = new Set(
    holidayDates.map((holiday) => holiday.date.toISOString().slice(0, 10)),
  );

  const hourlyBase =
    (Number(employee.salary) / 220) * (1 + Number(employee.chargesPercent) / 100);

  const weekdayFirstTwoPercent = Number(defaultPolicy?.weekdayFirstTwoHoursPercent ?? 50);
  const weekdayAfterTwoPercent = Number(defaultPolicy?.weekdayAfterTwoHoursPercent ?? 100);
  const saturdayPercent = Number(defaultPolicy?.saturdayPercent ?? 50);
  const sundayPercent = Number(defaultPolicy?.sundayPercent ?? 100);
  const holidayPercent = Number(defaultPolicy?.holidayPercent ?? 100);
  const nightPercent = Number(defaultPolicy?.nightAdditionalPercent ?? 20);

  return {
    hourlyBase,
    holidayDateSet,
    project,
    employee,
    labor: {
      hoursPerDay: Number(employee.hoursPerDay),
      hourlyBase,
      policy: {
        weekdayFirstTwoPercent,
        weekdayAfterTwoPercent,
        saturdayPercent,
        sundayPercent,
        holidayPercent,
        nightPercent,
      },
    },
    snapshots: {
      snapshotBaseSalary: Number(employee.salary),
      snapshotChargesPercent: Number(employee.chargesPercent),
      snapshotHourlyBase: hourlyBase,
      snapshotWeekdayFirstTwoPercent: weekdayFirstTwoPercent,
      snapshotWeekdayAfterTwoPercent: weekdayAfterTwoPercent,
      snapshotSaturdayPercent: saturdayPercent,
      snapshotSundayPercent: sundayPercent,
      snapshotHolidayPercent: holidayPercent,
      snapshotNightAdditionalPercent: nightPercent,
    },
  };
}

export async function simulateDayEntriesForPayload(
  prisma: DbClient,
  organizationId: string,
  employeeId: string,
  projectId: string,
  workDate: string,
  payloadEntries: PayloadEntryInput[],
  projectMeta: { projectCode?: string; projectName?: string },
) {
  const existing = await fetchEmployeeDayEntries(prisma, organizationId, employeeId, workDate);
  const others = existing.filter((entry) => entry.projectId !== projectId);
  const candidates = payloadEntries
    .filter((entry) => entry.workDate === workDate)
    .map((entry, index) =>
      mapPayloadEntryToIntervalEntry(projectId, entry, `candidate-${index}`, projectMeta),
    );

  return [...others, ...candidates];
}

export async function detectCrossProjectConflictsForPayload(
  prisma: DbClient,
  organizationId: string,
  employeeId: string,
  projectId: string,
  entries: PayloadEntryInput[],
  projectMeta: { projectCode?: string; projectName?: string },
  conflictCheckWorkDates?: string[],
) {
  const payloadDates = [...new Set(entries.map((entry) => entry.workDate.split("T")[0]))];
  const workDates =
    conflictCheckWorkDates?.map((date) => date.split("T")[0]) ??
    payloadDates;
  const previews = [];

  for (const workDate of workDates) {
    const merged = await simulateDayEntriesForPayload(
      prisma,
      organizationId,
      employeeId,
      projectId,
      workDate,
      entries,
      projectMeta,
    );

    const intraError = checkIntraProjectOverlaps(merged);
    if (intraError) {
      return { type: "intra" as const, message: intraError, previews: [] };
    }

    const preview = buildConflictPreview(merged, workDate);
    if (preview.hasConflict) previews.push(preview);
  }

  return { type: "cross" as const, message: null, previews };
}

export { recalculateAndPersistEmployeeDay, collectWorkDatesFromRows, fetchEmployeeDayEntries };
