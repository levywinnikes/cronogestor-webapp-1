import type { Prisma, PrismaClient } from "@prisma/client";

export type DbClient = PrismaClient | Prisma.TransactionClient;
import type { EmployeeLaborContext, ProcessedDayEntry } from "./types";
import { mapRowToIntervalEntry, workDateToString, type RawTimeSheetEntryRow } from "./entry-mapper";
import { processEmployeeDay } from "./process-day";

export async function fetchEmployeeDayEntries(
  prisma: DbClient,
  organizationId: string,
  employeeId: string,
  workDate: string,
): Promise<ReturnType<typeof mapRowToIntervalEntry>[]> {
  const dayStart = new Date(`${workDate}T00:00:00.000Z`);
  const dayEnd = new Date(`${workDate}T23:59:59.999Z`);

  const rows = await prisma.timeSheetEntry.findMany({
    where: {
      organizationId,
      employeeId,
      workDate: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    include: {
      project: {
        select: {
          projectCode: true,
          name: true,
        },
      },
    },
  });

  return rows.map(mapRowToIntervalEntry);
}

export async function recalculateAndPersistEmployeeDay(
  prisma: DbClient,
  organizationId: string,
  employeeId: string,
  workDate: string,
  isHoliday: boolean,
  labor: EmployeeLaborContext,
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
  },
): Promise<ProcessedDayEntry[]> {
  const dayEntries = await fetchEmployeeDayEntries(
    prisma,
    organizationId,
    employeeId,
    workDate,
  );

  if (dayEntries.length === 0) return [];

  const processed = processEmployeeDay(
    dayEntries,
    workDate,
    employeeId,
    isHoliday,
    labor,
  );

  for (const entry of processed) {
    await prisma.timeSheetEntry.update({
      where: { id: entry.id },
      data: {
        effectiveMinutes: entry.effectiveMinutes,
        exclusiveMinutes: entry.exclusiveMinutes,
        sharedMinutes: entry.sharedMinutes,
        hasSharedMinutes: entry.hasSharedMinutes,
        sharedConflictSnapshot: entry.sharedConflictSnapshot
          ? (entry.sharedConflictSnapshot as unknown as Prisma.InputJsonValue)
          : undefined,
        overlapGroupId: entry.overlapGroupId,
        normalMinutes: entry.normalMinutes,
        overtimeFirstTwoMinutes: entry.overtimeFirstTwoMinutes,
        overtimeAfterTwoMinutes: entry.overtimeAfterTwoMinutes,
        saturdayMinutes: entry.saturdayMinutes,
        sundayOrHolidayMinutes: entry.sundayOrHolidayMinutes,
        nightMinutes: entry.nightMinutes,
        calculatedAmount: entry.calculatedAmount,
        ...snapshots,
      },
    });
  }

  return processed;
}

export function collectWorkDatesFromRows(rows: { workDate: Date }[]): string[] {
  return [...new Set(rows.map((row) => workDateToString(row.workDate)))];
}
