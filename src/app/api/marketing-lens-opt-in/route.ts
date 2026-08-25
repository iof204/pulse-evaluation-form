import { NextResponse } from "next/server";
import { recordMarketingLensOptIn } from "../../../lib/hubspotSync";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      firstName?: string;
      marketingConsent?: boolean;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    const firstName = body.firstName?.trim() ?? "";

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!body.marketingConsent) {
      return NextResponse.json(
        { error: "Marketing consent is required to tap in." },
        { status: 400 },
      );
    }

    const result = await recordMarketingLensOptIn({
      email,
      firstName: firstName || undefined,
    });

    return NextResponse.json({ ok: true, hubspot: result });
  } catch (error) {
    console.error("Marketing Lens opt-in failed", error);
    return NextResponse.json(
      { error: "We couldn’t complete your opt-in. Please try again." },
      { status: 500 },
    );
  }
}
