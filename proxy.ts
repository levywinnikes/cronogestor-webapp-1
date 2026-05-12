import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth/constants";

const PROTECTED_PATHS = [
  "/dashboard",
  "/funcionarios",
  "/ficha-tempo",
  "/projetos",
  "/configuracoes",
];

const PUBLIC_AUTH_PATHS = ["/login", "/register"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessCookie = Boolean(
    request.cookies.get(ACCESS_COOKIE_NAME)?.value,
  );

  if (isProtectedPath(pathname) && !hasAccessCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isPublicAuthPath(pathname) && hasAccessCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
