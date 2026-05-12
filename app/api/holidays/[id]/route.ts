import { NextResponse } from "next/server";
import { requireTenantContext } from "@/lib/api/tenant-guard";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteParams) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN", "EDITOR"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await context.params;
  const { prisma } = await import("@/lib/prisma");

  const deleted = await prisma.organizationHoliday.deleteMany({
    where: {
      id,
      organizationId: guard.context.organizationId,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { message: "Feriado nao encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
