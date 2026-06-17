import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantContext } from "@/lib/api/tenant-guard";
import {
  employeeSchema,
  employeeSelect,
  mapEmployeeWriteData,
} from "@/lib/employees/employee-schema";

function generateEmployeeCode(): string {
  return `EMP-${Date.now()}`;
}

export async function GET() {
  const guard = await requireTenantContext();

  if (!guard.ok) {
    return guard.response;
  }

  const { prisma } = await import("@/lib/prisma");

  const employees = await prisma.employee.findMany({
    where: {
      organizationId: guard.context.organizationId,
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: employeeSelect,
  });

  return NextResponse.json({ data: employees });
}

export async function POST(request: Request) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN", "EDITOR"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = employeeSchema.parse(await request.json());
    const { prisma } = await import("@/lib/prisma");

    const employee = await prisma.employee.create({
      data: {
        organizationId: guard.context.organizationId,
        employeeCode: generateEmployeeCode(),
        ...mapEmployeeWriteData(payload),
      },
      select: employeeSelect,
    });

    return NextResponse.json({ data: employee }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados de funcionario invalidos." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Falha ao criar funcionario." },
      { status: 500 },
    );
  }
}
