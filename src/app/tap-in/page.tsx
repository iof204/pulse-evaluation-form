"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function TapInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [firstName, setFirstName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/marketing-lens-opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          marketingConsent: true,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to complete opt-in.");
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to complete opt-in.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="site-access">
      <section className="site-access__card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="site-access__logo"
          src="https://d14tal8bchn59o.cloudfront.net/tT8kTKStgAOAqD3CF-vqwSdDxRBYUlCtZatT91hBmrM/w:1920/plain/https%3A%2F%2F02f0a56ef46d93f03c90-22ac5f107621879d5667e0d7ed595bdb.ssl.cf2.rackcdn.com%2Fsites%2F127849%2Fphotos%2F24248554%2FEK_Ecko_Logo_%2528Page_1%2529_original.png"
          alt="Ecko Marketing"
        />
        <h1>Want to stay tapped in?</h1>
        <p style={{ margin: "0 0 18px", color: "#544b5a", fontSize: "15px", lineHeight: 1.65 }}>
          Tap in to what&apos;s moving in marketing — from practical ideas and trends
          we&apos;re watching to takeaways from Marketing Real Talk by Ecko, Ecko
          updates, things worth questioning, and the occasional thing we think
          deserves a spot on your radar.
        </p>

        {submitted ? (
          <p style={{ margin: 0, color: "#33185c", fontSize: "15px", lineHeight: 1.65 }}>
            You&apos;re tapped in. Watch for occasional emails from Ecko&apos;s Marketing Lens.
          </p>
        ) : (
          <form onSubmit={submit}>
            <label className="site-access__sr-only" htmlFor="tap-in-first-name">
              First name
            </label>
            <input
              id="tap-in-first-name"
              name="firstName"
              type="text"
              placeholder="First name (optional)"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <label className="site-access__sr-only" htmlFor="tap-in-email">
              Email address
            </label>
            <input
              id="tap-in-email"
              name="email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                margin: "14px 0 0",
                color: "#544b5a",
                fontSize: "14px",
                lineHeight: 1.55,
                textAlign: "left",
              }}
            >
              <input type="checkbox" required style={{ marginTop: "4px" }} />
              <span>
                Yes, I&apos;d like to tap in to Ecko&apos;s Marketing Lens and receive
                occasional marketing emails from Ecko Mktg. I can unsubscribe anytime.
              </span>
            </label>
            {error && <p className="site-access__error" role="alert">{error}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? "Tapping in…" : "Tap In"}
            </button>
          </form>
        )}

        <p className="site-access__signoff">
          <Link href="/privacy-policy">Privacy Policy</Link>
        </p>
      </section>
    </main>
  );
}

export default function TapInPage() {
  return (
    <Suspense fallback={<main className="site-access" />}>
      <TapInForm />
    </Suspense>
  );
}
