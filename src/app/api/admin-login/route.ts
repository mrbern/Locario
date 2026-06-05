import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE_NAME,
  getAdminPassword,
  getAdminSessionToken,
  isAdminLoginConfigured,
} from "@/lib/admin-auth";

type AdminLoginRequestBody = {
  password?: string;
};

export async function POST(request: Request) {
  if (!isAdminLoginConfigured()) {
    return NextResponse.json(
      {
        message:
          "Admin-Login ist noch nicht konfiguriert. Bitte ADMIN_PASSWORD und ADMIN_SESSION_TOKEN in .env setzen.",
      },
      {
        status: 500,
      }
    );
  }

  const body = (await request.json()) as AdminLoginRequestBody;
  const password = body.password ?? "";

  if (password !== getAdminPassword()) {
    return NextResponse.json(
      {
        message: "Falsches Admin-Passwort.",
      },
      {
        status: 401,
      }
    );
  }

  const response = NextResponse.json({
    message: "Admin erfolgreich eingeloggt.",
  });

  response.cookies.set({
    name: ADMIN_AUTH_COOKIE_NAME,
    value: getAdminSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}