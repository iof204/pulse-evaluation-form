import { DEFAULT_EVALUATION_URL } from "./resultsEmailTemplate";

export function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  try {
    return new URL(DEFAULT_EVALUATION_URL).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function buildTapInUrl(email?: string) {
  const url = new URL("/tap-in", getAppBaseUrl());
  if (email) url.searchParams.set("email", email);
  return url.toString();
}

export function buildStrategyClickUrl(email?: string) {
  const url = new URL("/api/strategy-click", getAppBaseUrl());
  if (email) url.searchParams.set("email", email);
  return url.toString();
}
