import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantContext } from "@/lib/api/tenant-guard";

const createTimeSheetSchema = z.object({
  projectId: z.string().min(1),
  employeeId: z.string().min(1),
  periodYear: z.number().int().min(2000).max(3000),
  periodMonth: z.number().int().min(1).max(12),
  entries: z
    .array(
      z.object({
        workDate: z.string().min(1),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        breakMinutes: z.number().int().min(0).max(600),
      }),
    )
    .min(1),
});

function parseMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
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
      holidayDates.map((holiday) => holiday.date.toISOString().slice(0, 10)),
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

    const timeSheet = await prisma.timeSheet.upsert({
      where: {
        organizationId_projectId_employeeId_periodYear_periodMonth: {
          organizationId: guard.context.organizationId,
          projectId: project.id,
          employeeId: employee.id,
          periodYear: payload.periodYear,
          periodMonth: payload.periodMonth,
        },
      },
      update: {
        status: "DRAFT",
      },
      create: {
        organizationId: guard.context.organizationId,
        projectId: project.id,
        employeeId: employee.id,
        periodYear: payload.periodYear,
        periodMonth: payload.periodMonth,
        status: "DRAFT",
      },
      select: {
        id: true,
      },
    });

    await prisma.timeSheetEntry.deleteMany({
      where: {
        timeSheetId: timeSheet.id,
      },
    });

    for (const entry of payload.entries) {
      const workDate = new Date(`${entry.workDate}T00:00:00.000Z`);
      const dayOfWeek = workDate.getUTCDay();
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const isHoliday = holidayDateSet.has(entry.workDate);

      const startMinutes = parseMinutes(entry.startTime);
      let endMinutes = parseMinutes(entry.endTime);

      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
      }

      const grossMinutes = endMinutes - startMinutes;
      const workedMinutes = Math.max(grossMinutes - entry.breakMinutes, 0);
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
          breakMinutes: entry.breakMinutes,
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

    return NextResponse.json({ data: { id: timeSheet.id } }, { status: 201 });
  } catch (error) {
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
