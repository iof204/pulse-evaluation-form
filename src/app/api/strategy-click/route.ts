import { NextResponse } from "next/server";
import { recordStrategySparkSeshClick } from "../../../lib/hubspotSync";

const STRATEGY_PHONE_URL = "tel:+17023774261";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (email && /^\S+@\S+\.\S+$/.test(email)) {
    try {
      await recordStrategySparkSeshClick(email);
    } catch (error) {
      console.error("Strategy Spark Sesh click tracking failed", error);
    }
  }

  return NextResponse.redirect(STRATEGY_PHONE_URL);
}
