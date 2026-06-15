import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantContext } from "@/lib/api/tenant-guard";

const createTimeSheetSchema = z.object({
  projectId: z.string().min(1),
  employeeId: z.string().min(1),
  periodYear: z.number().int().min(2000).max(3000).optional().nullable(),
  periodMonth: z.number().int().min(1).max(12).optional().nullable(),
  entries: z
    .array(
      z.object({
        workDate: z.string().min(1),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        breakMinutes: z.number().int().min(0).max(600).optional().nullable(),
        startTime2: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
        endTime2: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
        startTime3: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
        endTime3: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
        startTime4: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
        endTime4: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
      }),
    )
    .min(1),
});

function parseMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(m: number): string {
  const hours = Math.floor(m / 60) % 24;
  const mins = m % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function checkDayOverlaps(intervals: { start: number; end: number; label: string }[]): string | null {
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const a = intervals[i];
      const b = intervals[j];
      if (a.start < b.end && b.start < a.end) {
        return `${a.label} conflita com ${b.label}`;
      }
    }
  }
  return null;
}

function buildDateTime(workDate: string, time: string): Date {
  return new Date(`${workDate}T${time}:00.000Z`);
}

export async function GET() {
  const guard = await requireTenantContext();

  if (!guard.ok) {
    return guard.response;
  }

  const { prisma } = await import("@/lib/prisma");

  const timeSheets = await prisma.timeSheet.findMany({
    where: {
      organizationId: guard.context.organizationId,
    },
    orderBy: [
      { periodYear: "desc" },
      { periodMonth: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          projectCode: true,
          status: true,
        },
      },
      _count: {
        select: {
          entries: true,
        },
      },
    },
  });

  return NextResponse.json({ data: timeSheets });
}

export async function POST(request: Request) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN", "EDITOR"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = createTimeSheetSchema.parse(await request.json());
    const { prisma } = await import("@/lib/prisma");

    const employee = await prisma.employee.findFirst({
      where: {
        id: payload.employeeId,
        organizationId: guard.context.organizationId,
      },
      select: {
        id: true,
        salary: true,
        chargesPercent: true,
        hoursPerDay: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Funcionario nao encontrado." },
        { status: 404 },
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: guard.context.organizationId },
      select: { document: true },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Tenant nao encontrado." },
        { status: 404 },
      );
    }

    const legacyCompany = await prisma.company.findUnique({
      where: { document: organization.document },
      select: { id: true },
    });

    if (!legacyCompany) {
      return NextResponse.json(
        { message: "Empresa legada nao encontrada." },
        { status: 404 },
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: payload.projectId,
        companyId: legacyCompany.id,
      },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Projeto nao encontrado." },
        { status: 404 },
      );
    }

    const defaultPolicy = await prisma.organizationLaborPolicy.findFirst({
      where: {
        organizationId: guard.context.organizationId,
        isDefault: true,
      },
      select: {
        weekdayFirstTwoHoursPercent: true,
        weekdayAfterTwoHoursPercent: true,
        saturdayPercent: true,
        sundayPercent: true,
        holidayPercent: true,
        nightAdditionalPercent: true,
      },
    });

    const holidayDates = await prisma.organizationHoliday.findMany({
      where: {
        organizationId: guard.context.organizationId,
      },
      select: {
        date: true,
      },
    });

    const holidayDateSet = new Set(
      holidayDates.map((holiday: any) => holiday.date.toISOString().slice(0, 10)),
    );

    const hourlyBase =
      (Number(employee.salary) / 220) *
      (1 + Number(employee.chargesPercent) / 100);

    const weekdayFirstTwoPercent = Number(
      defaultPolicy?.weekdayFirstTwoHoursPercent ?? 50,
    );
    const weekdayAfterTwoPercent = Number(
      defaultPolicy?.weekdayAfterTwoHoursPercent ?? 100,
    );
    const saturdayPercent = Number(defaultPolicy?.saturdayPercent ?? 50);
    const sundayPercent = Number(defaultPolicy?.sundayPercent ?? 100);
    const holidayPercent = Number(defaultPolicy?.holidayPercent ?? 100);
    const nightPercent = Number(defaultPolicy?.nightAdditionalPercent ?? 20);

    // Group entries by workDate to check for overlaps
    const dateGroups: { [date: string]: typeof payload.entries } = {};
    for (const entry of payload.entries) {
      if (!dateGroups[entry.workDate]) {
        dateGroups[entry.workDate] = [];
      }
      dateGroups[entry.workDate].push(entry);
    }

    for (const [date, dayEntries] of Object.entries(dateGroups)) {
      const dayIntervals: { start: number; end: number; label: string }[] = [];
      for (const entry of dayEntries) {
        const start1 = parseMinutes(entry.startTime);
        let end1 = parseMinutes(entry.endTime);
        if (end1 < start1) end1 += 24 * 60;
        dayIntervals.push({ start: start1, end: end1, label: `Período 1 (${entry.startTime}-${entry.endTime})` });

        if (entry.startTime2 && entry.endTime2) {
          const start2 = parseMinutes(entry.startTime2);
          let end2 = parseMinutes(entry.endTime2);
          if (end2 < start2) end2 += 24 * 60;
          dayIntervals.push({ start: start2, end: end2, label: `Período 2 (${entry.startTime2}-${entry.endTime2})` });
        }

        if (entry.startTime3 && entry.endTime3) {
          const start3 = parseMinutes(entry.startTime3);
          let end3 = parseMinutes(entry.endTime3);
          if (end3 < start3) end3 += 24 * 60;
          dayIntervals.push({ start: start3, end: end3, label: `Período 3 (${entry.startTime3}-${entry.endTime3})` });
        }

        if (entry.startTime4 && entry.endTime4) {
          const start4 = parseMinutes(entry.startTime4);
          let end4 = parseMinutes(entry.endTime4);
          if (end4 < start4) end4 += 24 * 60;
          dayIntervals.push({ start: start4, end: end4, label: `Período 4 (${entry.startTime4}-${entry.endTime4})` });
        }
      }

      const overlapError = checkDayOverlaps(dayIntervals);
      if (overlapError) {
        const formattedDate = date.split("-").reverse().join("/");
        return NextResponse.json(
          { message: `Conflito de horários no dia ${formattedDate}: ${overlapError}` },
          { status: 400 }
        );
      }
    }

    // Group entries by period (year and month) to create/update TimeSheet objects
    const periodGroups: { [key: string]: typeof payload.entries } = {};
    for (const entry of payload.entries) {
      const [yearStr, monthStr] = entry.workDate.split("-");
      const key = `${yearStr}-${monthStr}`;
      if (!periodGroups[key]) {
        periodGroups[key] = [];
      }
      periodGroups[key].push(entry);
    }

    let lastTimeSheetId = "";

    for (const [key, groupEntries] of Object.entries(periodGroups)) {
      const [year, month] = key.split("-").map(Number);

      const timeSheet = await prisma.timeSheet.upsert({
        where: {
          organizationId_projectId_employeeId_periodYear_periodMonth: {
            organizationId: guard.context.organizationId,
            projectId: project.id,
            employeeId: employee.id,
            periodYear: year,
            periodMonth: month,
          },
        },
        update: {
          status: "DRAFT",
        },
        create: {
          organizationId: guard.context.organizationId,
          projectId: project.id,
          employeeId: employee.id,
          periodYear: year,
          periodMonth: month,
          status: "DRAFT",
        },
        select: {
          id: true,
        },
      });

      lastTimeSheetId = timeSheet.id;

      // Delete old entries for this month's timesheet
      await prisma.timeSheetEntry.deleteMany({
        where: {
          timeSheetId: timeSheet.id,
        },
      });

      for (const entry of groupEntries) {
        const workDate = new Date(`${entry.workDate}T00:00:00.000Z`);
        const dayOfWeek = workDate.getUTCDay();
        const isSunday = dayOfWeek === 0;
        const isSaturday = dayOfWeek === 6;
        const isHoliday = holidayDateSet.has(entry.workDate);

        // Gather and sort all valid intervals to compute hours and dynamic break minutes
        const intervals: { start: number; end: number }[] = [];
        const addInterval = (s?: string | null, e?: string | null) => {
          if (s && e) {
            const start = parseMinutes(s);
            let end = parseMinutes(e);
            if (end < start) {
              end += 24 * 60; // support overnight shift
            }
            intervals.push({ start, end });
          }
        };

        addInterval(entry.startTime, entry.endTime);
        addInterval(entry.startTime2, entry.endTime2);
        addInterval(entry.startTime3, entry.endTime3);
        addInterval(entry.startTime4, entry.endTime4);

        // Sort intervals by start time
        intervals.sort((a, b) => a.start - b.start);

        // Sum worked minutes from intervals
        let workedMinutes = 0;
        intervals.forEach((interval) => {
          workedMinutes += interval.end - interval.start;
        });

        // Calculate automatic break minutes as gaps between consecutive intervals
        let calculatedBreakMinutes = 0;
        for (let i = 0; i < intervals.length - 1; i++) {
          const currentEnd = intervals[i].end;
          const nextStart = intervals[i + 1].start;
          if (nextStart > currentEnd) {
            calculatedBreakMinutes += (nextStart - currentEnd);
          }
        }

        const normalLimitMinutes = Number(employee.hoursPerDay) * 60;

        let normalMinutes = 0;
        let overtimeFirstTwoMinutes = 0;
        let overtimeAfterTwoMinutes = 0;
        let saturdayMinutes = 0;
        let sundayOrHolidayMinutes = 0;

        if (isHoliday || isSunday) {
          sundayOrHolidayMinutes = workedMinutes;
        } else if (isSaturday) {
          saturdayMinutes = workedMinutes;
        } else {
          normalMinutes = Math.min(workedMinutes, normalLimitMinutes);
          const extraMinutes = Math.max(workedMinutes - normalLimitMinutes, 0);
          overtimeFirstTwoMinutes = Math.min(extraMinutes, 120);
          overtimeAfterTwoMinutes = Math.max(extraMinutes - 120, 0);
        }

        const calculatedAmount =
          (normalMinutes / 60) * hourlyBase +
          (overtimeFirstTwoMinutes / 60) *
            hourlyBase *
            (1 + weekdayFirstTwoPercent / 100) +
          (overtimeAfterTwoMinutes / 60) *
            hourlyBase *
            (1 + weekdayAfterTwoPercent / 100) +
          (saturdayMinutes / 60) * hourlyBase * (1 + saturdayPercent / 100) +
          (sundayOrHolidayMinutes / 60) *
            hourlyBase *
            (1 + (isHoliday ? holidayPercent : sundayPercent) / 100);

        await prisma.timeSheetEntry.create({
          data: {
            organizationId: guard.context.organizationId,
            timeSheetId: timeSheet.id,
            employeeId: employee.id,
            projectId: project.id,
            workDate,
            startDateTime: buildDateTime(entry.workDate, entry.startTime),
            endDateTime: buildDateTime(entry.workDate, entry.endTime),
            breakMinutes: Math.round(calculatedBreakMinutes),
            startDateTime2: entry.startTime2 && entry.endTime2 ? buildDateTime(entry.workDate, entry.startTime2) : null,
            endDateTime2: entry.startTime2 && entry.endTime2 ? buildDateTime(entry.workDate, entry.endTime2) : null,
            startDateTime3: entry.startTime3 && entry.endTime3 ? buildDateTime(entry.workDate, entry.startTime3) : null,
            endDateTime3: entry.startTime3 && entry.endTime3 ? buildDateTime(entry.workDate, entry.endTime3) : null,
            startDateTime4: entry.startTime4 && entry.endTime4 ? buildDateTime(entry.workDate, entry.startTime4) : null,
            endDateTime4: entry.startTime4 && entry.endTime4 ? buildDateTime(entry.workDate, entry.endTime4) : null,
            snapshotBaseSalary: Number(employee.salary),
            snapshotChargesPercent: Number(employee.chargesPercent),
            snapshotHourlyBase: hourlyBase,
            snapshotWeekdayFirstTwoPercent: weekdayFirstTwoPercent,
            snapshotWeekdayAfterTwoPercent: weekdayAfterTwoPercent,
            snapshotSaturdayPercent: saturdayPercent,
            snapshotSundayPercent: sundayPercent,
            snapshotHolidayPercent: holidayPercent,
            snapshotNightAdditionalPercent: nightPercent,
            normalMinutes,
            overtimeFirstTwoMinutes,
            overtimeAfterTwoMinutes,
            saturdayMinutes,
            sundayOrHolidayMinutes,
            nightMinutes: 0,
            calculatedAmount,
          },
        });
      }
    }

    return NextResponse.json({ data: { id: lastTimeSheetId } }, { status: 201 });
  } catch (error) {
    console.error("Error saving timesheet:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados de ficha tempo invalidos." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Falha ao salvar ficha tempo." },
      { status: 500 },
    );
  }
}
