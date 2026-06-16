import { NextResponse } from "next/server";
import { requireTenantContext } from "@/lib/api/tenant-guard";

export async function GET(request: Request) {
  const guard = await requireTenantContext();

  if (!guard.ok) {
    return guard.response;
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const employeeId = searchParams.get("employeeId");
  const periodYearParam = searchParams.get("periodYear");
  const periodMonthParam = searchParams.get("periodMonth");

  if (!projectId || !employeeId) {
    return NextResponse.json(
      { message: "Faltam parametros obrigatorios" },
      { status: 400 },
    );
  }

  const { prisma } = await import("@/lib/prisma");

  const whereClause: any = {
    organizationId: guard.context.organizationId,
  };

  if (employeeId !== "all") {
    whereClause.employeeId = employeeId;
  }

  if (projectId !== "all") {
    whereClause.projectId = projectId;
  }

  if (periodYearParam !== "all") {
    const periodYear = periodYearParam ? parseInt(periodYearParam, 10) : new Date().getFullYear();
    const periodMonth = periodMonthParam ? parseInt(periodMonthParam, 10) : new Date().getMonth() + 1;
    whereClause.periodYear = periodYear;
    whereClause.periodMonth = periodMonth;
  }

  if (periodYearParam === "all" || projectId === "all" || employeeId === "all") {
    const timeSheets = await prisma.timeSheet.findMany({
      where: whereClause,
      include: {
        entries: {
          orderBy: {
            workDate: "asc",
          },
        },
      },
    });
    
    // FlatMap all entries and sort by workDate ascending
    const allEntries = timeSheets
      .flatMap((ts) => ts.entries)
      .sort((a, b) => new Date(a.workDate).getTime() - new Date(b.workDate).getTime());

    return NextResponse.json({
      data: {
        id: "all",
        organizationId: guard.context.organizationId,
        projectId,
        employeeId,
        periodYear: 0,
        periodMonth: 0,
        status: "DRAFT",
        entries: allEntries,
      },
    });
  }

  const periodYear = periodYearParam ? parseInt(periodYearParam, 10) : new Date().getFullYear();
  const periodMonth = periodMonthParam ? parseInt(periodMonthParam, 10) : new Date().getMonth() + 1;

  const timeSheet = await prisma.timeSheet.findUnique({
    where: {
      organizationId_projectId_employeeId_periodYear_periodMonth: {
        organizationId: guard.context.organizationId,
        projectId,
        employeeId,
        periodYear,
        periodMonth,
      },
    },
    include: {
      entries: {
        orderBy: {
          workDate: "asc",
        },
      },
    },
  });

  return NextResponse.json({ data: timeSheet || null });
}
