import { NextResponse } from "next/server";
import type { MembershipRole } from "@prisma/client";
import { getAccessSession } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";

export interface TenantContext {
  sessionId: string;
  userAccountId: string;
  organizationId: string;
  role: MembershipRole;
}

interface GuardOptions {
  roles?: MembershipRole[];
}

type GuardResult =
  | { ok: true; context: TenantContext }
  | { ok: false; response: NextResponse };

export async function requireTenantContext(options?: GuardOptions): Promise<GuardResult> {
  const access = await getAccessSession();

  if (!access) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Nao autenticado." }, { status: 401 }),
    };
  }

  const session = await prisma.authSession.findFirst({
    where: {
      id: access.sessionId,
      userAccountId: access.userAccountId,
      organizationId: access.organizationId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Sessao expirada." }, { status: 401 }),
    };
  }

  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userAccountId: access.userAccountId,
      organizationId: access.organizationId,
      status: "ACTIVE",
      organization: { isActive: true },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Tenant nao autorizado." }, { status: 403 }),
    };
  }

  if (options?.roles && !options.roles.includes(membership.role)) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Permissao insuficiente." }, { status: 403 }),
    };
  }

  return {
    ok: true,
    context: {
      sessionId: access.sessionId,
      userAccountId: access.userAccountId,
      organizationId: access.organizationId,
      role: membership.role,
    },
  };
}
