import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantContext } from "@/lib/api/tenant-guard";

const holidaySchema = z.object({
  date: z.string().min(1),
  name: z.string().min(2),
  type: z.enum(["NACIONAL", "ESTADUAL", "MUNICIPAL", "ORGANIZACAO"]),
});

export async function GET() {
  const guard = await requireTenantContext();

  if (!guard.ok) {
    return guard.response;
  }

  const { prisma } = await import("@/lib/prisma");

  const holidays = await prisma.organizationHoliday.findMany({
    where: { organizationId: guard.context.organizationId },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      name: true,
      type: true,
    },
  });

  return NextResponse.json({ data: holidays });
}

export async function POST(request: Request) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN", "EDITOR"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = holidaySchema.parse(await request.json());
    const { prisma } = await import("@/lib/prisma");

    const holiday = await prisma.organizationHoliday.create({
      data: {
        organizationId: guard.context.organizationId,
        date: new Date(payload.date),
        name: payload.name,
        type: payload.type,
      },
      select: {
        id: true,
        date: true,
        name: true,
        type: true,
      },
    });

    return NextResponse.json({ data: holiday }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados de feriado invalidos." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Falha ao criar feriado." },
      { status: 500 },
    );
  }
}
