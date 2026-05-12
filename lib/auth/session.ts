import { prisma } from "@/lib/prisma";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/lib/auth/constants";
import { hashToken, signToken, verifyToken } from "@/lib/auth/crypto";
import type { MembershipRole } from "@prisma/client";

interface CreateSessionInput {
  userAccountId: string;
  organizationId: string;
  role: MembershipRole;
  userAgent?: string;
  ipAddress?: string;
}

interface RotateSessionInput {
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
}

interface SessionTokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function createAuthSession(
  input: CreateSessionInput,
): Promise<SessionTokenPair> {
  const provisionalRefreshToken = signToken(
    {
      sub: input.userAccountId,
      orgId: input.organizationId,
      sid: "pending",
      role: input.role,
    },
    "refresh",
    REFRESH_TOKEN_TTL_SECONDS,
  );

  const session = await prisma.authSession.create({
    data: {
      userAccountId: input.userAccountId,
      organizationId: input.organizationId,
      refreshTokenHash: hashToken(provisionalRefreshToken),
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    },
  });

  const refreshToken = signToken(
    {
      sub: input.userAccountId,
      orgId: input.organizationId,
      sid: session.id,
      role: input.role,
    },
    "refresh",
    REFRESH_TOKEN_TTL_SECONDS,
  );

  const accessToken = signToken(
    {
      sub: input.userAccountId,
      orgId: input.organizationId,
      sid: session.id,
      role: input.role,
    },
    "access",
    ACCESS_TOKEN_TTL_SECONDS,
  );

  await prisma.authSession.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    },
  });

  return { accessToken, refreshToken };
}

export async function rotateAuthSession(
  input: RotateSessionInput,
): Promise<SessionTokenPair> {
  const claims = verifyToken(input.refreshToken, "refresh");
  const session = await prisma.authSession.findUnique({
    where: { id: claims.sid },
  });

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt.getTime() <= Date.now()
  ) {
    throw new Error("Session not found or expired.");
  }

  const providedHash = hashToken(input.refreshToken);

  if (session.refreshTokenHash !== providedHash) {
    throw new Error("Refresh token mismatch.");
  }

  const refreshedToken = signToken(
    {
      sub: claims.sub,
      orgId: claims.orgId,
      sid: claims.sid,
      role: claims.role,
    },
    "refresh",
    REFRESH_TOKEN_TTL_SECONDS,
  );

  const accessToken = signToken(
    {
      sub: claims.sub,
      orgId: claims.orgId,
      sid: claims.sid,
      role: claims.role,
    },
    "access",
    ACCESS_TOKEN_TTL_SECONDS,
  );

  await prisma.authSession.update({
    where: { id: claims.sid },
    data: {
      refreshTokenHash: hashToken(refreshedToken),
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      revokedAt: null,
    },
  });

  return { accessToken, refreshToken: refreshedToken };
}

export async function revokeAuthSession(refreshToken: string): Promise<void> {
  const claims = verifyToken(refreshToken, "refresh");

  await prisma.authSession.updateMany({
    where: {
      id: claims.sid,
      userAccountId: claims.sub,
      organizationId: claims.orgId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}
