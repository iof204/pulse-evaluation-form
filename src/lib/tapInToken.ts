import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 90;

type TapInPayload = {
  email: string;
  firstName?: string;
  businessName?: string;
  industry?: string;
  expiresAt: number;
};

function tokenSecret() {
  const secret = process.env.TAP_IN_TOKEN_SECRET || process.env.SITE_ACCESS_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") return "ecko-local-tap-in-preview";
  throw new Error("TAP_IN_TOKEN_SECRET is not configured.");
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function sign(encodedPayload: string) {
  return createHmac("sha256", tokenSecret()).update(encodedPayload).digest("base64url");
}

export function createTapInToken(
  email: string,
  firstName?: string,
  businessName?: string,
  industry?: string,
) {
  const payload: TapInPayload = {
    email: email.trim().toLowerCase(),
    firstName: firstName?.trim() || undefined,
    businessName: businessName?.trim() || undefined,
    industry: industry?.trim() || undefined,
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyTapInToken(token: string): TapInPayload | null {
  try {
    const [encodedPayload, signature, extra] = token.split(".");
    if (!encodedPayload || !signature || extra) return null;

    const expected = Buffer.from(sign(encodedPayload));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as TapInPayload;

    if (!/^\S+@\S+\.\S+$/.test(payload.email)) return null;
    if (!Number.isFinite(payload.expiresAt) || payload.expiresAt < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
