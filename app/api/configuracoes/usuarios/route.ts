import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantContext } from "@/lib/api/tenant-guard";

const inviteUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"]),
});

const updateUserSchema = z.object({
  membershipId: z.string().min(1),
  role: z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"]),
  status: z.enum(["ACTIVE", "DISABLED"]),
});

// GET: List memberships in the current tenant
export async function GET() {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN", "EDITOR", "VIEWER"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  const { prisma } = await import("@/lib/prisma");

  try {
    const memberships = await prisma.organizationMembership.findMany({
      where: {
        organizationId: guard.context.organizationId,
      },
      include: {
        userAccount: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ data: memberships });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json(
      { message: "Falha ao carregar usuários da organização." },
      { status: 500 }
    );
  }
}

// POST: Invite/Add a user to the organization
export async function POST(request: Request) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = inviteUserSchema.parse(await request.json());
    const { prisma } = await import("@/lib/prisma");

    // Check if a global user account exists with this email
    let userAccount = await prisma.userAccount.findUnique({
      where: { email: payload.email.toLowerCase() },
    });

    // If user does not exist, create a placeholder account
    if (!userAccount) {
      const bcrypt = await import("bcryptjs");
      // Default password: 123456
      const passwordHash = await bcrypt.hash("123456", 10);
      userAccount = await prisma.userAccount.create({
        data: {
          name: payload.name,
          email: payload.email.toLowerCase(),
          passwordHash,
          isActive: true,
        },
      });
    }

    // Check if already a member of the organization
    const existingMembership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: guard.context.organizationId,
        userAccountId: userAccount.id,
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { message: "Este usuário já é membro da organização." },
        { status: 400 }
      );
    }

    // Create membership
    const membership = await prisma.organizationMembership.create({
      data: {
        organizationId: guard.context.organizationId,
        userAccountId: userAccount.id,
        role: payload.role,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ data: membership }, { status: 201 });
  } catch (error) {
    console.error("Error inviting user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados de convite inválidos." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Falha ao convidar usuário." },
      { status: 500 }
    );
  }
}

// PUT: Update a user's role or status
export async function PUT(request: Request) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = updateUserSchema.parse(await request.json());
    const { prisma } = await import("@/lib/prisma");

    const membership = await prisma.organizationMembership.findFirst({
      where: {
        id: payload.membershipId,
        organizationId: guard.context.organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "Membro não encontrado." },
        { status: 404 }
      );
    }

    // A user cannot edit their own membership role to prevent locking themselves out
    const currentMembership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: guard.context.organizationId,
        userAccountId: guard.context.userAccountId,
      },
    });

    if (currentMembership?.id === membership.id) {
      return NextResponse.json(
        { message: "Você não pode editar seu próprio papel." },
        { status: 400 }
      );
    }

    // Safeguard: Do not allow disabling or demoting the last active administrator
    const isAdminOrOwner = membership.role === "ADMIN" || membership.role === "OWNER";
    const isActive = membership.status === "ACTIVE";
    const willBeDemoted = payload.role !== "ADMIN" && payload.role !== "OWNER";
    const willBeDisabled = payload.status === "DISABLED";

    if (isAdminOrOwner && isActive && (willBeDemoted || willBeDisabled)) {
      const otherAdminsCount = await prisma.organizationMembership.count({
        where: {
          organizationId: guard.context.organizationId,
          role: { in: ["ADMIN", "OWNER"] },
          status: "ACTIVE",
          id: { not: membership.id },
        },
      });

      if (otherAdminsCount === 0) {
        return NextResponse.json(
          { message: "A organização precisa de pelo menos 1 Administrador ativo." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.organizationMembership.update({
      where: { id: membership.id },
      data: {
        role: payload.role,
        status: payload.status === "ACTIVE" ? "ACTIVE" : "DISABLED",
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating user membership:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Parâmetros de atualização inválidos." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Falha ao atualizar papel do usuário." },
      { status: 500 }
    );
  }
}

// DELETE: Remove a user from the organization
export async function DELETE(request: Request) {
  const guard = await requireTenantContext({
    roles: ["OWNER", "ADMIN"],
  });

  if (!guard.ok) {
    return guard.response;
  }

  const { searchParams } = new URL(request.url);
  const membershipId = searchParams.get("membershipId");

  if (!membershipId) {
    return NextResponse.json(
      { message: "Parâmetro membershipId obrigatório." },
      { status: 400 }
    );
  }

  const { prisma } = await import("@/lib/prisma");

  try {
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        id: membershipId,
        organizationId: guard.context.organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "Membro não encontrado." },
        { status: 404 }
      );
    }

    // Prevents self deletion
    const currentMembership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: guard.context.organizationId,
        userAccountId: guard.context.userAccountId,
      },
    });

    if (currentMembership?.id === membership.id) {
      return NextResponse.json(
        { message: "Você não pode remover seu próprio acesso." },
        { status: 400 }
      );
    }

    // Safeguard: Do not allow deleting the last active administrator
    const isAdminOrOwner = membership.role === "ADMIN" || membership.role === "OWNER";
    const isActive = membership.status === "ACTIVE";

    if (isAdminOrOwner && isActive) {
      const otherAdminsCount = await prisma.organizationMembership.count({
        where: {
          organizationId: guard.context.organizationId,
          role: { in: ["ADMIN", "OWNER"] },
          status: "ACTIVE",
          id: { not: membership.id },
        },
      });

      if (otherAdminsCount === 0) {
        return NextResponse.json(
          { message: "A organização precisa de pelo menos 1 Administrador ativo." },
          { status: 400 }
        );
      }
    }

    await prisma.organizationMembership.delete({
      where: { id: membership.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting membership:", error);
    return NextResponse.json(
      { message: "Falha ao remover membro da organização." },
      { status: 500 }
    );
  }
}
