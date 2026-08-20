import { NextResponse } from "next/server";

const ACCESS_COOKIE = "ecko_pulse_access";

async function accessToken(password: string) {
  const bytes = new TextEncoder().encode(`ecko-marketing-pulse:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function POST(request: Request) {
  const configuredPassword = process.env.SITE_PASSWORD;
  if (!configuredPassword) {
    return NextResponse.json({ error: "Site access is not configured." }, { status: 404 });
  }

  const body = (await request.json()) as { password?: string };
  if (body.password !== configuredPassword) {
    return NextResponse.json({ error: "That password isn’t quite right." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, await accessToken(configuredPassword), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
