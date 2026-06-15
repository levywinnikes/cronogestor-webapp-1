import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantContext } from "@/lib/api/tenant-guard";

const employeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  document: z.string().min(5),
  roleName: z.string().optional(),
  salary: z.number().nonnegative(),
  regime: z.enum(["DIA", "QUINZENA", "MES"]),
  hoursPerDay: z.number().positive(),
  chargesPercent: z.number().nonnegative(),
  benefitsAmount: z.number().nonnegative(),
  isActive: z.boolean().optional(),
  bankName: z.string().nullable().optional(),
  bankAgency: z.string().nullable().optional(),
  bankAccount: z.string().nullable().optional(),
  bankAccountDigit: z.string().nullable().optional(),
  bankSwift: z.string().nullable().optional(),
  bankIban: z.string().nullable().optional(),
  pixKey: z.string().nullable().optional(),
  vtEnabled: z.boolean().optional(),
});

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
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      document: true,
      roleName: true,
      salary: true,
      regime: true,
      hoursPerDay: true,
      chargesPercent: true,
      benefitsAmount: true,
      isActive: true,
      bankName: true,
      bankAgency: true,
      bankAccount: true,
      bankAccountDigit: true,
      bankSwift: true,
      bankIban: true,
      pixKey: true,
      vtEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
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
        firstName: payload.firstName,
        lastName: payload.lastName,
        document: payload.document,
        roleName: payload.roleName,
        salary: payload.salary,
        regime: payload.regime,
        hoursPerDay: payload.hoursPerDay,
        chargesPercent: payload.chargesPercent,
        benefitsAmount: payload.benefitsAmount,
        isActive: payload.isActive ?? true,
        bankName: payload.bankName || null,
        bankAgency: payload.bankAgency || null,
        bankAccount: payload.bankAccount || null,
        bankAccountDigit: payload.bankAccountDigit || null,
        bankSwift: payload.bankSwift || null,
        bankIban: payload.bankIban || null,
        pixKey: payload.pixKey || null,
        vtEnabled: payload.vtEnabled ?? false,
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        document: true,
        roleName: true,
        salary: true,
        regime: true,
        hoursPerDay: true,
        chargesPercent: true,
        benefitsAmount: true,
        isActive: true,
        bankName: true,
        bankAgency: true,
        bankAccount: true,
        bankAccountDigit: true,
        bankSwift: true,
        bankIban: true,
        pixKey: true,
        vtEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
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
