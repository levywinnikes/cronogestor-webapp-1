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
  const periodYear = searchParams.get("periodYear");
  const periodMonth = searchParams.get("periodMonth");

  if (!projectId || !employeeId || !periodYear || !periodMonth) {
    return NextResponse.json(
      { message: "Faltam parametros obrigatorios" },
      { status: 400 },
    );
  }

  const { prisma } = await import("@/lib/prisma");

  const timeSheet = await prisma.timeSheet.findUnique({
    where: {
      organizationId_projectId_employeeId_periodYear_periodMonth: {
        organizationId: guard.context.organizationId,
        projectId,
        employeeId,
        periodYear: parseInt(periodYear, 10),
        periodMonth: parseInt(periodMonth, 10),
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
