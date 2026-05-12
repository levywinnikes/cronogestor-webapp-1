import { cookies } from "next/headers";
import { ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { verifyToken } from "@/lib/auth/crypto";

export interface AccessSession {
  userAccountId: string;
  organizationId: string;
  role: string;
  sessionId: string;
}

export async function getAccessSession(): Promise<AccessSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const claims = verifyToken(accessToken, "access");

    return {
      userAccountId: claims.sub,
      organizationId: claims.orgId,
      role: claims.role,
      sessionId: claims.sid,
    };
  } catch {
    return null;
  }
}
