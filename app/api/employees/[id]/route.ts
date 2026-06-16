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
  nationality: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  maritalStatus: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
  number: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  rg: z.string().nullable().optional(),
  rgIssuer: z.string().nullable().optional(),
  ctps: z.string().nullable().optional(),
  pis: z.string().nullable().optional(),
  voterCardNumber: z.string().nullable().optional(),
  voterCardZone: z.string().nullable().optional(),
  voterCardSection: z.string().nullable().optional(),
});

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
      data: {
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
        nationality: payload.nationality || null,
        birthDate: payload.birthDate || null,
        maritalStatus: payload.maritalStatus || null,
        phone: payload.phone || null,
        street: payload.street || null,
        number: payload.number || null,
        neighborhood: payload.neighborhood || null,
        city: payload.city || null,
        zipCode: payload.zipCode || null,
        rg: payload.rg || null,
        rgIssuer: payload.rgIssuer || null,
        ctps: payload.ctps || null,
        pis: payload.pis || null,
        voterCardNumber: payload.voterCardNumber || null,
        voterCardZone: payload.voterCardZone || null,
        voterCardSection: payload.voterCardSection || null,
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
        nationality: true,
        birthDate: true,
        maritalStatus: true,
        phone: true,
        street: true,
        number: true,
        neighborhood: true,
        city: true,
        zipCode: true,
        rg: true,
        rgIssuer: true,
        ctps: true,
        pis: true,
        voterCardNumber: true,
        voterCardZone: true,
        voterCardSection: true,
        createdAt: true,
        updatedAt: true,
      },
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
