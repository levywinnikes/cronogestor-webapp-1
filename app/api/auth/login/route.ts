import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { applyAuthCookies } from "@/lib/auth/cookies";
import { createAuthSession } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  organizationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);

    const account = await prisma.userAccount.findUnique({
      where: { email: payload.email.toLowerCase().trim() },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: {
            organization: {
              include: {
                subscriptions: {
                  where: { status: { in: ["TRIAL", "ACTIVE"] } },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!account || !account.isActive) {
      return NextResponse.json({ message: "Credenciais invalidas." }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(payload.password, account.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ message: "Credenciais invalidas." }, { status: 401 });
    }

    const activeMemberships = account.memberships.filter(
      (membership) => membership.organization.isActive,
    );

    if (activeMemberships.length === 0) {
      return NextResponse.json({ message: "Usuario sem tenant ativo." }, { status: 403 });
    }

    const selectedMembership = payload.organizationId
      ? activeMemberships.find(
          (membership) => membership.organizationId === payload.organizationId,
        )
      : activeMemberships[0];

    if (!selectedMembership) {
      return NextResponse.json(
        { message: "Tenant nao encontrado para este usuario." },
        { status: 403 },
      );
    }

    const { accessToken, refreshToken } = await createAuthSession({
      userAccountId: account.id,
      organizationId: selectedMembership.organizationId,
      role: selectedMembership.role,
      userAgent: request.headers.get("user-agent") ?? undefined,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    const response = NextResponse.json({
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        role: selectedMembership.role,
        isActive: account.isActive,
        planType:
          selectedMembership.organization.subscriptions[0]?.planType ?? "FREE",
      },
      activeOrganization: {
        id: selectedMembership.organization.id,
        name:
          selectedMembership.organization.displayName ??
          selectedMembership.organization.legalName,
      },
      organizations: activeMemberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.displayName ?? membership.organization.legalName,
        role: membership.role,
      })),
    });

    applyAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Dados de login invalidos." }, { status: 400 });
    }

    return NextResponse.json({ message: "Falha ao processar login." }, { status: 500 });
  }
}
