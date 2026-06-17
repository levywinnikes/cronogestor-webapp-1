import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantContext } from "@/lib/api/tenant-guard";
import {
  buildDateTime,
  calculateBreakMinutes,
  checkIntraProjectOverlaps,
} from "@/lib/time-sheet";
import {
  collectWorkDatesFromRows,
  detectCrossProjectConflictsForPayload,
  loadTimeSheetLaborContext,
  recalculateAndPersistEmployeeDay,
} from "@/lib/time-sheet/server-context";

const createTimeSheetSchema = z.object({
  projectId: z.string().min(1),
  employeeId: z.string().min(1),
  periodYear: z.number().int().min(2000).max(3000).optional().nullable(),
  periodMonth: z.number().int().min(1).max(12).optional().nullable(),
  conflictAcknowledged: z.boolean().optional(),
  /** Se informado, a checagem cross-project roda só nesses dias (ex.: dia do lançamento atual). */
  conflictCheckWorkDates: z.array(z.string().min(1)).optional(),
  entries: z.array(
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
  ),
});

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

    const organization = await prisma.organization.findUnique({
      where: { id: guard.context.organizationId },
      select: { document: true },
    });

    if (!organization) {
      return NextResponse.json({ message: "Tenant nao encontrado." }, { status: 404 });
    }

    const legacyCompany = await prisma.company.findUnique({
      where: { document: organization.document },
      select: { id: true },
    });

    if (!legacyCompany) {
      return NextResponse.json({ message: "Empresa legada nao encontrada." }, { status: 404 });
    }

    const laborContext = await loadTimeSheetLaborContext(
      prisma,
      guard.context.organizationId,
      payload.employeeId,
      payload.projectId,
      legacyCompany.id,
    );

    if (!laborContext) {
      return NextResponse.json(
        { message: "Funcionario ou projeto nao encontrado." },
        { status: 404 },
      );
    }

    const intraPayloadError = checkIntraProjectOverlaps(
      payload.entries.map((entry, index) => ({
        id: `payload-${index}`,
        projectId: payload.projectId,
        workDate: entry.workDate,
        startTime: entry.startTime,
        endTime: entry.endTime,
        startTime2: entry.startTime2 || null,
        endTime2: entry.endTime2 || null,
        startTime3: entry.startTime3 || null,
        endTime3: entry.endTime3 || null,
        startTime4: entry.startTime4 || null,
        endTime4: entry.endTime4 || null,
      })),
    );

    if (intraPayloadError) {
      return NextResponse.json({ message: intraPayloadError }, { status: 400 });
    }

    if (payload.entries.length > 0) {
      const conflictResult = await detectCrossProjectConflictsForPayload(
        prisma,
        guard.context.organizationId,
        payload.employeeId,
        payload.projectId,
        payload.entries,
        {
          projectCode: laborContext.project.projectCode ?? undefined,
          projectName: laborContext.project.name,
        },
        payload.conflictCheckWorkDates,
      );

      if (conflictResult.type === "intra" && conflictResult.message) {
        return NextResponse.json({ message: conflictResult.message }, { status: 400 });
      }

      if (conflictResult.previews.length > 0 && !payload.conflictAcknowledged) {
        return NextResponse.json(
          {
            message: "Conflito de horarios entre projetos. Confirme a divisao para continuar.",
            conflicts: conflictResult.previews,
          },
          { status: 409 },
        );
      }
    }

    const datesToRecalculate = new Set<string>();

    if (payload.entries.length === 0 && payload.periodYear && payload.periodMonth) {
      const existingTimeSheet = await prisma.timeSheet.findFirst({
        where: {
          organizationId: guard.context.organizationId,
          projectId: laborContext.project.id,
          employeeId: laborContext.employee.id,
          periodYear: payload.periodYear,
          periodMonth: payload.periodMonth,
        },
        select: { id: true },
      });

      if (existingTimeSheet) {
        const oldRows = await prisma.timeSheetEntry.findMany({
          where: { timeSheetId: existingTimeSheet.id },
          select: { workDate: true },
        });
        collectWorkDatesFromRows(oldRows).forEach((date) => datesToRecalculate.add(date));

        await prisma.timeSheetEntry.deleteMany({
          where: { timeSheetId: existingTimeSheet.id },
        });
        await prisma.timeSheet.delete({ where: { id: existingTimeSheet.id } });
      }

      for (const workDate of datesToRecalculate) {
        await recalculateAndPersistEmployeeDay(
          prisma,
          guard.context.organizationId,
          payload.employeeId,
          workDate,
          laborContext.holidayDateSet.has(workDate),
          laborContext.labor,
          laborContext.snapshots,
        );
      }

      return NextResponse.json({ data: { id: "" } }, { status: 201 });
    }

    const periodGroups: Record<string, typeof payload.entries> = {};
    for (const entry of payload.entries) {
      const [yearStr, monthStr] = entry.workDate.split("-");
      const key = `${yearStr}-${monthStr}`;
      if (!periodGroups[key]) periodGroups[key] = [];
      periodGroups[key].push(entry);
    }

    let lastTimeSheetId = "";

    await prisma.$transaction(async (tx) => {
      for (const [key, groupEntries] of Object.entries(periodGroups)) {
        const [year, month] = key.split("-").map(Number);

        const timeSheet = await tx.timeSheet.upsert({
          where: {
            organizationId_projectId_employeeId_periodYear_periodMonth: {
              organizationId: guard.context.organizationId,
              projectId: laborContext.project.id,
              employeeId: laborContext.employee.id,
              periodYear: year,
              periodMonth: month,
            },
          },
          update: { status: "DRAFT" },
          create: {
            organizationId: guard.context.organizationId,
            projectId: laborContext.project.id,
            employeeId: laborContext.employee.id,
            periodYear: year,
            periodMonth: month,
            status: "DRAFT",
          },
          select: { id: true },
        });

        lastTimeSheetId = timeSheet.id;

        const oldRows = await tx.timeSheetEntry.findMany({
          where: { timeSheetId: timeSheet.id },
          select: { workDate: true },
        });
        collectWorkDatesFromRows(oldRows).forEach((date) => datesToRecalculate.add(date));

        await tx.timeSheetEntry.deleteMany({ where: { timeSheetId: timeSheet.id } });

        for (const entry of groupEntries) {
          datesToRecalculate.add(entry.workDate);

          await tx.timeSheetEntry.create({
            data: {
              organizationId: guard.context.organizationId,
              timeSheetId: timeSheet.id,
              employeeId: laborContext.employee.id,
              projectId: laborContext.project.id,
              workDate: new Date(`${entry.workDate}T00:00:00.000Z`),
              startDateTime: buildDateTime(entry.workDate, entry.startTime),
              endDateTime: buildDateTime(entry.workDate, entry.endTime),
              breakMinutes: calculateBreakMinutes(entry),
              startDateTime2:
                entry.startTime2 && entry.endTime2
                  ? buildDateTime(entry.workDate, entry.startTime2)
                  : null,
              endDateTime2:
                entry.startTime2 && entry.endTime2
                  ? buildDateTime(entry.workDate, entry.endTime2)
                  : null,
              startDateTime3:
                entry.startTime3 && entry.endTime3
                  ? buildDateTime(entry.workDate, entry.startTime3)
                  : null,
              endDateTime3:
                entry.startTime3 && entry.endTime3
                  ? buildDateTime(entry.workDate, entry.endTime3)
                  : null,
              startDateTime4:
                entry.startTime4 && entry.endTime4
                  ? buildDateTime(entry.workDate, entry.startTime4)
                  : null,
              endDateTime4:
                entry.startTime4 && entry.endTime4
                  ? buildDateTime(entry.workDate, entry.endTime4)
                  : null,
              ...laborContext.snapshots,
              normalMinutes: 0,
              overtimeFirstTwoMinutes: 0,
              overtimeAfterTwoMinutes: 0,
              saturdayMinutes: 0,
              sundayOrHolidayMinutes: 0,
              nightMinutes: 0,
              calculatedAmount: 0,
              effectiveMinutes: 0,
              exclusiveMinutes: 0,
              sharedMinutes: 0,
              hasSharedMinutes: false,
            },
          });
        }
      }

      for (const workDate of datesToRecalculate) {
        await recalculateAndPersistEmployeeDay(
          tx,
          guard.context.organizationId,
          payload.employeeId,
          workDate,
          laborContext.holidayDateSet.has(workDate),
          laborContext.labor,
          laborContext.snapshots,
        );
      }
    });

    return NextResponse.json({ data: { id: lastTimeSheetId } }, { status: 201 });
  } catch (error) {
    console.error("Error saving timesheet:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Dados de ficha tempo invalidos." }, { status: 400 });
    }

    return NextResponse.json({ message: "Falha ao salvar ficha tempo." }, { status: 500 });
  }
}
