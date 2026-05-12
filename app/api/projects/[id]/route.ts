import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantContext } from "@/lib/api/tenant-guard";

const projectSchema = z.object({
  name: z.string().min(2),
  responsible: z.string().optional(),
  contractType: z.string().optional(),
  contractor: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  budgetForecast: z.string().optional(),
  contractNumber: z.string().optional(),
  status: z.enum(["NAO_INICIADO", "EM_ANDAMENTO", "PARALISADO", "CONCLUIDO"]),
  address: z.string().optional(),
  hasTaskList: z.boolean().optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

async function resolveLegacyCompanyId(
  organizationId: string,
): Promise<string | null> {
  const { prisma } = await import("@/lib/prisma");

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { document: true },
  });

  if (!organization) {
    return null;
  }

  const legacyCompany = await prisma.company.findUnique({
    where: { document: organization.document },
    select: { id: true },
  });

  return legacyCompany?.id ?? null;
}

export async function GET(_request: Request, context: RouteParams) {
  const guard = await requireTenantContext();

  if (!guard.ok) {
    return guard.response;
  }

  const companyId = await resolveLegacyCompanyId(guard.context.organizationId);

  if (!companyId) {
    return NextResponse.json(
      { message: "Projeto nao encontrado." },
      { status: 404 },
    );
  }

  const { id } = await context.params;
  const { prisma } = await import("@/lib/prisma");

  const project = await prisma.project.findFirst({
    where: {
      id,
      companyId,
    },
    select: {
      id: true,
      projectCode: true,
      name: true,
      responsible: true,
      contractType: true,
      contractor: true,
      startDate: true,
      endDate: true,
      budgetForecast: true,
      contractNumber: true,
      status: true,
      address: true,
      hasTaskList: true,
    },
  });

  if (!project) {
    return NextResponse.json(
      { message: "Projeto nao encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: project });
}

export async function PUT(request: Request, context: RouteParams) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN", "EDITOR"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = projectSchema.parse(await request.json());
    const { id } = await context.params;

    const companyId = await resolveLegacyCompanyId(
      guard.context.organizationId,
    );

    if (!companyId) {
      return NextResponse.json(
        { message: "Projeto nao encontrado." },
        { status: 404 },
      );
    }

    const { prisma } = await import("@/lib/prisma");

    const existing = await prisma.project.findFirst({
      where: {
        id,
        companyId,
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Projeto nao encontrado." },
        { status: 404 },
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: payload.name,
        responsible: payload.responsible,
        contractType: payload.contractType,
        contractor: payload.contractor,
        startDate: new Date(payload.startDate),
        endDate: payload.endDate ? new Date(payload.endDate) : null,
        budgetForecast: payload.budgetForecast || null,
        contractNumber: payload.contractNumber,
        status: payload.status,
        address: payload.address,
        hasTaskList: payload.hasTaskList ?? false,
      },
      select: {
        id: true,
        projectCode: true,
        name: true,
        responsible: true,
        contractType: true,
        contractor: true,
        startDate: true,
        endDate: true,
        budgetForecast: true,
        contractNumber: true,
        status: true,
        address: true,
        hasTaskList: true,
      },
    });

    return NextResponse.json({ data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados de projeto invalidos." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Falha ao atualizar projeto." },
      { status: 500 },
    );
  }
}
