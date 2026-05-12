import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import { rotateAuthSession } from "@/lib/auth/session";
import { applyAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    const unauthorized = NextResponse.json(
      { message: "Refresh token ausente." },
      { status: 401 },
    );
    clearAuthCookies(unauthorized);
    return unauthorized;
  }

  try {
    const rotated = await rotateAuthSession({
      refreshToken,
      userAgent: request.headers.get("user-agent") ?? undefined,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    const response = NextResponse.json({ ok: true });
    applyAuthCookies(response, rotated.accessToken, rotated.refreshToken);

    return response;
  } catch {
    const unauthorized = NextResponse.json(
      { message: "Sessao expirada." },
      { status: 401 },
    );
    clearAuthCookies(unauthorized);
    return unauthorized;
  }
}
