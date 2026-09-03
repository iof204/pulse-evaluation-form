import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildStrategyClickUrl, buildTapInUrl } from "../../../lib/appUrl";
import { evaluateSections } from "../../../lib/evaluateResults";
import { syncMarketingPulseContactToHubSpot } from "../../../lib/hubspotSync";
import { buildResultsEmailHtml, buildResultsEmailText } from "../../../lib/resultsEmailTemplate";

type Responses = Record<number, string[]>;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      firstName?: string;
      email?: string;
      businessName?: string;
      industry?: string;
      marketingConsent?: boolean;
      hardestChallenge?: string;
      responses?: Responses;
    };
    const firstName = body.firstName?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const businessName = body.businessName?.trim() ?? "";
    const industry = body.industry?.trim() ?? "";
    const marketingConsent = Boolean(body.marketingConsent);
    const hardestChallenge = body.hardestChallenge?.trim() ?? "";
    const responses = body.responses ?? {};
    if (!firstName || !industry || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const sender = process.env.GMAIL_SMTP_USER;
    const password = process.env.GMAIL_SMTP_APP_PASSWORD;
    if (!sender || !password) {
      return NextResponse.json({ error: "Email delivery is not configured." }, { status: 500 });
    }

    const evaluated = evaluateSections(responses);
    const emailContent = {
      firstName,
      businessName,
      industry,
      evaluated,
      responses,
      marketingConsent,
      tapInUrl: buildTapInUrl(email, firstName, businessName, industry),
      strategyUrl: buildStrategyClickUrl(email),
    };
    const [emailLogo, strategyPortrait] = await Promise.all([
      readFile(path.join(process.cwd(), "public/images/ecko-marketing-logo-white.png")),
      readFile(path.join(process.cwd(), "public/images/strategy-spark-email.webp")),
    ]);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: sender, pass: password },
    });
    await transporter.sendMail({
      from: `Ecko Marketing Pulse <${sender}>`,
      to: email,
      replyTo: sender,
      subject: "Your Full Marketing Pulse Evaluation",
      text: buildResultsEmailText(emailContent),
      html: buildResultsEmailHtml({
        ...emailContent,
        logoUrl: "cid:ecko-marketing-logo",
        strategyPortraitUrl: "cid:ecko-strategy-portrait",
      }),
      attachments: [
        {
          filename: "ecko-marketing-logo.png",
          content: emailLogo,
          contentType: "image/png",
          cid: "ecko-marketing-logo",
        },
        {
          filename: "ecko-strategy-portrait.webp",
          content: strategyPortrait,
          contentType: "image/webp",
          cid: "ecko-strategy-portrait",
        },
      ],
      headers: { "X-Ecko-Marketing-Consent": marketingConsent ? "yes" : "no" },
    });

    try {
      await syncMarketingPulseContactToHubSpot({
        firstName,
        email,
        businessName,
        industry,
        marketingConsent,
        hardestChallenge: hardestChallenge || undefined,
        responses,
        evaluated,
      });
    } catch (error) {
      console.error("HubSpot Marketing Pulse sync failed", error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to send Marketing Pulse results", error);
    return NextResponse.json({ error: "We couldn’t email your results. Please try again." }, { status: 500 });
  }
}
