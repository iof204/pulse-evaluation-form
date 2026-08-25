import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
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
      marketingConsent,
      tapInUrl: buildTapInUrl(email),
      strategyUrl: buildStrategyClickUrl(email),
    };

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
      html: buildResultsEmailHtml(emailContent),
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
