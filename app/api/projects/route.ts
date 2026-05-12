import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantContext } from "@/lib/api/tenant-guard";

const createProjectSchema = z.object({
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

function generateProjectCode(): string {
  return `PRJ-${Date.now()}`;
}

export async function GET() {
  const guard = await requireTenantContext();

  if (!guard.ok) {
    return guard.response;
  }

  const { prisma } = await import("@/lib/prisma");

  // Transitional bridge: while Project still belongs to Company,
  // map tenant Organization by the shared legal document.
  const organization = await prisma.organization.findUnique({
    where: { id: guard.context.organizationId },
    select: {
      document: true,
    },
  });

  if (!organization) {
    return NextResponse.json({ data: [] });
  }

  const legacyCompany = await prisma.company.findUnique({
    where: { document: organization.document },
    select: { id: true },
  });

  if (!legacyCompany) {
    return NextResponse.json({ data: [] });
  }

  const projects = await prisma.project.findMany({
    where: {
      companyId: legacyCompany.id,
    },
    orderBy: { createdAt: "desc" },
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
      extraMonthlyPerEmployee: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ data: projects });
}

export async function POST(request: Request) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN", "EDITOR"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = createProjectSchema.parse(await request.json());
    const { prisma } = await import("@/lib/prisma");

    const organization = await prisma.organization.findUnique({
      where: { id: guard.context.organizationId },
      select: {
        document: true,
        legalName: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Tenant nao encontrado." },
        { status: 404 },
      );
    }

    const company = await prisma.company.upsert({
      where: { document: organization.document },
      update: {
        name: organization.legalName,
      },
      create: {
        personType: "PJ",
        document: organization.document,
        name: organization.legalName,
        email: `${organization.document}@tenant.cronogestor.local`,
        planType: "FREE",
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    const project = await prisma.project.create({
      data: {
        companyId: company.id,
        projectCode: generateProjectCode(),
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

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados de projeto invalidos." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Falha ao criar projeto." },
      { status: 500 },
    );
  }
}
