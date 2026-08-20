import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { ACCESS_COOKIE, createAccessToken } from "../../../lib/siteAccess";

const attempts = new Map<string, { count: number; resetAt: number }>();
const ATTEMPT_WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function passwordsMatch(candidate: string, expected: string) {
  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  return candidateBytes.length === expectedBytes.length && timingSafeEqual(candidateBytes, expectedBytes);
}

export async function POST(request: Request) {
  const configuredPassword = process.env.SITE_PASSWORD;
  const accessSecret = process.env.SITE_ACCESS_SECRET;
  if (!configuredPassword || !accessSecret) {
    return NextResponse.json({ error: "Site access is not configured." }, { status: 404 });
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== requestUrl.origin) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientId = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const current = attempts.get(clientId);
  const attempt = !current || current.resetAt <= now ? { count: 0, resetAt: now + ATTEMPT_WINDOW } : current;
  if (attempt.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((attempt.resetAt - now) / 1000)) } },
    );
  }

  const body = (await request.json()) as { password?: string };
  if (!passwordsMatch(body.password ?? "", configuredPassword)) {
    attempt.count += 1;
    attempts.set(clientId, attempt);
    return NextResponse.json({ error: "That password isn’t quite right." }, { status: 401 });
  }

  attempts.delete(clientId);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, await createAccessToken(configuredPassword, accessSecret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
