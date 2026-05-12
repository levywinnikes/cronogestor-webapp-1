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
      return NextResponse.json(
        { message: "Credenciais invalidas." },
        { status: 401 },
      );
    }

    const passwordMatches = await verifyPassword(
      payload.password,
      account.passwordHash,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Credenciais invalidas." },
        { status: 401 },
      );
    }

    const activeMemberships = account.memberships.filter(
      (membership) => membership.organization.isActive,
    );

    if (activeMemberships.length === 0) {
      return NextResponse.json(
        { message: "Usuario sem tenant ativo." },
        { status: 403 },
      );
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
        name:
          membership.organization.displayName ??
          membership.organization.legalName,
        role: membership.role,
      })),
    });

    applyAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error("[LOGIN_ERROR]", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      );
      return NextResponse.json(
        { message: `Dados invalidos: ${fieldErrors.join(", ")}` },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("session")) {
        return NextResponse.json(
          { message: "Erro ao criar sessao. Tente novamente." },
          { status: 500 },
        );
      }
      if (
        error.message.includes("database") ||
        error.message.includes("prisma")
      ) {
        return NextResponse.json(
          { message: "Erro ao conectar. Tente novamente em alguns minutos." },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "Falha ao processar login. Verifique seus dados e tente novamente.",
      },
      { status: 500 },
    );
  }
}
