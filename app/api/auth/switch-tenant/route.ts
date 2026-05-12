import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenantContext } from "@/lib/api/tenant-guard";
import { createAuthSession } from "@/lib/auth/session";
import { applyAuthCookies } from "@/lib/auth/cookies";

const switchSchema = z.object({
  organizationId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const guard = await requireTenantContext();

    if (!guard.ok) {
      return guard.response;
    }

    const body = await request.json();
    const payload = switchSchema.parse(body);

    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: payload.organizationId,
        userAccountId: guard.context.userAccountId,
        status: "ACTIVE",
        organization: { isActive: true },
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      return NextResponse.json({ message: "Tenant nao autorizado." }, { status: 403 });
    }

    const { accessToken, refreshToken } = await createAuthSession({
      userAccountId: guard.context.userAccountId,
      organizationId: membership.organizationId,
      role: membership.role,
      userAgent: request.headers.get("user-agent") ?? undefined,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    const response = NextResponse.json({
      activeOrganization: {
        id: membership.organization.id,
        name: membership.organization.displayName ?? membership.organization.legalName,
      },
    });

    applyAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Tenant invalido." }, { status: 400 });
    }

    return NextResponse.json({ message: "Falha ao trocar tenant." }, { status: 500 });
  }
}
