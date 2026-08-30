"use client";

import { useState } from "react";

export default function AccessPage() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");
    const response = await fetch("/api/site-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error || "Unable to open the evaluation.");
      setSubmitting(false);
      return;
    }
    const destination = new URLSearchParams(window.location.search).get("next");
    window.location.href = destination?.startsWith("/") ? destination : "/v2";
  }

  return (
    <main className="site-access">
      <section className="site-access__card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="site-access__logo"
          src="/images/ecko-marketing-logo.png"
          alt="Ecko Marketing"
        />
        <h1>Let&apos;s check your pulse.</h1>
        <form onSubmit={submit}>
          <label className="site-access__sr-only" htmlFor="site-password">Password</label>
          <input id="site-password" name="password" type="password" placeholder="Password" autoComplete="current-password" autoFocus required />
          {error && <p className="site-access__error" role="alert">{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? "Opening…" : "Enter Password"}</button>
        </form>
        <p className="site-access__signoff">Evolve. Elevate. Then Echo!</p>
      </section>
    </main>
  );
}
