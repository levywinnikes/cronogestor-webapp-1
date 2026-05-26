import { NextResponse } from "next/server";
import { requireTenantContext } from "@/lib/api/tenant-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guard = await requireTenantContext();

  if (!guard.ok) {
    return guard.response;
  }

  const account = await prisma.userAccount.findUnique({
    where: { id: guard.context.userAccountId },
    include: {
      memberships: {
        where: {
          status: "ACTIVE",
          organization: { isActive: true },
        },
        include: {
          organization: true,
        },
      },
    },
  });

  if (!account || !account.isActive) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const activeMembership = account.memberships.find(
    (membership: any) => membership.organizationId === guard.context.organizationId,
  );

  if (!activeMembership) {
    return NextResponse.json(
      { message: "Tenant da sessao nao encontrado." },
      { status: 403 },
    );
  }

  return NextResponse.json({
    user: {
      id: account.id,
      name: account.name,
      email: account.email,
      role: activeMembership.role,
      isActive: account.isActive,
    },
    activeOrganization: {
      id: activeMembership.organization.id,
      name:
        activeMembership.organization.displayName ??
        activeMembership.organization.legalName,
    },
    organizations: account.memberships.map((membership: any) => ({
      id: membership.organization.id,
      name:
        membership.organization.displayName ??
        membership.organization.legalName,
      role: membership.role,
    })),
  });
}
