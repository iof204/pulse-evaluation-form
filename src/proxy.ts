import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, createAccessToken } from "./lib/siteAccess";

function secure(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  response.headers.set("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  const secret = process.env.SITE_ACCESS_SECRET;
  if (!password || !secret) return secure(NextResponse.next());

  const { pathname } = request.nextUrl;
  if (
    pathname === "/access" ||
    pathname === "/api/site-access" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/videos/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico"
  ) {
    const response = NextResponse.next();
    if (pathname === "/access" || pathname === "/api/site-access") {
      response.headers.set("Cache-Control", "no-store, max-age=0");
    }
    return secure(response);
  }

  const expectedToken = await createAccessToken(password, secret);
  if (request.cookies.get(ACCESS_COOKIE)?.value === expectedToken) {
    return secure(NextResponse.next());
  }

  const accessUrl = request.nextUrl.clone();
  accessUrl.pathname = "/access";
  accessUrl.search = "";
  accessUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return secure(NextResponse.redirect(accessUrl));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
