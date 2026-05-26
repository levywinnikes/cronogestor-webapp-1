import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { applyAuthCookies } from "@/lib/auth/cookies";
import { createAuthSession } from "@/lib/auth/session";

const registerSchema = z.object({
  type: z.enum(["PF", "PJ"]),
  planId: z.enum(["BASIC", "PREMIUM", "FULL"]),
  document: z.string().min(11),
  name: z.string().min(3),
  email: z.string().email(),
  challenge: z.string().optional(),
  password: z.string().min(6),
});

function mapPlan(
  planId: "BASIC" | "PREMIUM" | "FULL",
): "FREE" | "PREMIUM" | "FULL" {
  if (planId === "BASIC") {
    return "FREE";
  }

  return planId;
}

function cleanDocument(document: string): string {
  return document.replace(/\D/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = registerSchema.parse(body);

    const normalizedEmail = payload.email.toLowerCase().trim();
    const normalizedDocument = cleanDocument(payload.document);

    const existingAccount = await prisma.userAccount.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingAccount) {
      return NextResponse.json(
        { message: "Este email ja esta em uso." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(payload.password);

    const data = await prisma.$transaction(async (tx: any) => {
      const organization = await tx.organization.create({
        data: {
          personType: payload.type,
          document: normalizedDocument,
          legalName: payload.name,
          displayName: payload.name,
          isActive: true,
        },
      });

      const account = await tx.userAccount.create({
        data: {
          name: payload.name,
          email: normalizedEmail,
          passwordHash,
          isActive: true,
        },
      });

      const membership = await tx.organizationMembership.create({
        data: {
          organizationId: organization.id,
          userAccountId: account.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      });

      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          planType: mapPlan(payload.planId),
          status: "TRIAL",
        },
      });

      return {
        organization,
        account,
        membership,
      };
    });

    const { accessToken, refreshToken } = await createAuthSession({
      userAccountId: data.account.id,
      organizationId: data.organization.id,
      role: data.membership.role,
      userAgent: request.headers.get("user-agent") ?? undefined,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    const response = NextResponse.json({
      user: {
        id: data.account.id,
        name: data.account.name,
        email: data.account.email,
        role: data.membership.role,
        isActive: data.account.isActive,
        planType: mapPlan(payload.planId),
      },
      activeOrganization: {
        id: data.organization.id,
        name: data.organization.displayName ?? data.organization.legalName,
      },
      organizations: [
        {
          id: data.organization.id,
          name: data.organization.displayName ?? data.organization.legalName,
          role: data.membership.role,
        },
      ],
    });

    applyAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error("[REGISTER_ERROR]", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      const fieldErrors = (error as any).errors.map(
        (e: any) => `${e.path.join(".")}: ${e.message}`,
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
      if (error.message.includes("transaction")) {
        return NextResponse.json(
          { message: "Erro ao registrar. Tente novamente." },
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
          "Falha ao registrar conta. Verifique seus dados e tente novamente.",
      },
      { status: 500 },
    );
  }
}
