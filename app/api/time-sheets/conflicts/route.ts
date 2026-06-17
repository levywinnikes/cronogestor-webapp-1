import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantContext } from "@/lib/api/tenant-guard";
import {
  buildDeleteImpactPreview,
  checkIntraProjectOverlaps,
  mapPayloadEntryToIntervalEntry,
} from "@/lib/time-sheet";
import {
  fetchEmployeeDayEntries,
  loadTimeSheetLaborContext,
  detectCrossProjectConflictsForPayload,
} from "@/lib/time-sheet/server-context";

const previewSchema = z.object({
  projectId: z.string().min(1),
  employeeId: z.string().min(1),
  entry: z.object({
    workDate: z.string().min(1),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    startTime2: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
    endTime2: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
    startTime3: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
    endTime3: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
    startTime4: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
    endTime4: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
  }),
  excludeEntryId: z.string().optional(),
});

const deleteImpactSchema = z.object({
  entryId: z.string().min(1),
  employeeId: z.string().min(1),
});

async function resolveLegacyCompanyId(organizationId: string) {
  const { prisma } = await import("@/lib/prisma");
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { document: true },
  });
  if (!organization) return null;

  const legacyCompany = await prisma.company.findUnique({
    where: { document: organization.document },
    select: { id: true },
  });

  return legacyCompany?.id ?? null;
}

export async function POST(request: Request) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN", "EDITOR"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = previewSchema.parse(await request.json());
    const { prisma } = await import("@/lib/prisma");
    const legacyCompanyId = await resolveLegacyCompanyId(guard.context.organizationId);

    if (!legacyCompanyId) {
      return NextResponse.json({ message: "Empresa legada nao encontrada." }, { status: 404 });
    }

    const laborContext = await loadTimeSheetLaborContext(
      prisma,
      guard.context.organizationId,
      payload.employeeId,
      payload.projectId,
      legacyCompanyId,
    );

    if (!laborContext) {
      return NextResponse.json(
        { message: "Funcionario ou projeto nao encontrado." },
        { status: 404 },
      );
    }

    const existing = await fetchEmployeeDayEntries(
      prisma,
      guard.context.organizationId,
      payload.employeeId,
      payload.entry.workDate,
    );

    const others = existing.filter(
      (entry) =>
        entry.projectId !== payload.projectId &&
        (!payload.excludeEntryId || entry.id !== payload.excludeEntryId),
    );

    const candidate = mapPayloadEntryToIntervalEntry(
      payload.projectId,
      payload.entry,
      payload.excludeEntryId ?? "candidate-preview",
      {
        projectCode: laborContext.project.projectCode ?? undefined,
        projectName: laborContext.project.name,
      },
    );

    const merged = [...others, candidate];
    const intraError = checkIntraProjectOverlaps(merged);
    if (intraError) {
      return NextResponse.json({ message: intraError }, { status: 400 });
    }

    const conflictResult = await detectCrossProjectConflictsForPayload(
      prisma,
      guard.context.organizationId,
      payload.employeeId,
      payload.projectId,
      [payload.entry],
      {
        projectCode: laborContext.project.projectCode ?? undefined,
        projectName: laborContext.project.name,
      },
    );

    return NextResponse.json({
      data: {
        conflicts: conflictResult.previews,
        hasConflict: conflictResult.previews.length > 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Dados invalidos para preview." }, { status: 400 });
    }

    return NextResponse.json({ message: "Falha ao gerar preview de conflito." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN", "EDITOR"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = deleteImpactSchema.parse({
      entryId: searchParams.get("entryId"),
      employeeId: searchParams.get("employeeId"),
    });

    const { prisma } = await import("@/lib/prisma");
    const entry = await prisma.timeSheetEntry.findFirst({
      where: {
        id: parsed.entryId,
        organizationId: guard.context.organizationId,
        employeeId: parsed.employeeId,
      },
      select: {
        id: true,
        workDate: true,
        hasSharedMinutes: true,
        employee: {
          select: {
            salary: true,
            chargesPercent: true,
            hoursPerDay: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ message: "Lancamento nao encontrado." }, { status: 404 });
    }

    const defaultPolicy = await prisma.organizationLaborPolicy.findFirst({
      where: { organizationId: guard.context.organizationId, isDefault: true },
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
      where: { organizationId: guard.context.organizationId },
      select: { date: true },
    });
    const holidayDateSet = new Set(
      holidayDates.map((holiday) => holiday.date.toISOString().slice(0, 10)),
    );

    const workDate = entry.workDate.toISOString().slice(0, 10);
    const hourlyBase =
      (Number(entry.employee.salary) / 220) *
      (1 + Number(entry.employee.chargesPercent) / 100);

    const labor = {
      hoursPerDay: Number(entry.employee.hoursPerDay),
      hourlyBase,
      policy: {
        weekdayFirstTwoPercent: Number(defaultPolicy?.weekdayFirstTwoHoursPercent ?? 50),
        weekdayAfterTwoPercent: Number(defaultPolicy?.weekdayAfterTwoHoursPercent ?? 100),
        saturdayPercent: Number(defaultPolicy?.saturdayPercent ?? 50),
        sundayPercent: Number(defaultPolicy?.sundayPercent ?? 100),
        holidayPercent: Number(defaultPolicy?.holidayPercent ?? 100),
        nightPercent: Number(defaultPolicy?.nightAdditionalPercent ?? 20),
      },
    };

    const dayEntries = await fetchEmployeeDayEntries(
      prisma,
      guard.context.organizationId,
      parsed.employeeId,
      workDate,
    );

    const impact = buildDeleteImpactPreview(
      dayEntries,
      workDate,
      parsed.entryId,
      parsed.employeeId,
      holidayDateSet.has(workDate),
      labor,
    );

    return NextResponse.json({
      data: {
        ...impact,
        requiresConfirmation: entry.hasSharedMinutes || impact.hasImpact,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Parametros invalidos." }, { status: 400 });
    }

    return NextResponse.json({ message: "Falha ao gerar preview de exclusao." }, { status: 500 });
  }
}
