import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import { revokeAuthSession } from "@/lib/auth/session";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (refreshToken) {
    try {
      await revokeAuthSession(refreshToken);
    } catch {
      // Ignore invalid or expired token and still clear local cookies.
    }
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);

  return response;
}
