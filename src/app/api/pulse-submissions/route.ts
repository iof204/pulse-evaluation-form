import { NextResponse } from "next/server";
import { fetchPulseSubmissions } from "../../../lib/hubspotSubmissions";

export async function GET() {
  try {
    const submissions = await fetchPulseSubmissions();
    return NextResponse.json({
      submissions,
      summary: {
        total: submissions.length,
        consented: submissions.filter((item) => item.marketingConsent).length,
        noConsent: submissions.filter((item) => !item.marketingConsent).length,
        highIntent: submissions.filter((item) => item.strategyClicked).length,
      },
    });
  } catch (error) {
    console.error("Unable to load pulse submissions", error);
    return NextResponse.json(
      { error: "Unable to load Marketing Pulse submissions." },
      { status: 500 },
    );
  }
}
