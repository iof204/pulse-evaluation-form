import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildStrategyClickUrl } from "../../../lib/appUrl";
import { recordMarketingLensOptIn } from "../../../lib/hubspotSync";
import { isMicrosoftGraphEmailConfigured, sendMicrosoftGraphEmail } from "../../../lib/microsoftGraphEmail";
import { verifyTapInToken } from "../../../lib/tapInToken";
import { buildTappedInEmailHtml, buildTappedInEmailText } from "../../../lib/tappedInEmailTemplate";

async function sendTappedInEmail(
  email: string,
  firstName?: string,
  businessName?: string,
  industry?: string,
) {
  if (!isMicrosoftGraphEmailConfigured()) {
    console.warn("Email delivery is not configured; skipping Tap In confirmation email.");
    return { skipped: true as const };
  }

  const strategyUrl = buildStrategyClickUrl(email);
  const [emailLogo, strategyPortrait] = await Promise.all([
    readFile(path.join(process.cwd(), "public/images/ecko-marketing-logo-white.png")),
    readFile(path.join(process.cwd(), "public/images/strategy-spark-email.webp")),
  ]);
  await sendMicrosoftGraphEmail({
    to: email,
    subject: "You’re Tapped In to Ecko’s Marketing Lens",
    text: buildTappedInEmailText(firstName, strategyUrl),
    html: buildTappedInEmailHtml({
      firstName,
      businessName,
      industry,
      strategyUrl,
      logoUrl: "cid:ecko-marketing-logo",
      strategyPortraitUrl: "cid:ecko-strategy-portrait",
    }),
    attachments: [
      { filename: "ecko-marketing-logo.png", content: emailLogo, contentType: "image/png", contentId: "ecko-marketing-logo" },
      { filename: "ecko-strategy-portrait.webp", content: strategyPortrait, contentType: "image/webp", contentId: "ecko-strategy-portrait" },
    ],
  });
  return { skipped: false as const };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      marketingConsent?: boolean;
    };

    if (!body.marketingConsent) {
      return NextResponse.json(
        { error: "Marketing consent is required to tap in." },
        { status: 400 },
      );
    }

    const payload = verifyTapInToken(body.token ?? "");
    if (!payload) {
      return NextResponse.json(
        { error: "This Tap In link is invalid or has expired. Please use the latest link in your Marketing Pulse email." },
        { status: 400 },
      );
    }

    const result = await recordMarketingLensOptIn({
      email: payload.email,
      firstName: payload.firstName,
    });

    try {
      await sendTappedInEmail(
        payload.email,
        payload.firstName,
        payload.businessName,
        payload.industry,
      );
    } catch (error) {
      console.error("Tap In confirmation email failed", error);
    }

    return NextResponse.json({ ok: true, hubspot: result });
  } catch (error) {
    console.error("Marketing Lens opt-in failed", error);
    return NextResponse.json(
      { error: "We couldn’t complete your opt-in. Please try again." },
      { status: 500 },
    );
  }
}
