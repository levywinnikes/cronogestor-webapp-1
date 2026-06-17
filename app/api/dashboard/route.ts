import { NextResponse } from "next/server";
import { requireTenantContext } from "@/lib/api/tenant-guard";

export async function GET() {
  const guard = await requireTenantContext();

  if (!guard.ok) {
    return guard.response;
  }

  const { prisma } = await import("@/lib/prisma");

  const organization = await prisma.organization.findUnique({
    where: { id: guard.context.organizationId },
    select: { document: true },
  });

  if (!organization) {
    return NextResponse.json({
      summary: { totalBudget: 0, totalRealized: 0, totalHours: 0 },
      projects: [],
    });
  }

  const legacyCompany = await prisma.company.findUnique({
    where: { document: organization.document },
    select: { id: true },
  });

  if (!legacyCompany) {
    return NextResponse.json({
      summary: { totalBudget: 0, totalRealized: 0, totalHours: 0 },
      projects: [],
    });
  }

  const projects = await prisma.project.findMany({
    where: { companyId: legacyCompany.id },
    select: {
      id: true,
      name: true,
      budgetForecast: true,
      budgetMaterials: true,
      budgetLabor: true,
      budgetOthers: true,
    },
  });

  try {
    const timeSheetEntries = await prisma.timeSheetEntry.findMany({
      where: { organizationId: guard.context.organizationId },
      select: {
        projectId: true,
        calculatedAmount: true,
        effectiveMinutes: true,
        normalMinutes: true,
        overtimeFirstTwoMinutes: true,
        overtimeAfterTwoMinutes: true,
        saturdayMinutes: true,
        sundayOrHolidayMinutes: true,
      },
    });

    const projectStats = projects.map((proj) => {
      const projEntries = timeSheetEntries.filter((e) => e.projectId === proj.id);
      const realizedCost = projEntries.reduce((sum, e) => sum + Number(e.calculatedAmount), 0);
      const totalMinutes = projEntries.reduce((sum, e) => {
        if (e.effectiveMinutes > 0) {
          return sum + e.effectiveMinutes;
        }
        return (
          sum +
          e.normalMinutes +
          e.overtimeFirstTwoMinutes +
          e.overtimeAfterTwoMinutes +
          e.saturdayMinutes +
          e.sundayOrHolidayMinutes
        );
      }, 0);
      const realizedHours = totalMinutes / 60;

      return {
        projectId: proj.id,
        projectName: proj.name,
        budgetForecast: Number(proj.budgetForecast) || 0,
        budgetMaterials: Number(proj.budgetMaterials) || 0,
        budgetLabor: Number(proj.budgetLabor) || 0,
        budgetOthers: Number(proj.budgetOthers) || 0,
        realizedCost,
        realizedHours,
      };
    });

    const totalBudget = projectStats.reduce((sum, p) => sum + p.budgetForecast, 0);
    const totalRealized = projectStats.reduce((sum, p) => sum + p.realizedCost, 0);
    const totalHours = projectStats.reduce((sum, p) => sum + p.realizedHours, 0);

    return NextResponse.json({
      summary: {
        totalBudget,
        totalRealized,
        totalHours,
      },
      projects: projectStats,
    });
  } catch (error) {
    console.error("Error loading dashboard timesheet stats:", error);
    return NextResponse.json(
      { message: "Falha ao carregar dados do dashboard." },
      { status: 500 },
    );
  }
}
