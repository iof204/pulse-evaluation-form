"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function TapInConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/marketing-lens-opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, marketingConsent: true }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to complete opt-in.");
      router.push("/tapped-in");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to complete opt-in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="tap-in-confirmation">
      <section className="tap-in-confirmation__dialog">
        <div className="tap-in-confirmation__content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="tap-in-confirmation__logo" src="/images/ecko-marketing-logo.png" alt="Ecko Marketing" />
          <div className="tap-in-confirmation__copy">
            <h1>Want to stay tapped in?</h1>
            <p>
              Confirm below to receive occasional ideas, trends, Marketing Real Talk
              takeaways, and updates from Ecko&apos;s Marketing Lens.
            </p>
            {!token ? (
              <p className="tap-in-confirmation__error" role="alert">
                This Tap In link is missing or invalid. Please use the link in your Marketing Pulse email.
              </p>
            ) : (
              <>
                <button type="button" onClick={confirm} disabled={submitting}>
                  {submitting ? "Tapping in…" : "Confirm Tap In"}
                </button>
                <p className="tap-in-confirmation__consent">
                  By confirming, you agree to receive occasional marketing emails from Ecko Mktg. You can unsubscribe anytime.
                </p>
              </>
            )}
            {error && <p className="tap-in-confirmation__error" role="alert">{error}</p>}
            <p className="tap-in-confirmation__privacy"><Link href="/privacy-policy">Privacy Policy</Link></p>
          </div>
        </div>
        <figure className="tap-in-confirmation__portrait">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/strategy-spark-portrait.webp" alt="Ecko Marketing strategist" />
        </figure>
      </section>
    </main>
  );
}

export default function TapInPage() {
  return <Suspense fallback={<main className="site-access" />}><TapInConfirmation /></Suspense>;
}
