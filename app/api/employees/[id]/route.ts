import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantContext } from "@/lib/api/tenant-guard";
import {
  employeeSchema,
  employeeSelect,
  mapEmployeeWriteData,
} from "@/lib/employees/employee-schema";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteParams) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN", "EDITOR"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = employeeSchema.parse(await request.json());
    const { id } = await context.params;
    const { prisma } = await import("@/lib/prisma");

    const existing = await prisma.employee.findFirst({
      where: {
        id,
        organizationId: guard.context.organizationId,
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Funcionario nao encontrado." },
        { status: 404 },
      );
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: mapEmployeeWriteData(payload),
      select: employeeSelect,
    });

    return NextResponse.json({ data: employee });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados de funcionario invalidos." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Falha ao atualizar funcionario." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteParams) {
  const guard = await requireTenantContext({ roles: ["OWNER", "ADMIN"] });

  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await context.params;
  const { prisma } = await import("@/lib/prisma");

  const deleted = await prisma.employee.deleteMany({
    where: {
      id,
      organizationId: guard.context.organizationId,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { message: "Funcionario nao encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
