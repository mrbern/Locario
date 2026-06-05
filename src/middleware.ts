import { NextRequest, NextResponse } from "next/server";

const ADMIN_AUTH_COOKIE_NAME = "neario-admin-auth";

function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "";
}

function isAdminAuthenticated(request: NextRequest) {
  const expectedToken = getAdminSessionToken();

  if (!expectedToken) {
    return false;
  }

  const cookieToken = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;

  return cookieToken === expectedToken;
}

function isProtectedAdminPage(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isProtectedApiRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (pathname === "/api/companies") {
    return method !== "GET";
  }

  if (pathname.startsWith("/api/companies/")) {
    return method !== "GET";
  }

  if (pathname === "/api/company-inquiries") {
    return method === "GET";
  }

  if (pathname.startsWith("/api/company-inquiries/")) {
    return true;
  }

  if (pathname === "/api/leads") {
    return method === "GET";
  }

  if (pathname === "/api/search-logs") {
    return method === "GET";
  }

  if (pathname.startsWith("/api/search-logs/")) {
    return method === "GET";
  }

  return false;
}

function createUnauthorizedApiResponse() {
  return NextResponse.json(
    {
      message: "Nicht autorisiert. Bitte als Admin einloggen.",
    },
    {
      status: 401,
    }
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtectedAdminPage(pathname)) {
    if (isAdminAuthenticated(request)) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/admin-login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedApiRoute(request)) {
    if (isAdminAuthenticated(request)) {
      return NextResponse.next();
    }

    return createUnauthorizedApiResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/companies",
    "/api/companies/:path*",
    "/api/company-inquiries",
    "/api/company-inquiries/:path*",
    "/api/leads",
    "/api/leads/:path*",
    "/api/search-logs",
    "/api/search-logs/:path*",
  ],
};