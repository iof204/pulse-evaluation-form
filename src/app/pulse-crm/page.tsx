"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";

type Submission = {
  id: string;
  hubspotUrl: string;
  firstName: string;
  email: string;
  company: string;
  industry: string;
  businessType: string;
  businessStage: string;
  primaryGoal: string;
  perspective: string;
  priority1: string;
  priority2: string;
  marketingConsent: boolean;
  consentSource: string;
  hardestChallenge: string;
  strategyClicked: boolean;
  submittedAt: string;
  scores: Array<{ label: string; score: string; result: string }>;
};

type Summary = {
  total: number;
  consented: number;
  noConsent: number;
  highIntent: number;
};

const HUBSPOT_LIST_URL =
  "https://app.hubspot.com/contacts/244987820/objectLists/17/filters";
const HUBSPOT_LISTS_URL = "https://app.hubspot.com/contacts/244987820/lists";

export default function PulseCrmPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [consentFilter, setConsentFilter] = useState<"all" | "yes" | "no">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pulse-submissions")
      .then(async (response) => {
        const data = (await response.json()) as {
          submissions?: Submission[];
          summary?: Summary;
          error?: string;
        };
        if (!response.ok) throw new Error(data.error || "Unable to load submissions.");
        setSubmissions(data.submissions ?? []);
        setSummary(data.summary ?? null);
      })
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load submissions.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return submissions.filter((submission) => {
      if (consentFilter === "yes" && !submission.marketingConsent) return false;
      if (consentFilter === "no" && submission.marketingConsent) return false;
      if (!query.trim()) return true;
      const haystack = [
        submission.firstName,
        submission.email,
        submission.company,
        submission.industry,
        submission.perspective,
        submission.primaryGoal,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [consentFilter, query, submissions]);

  return (
    <main className="pulse-crm">
      <div className="pulse-crm__shell">
        <header className="pulse-crm__header">
          <div>
            <p className="pulse-crm__eyebrow">Marketing Pulse CRM</p>
            <h1>Form Submissions</h1>
            <p className="pulse-crm__lede">
              Everyone here submitted the detailed results form. Questionnaire
              answers, industry, scores, and consent status are shown below.
            </p>
          </div>
          <div className="pulse-crm__links">
            <a href={HUBSPOT_LIST_URL} target="_blank" rel="noreferrer">
              Open HubSpot list
            </a>
            <a href={HUBSPOT_LISTS_URL} target="_blank" rel="noreferrer">
              All Pulse lists
            </a>
            <Link href="/">Back to evaluation</Link>
          </div>
        </header>

        {summary && (
          <section className="pulse-crm__stats" aria-label="Submission summary">
            <article>
              <strong>{summary.total}</strong>
              <span>Total submissions</span>
            </article>
            <article>
              <strong>{summary.consented}</strong>
              <span>Marketing Lens opt-ins</span>
            </article>
            <article>
              <strong>{summary.noConsent}</strong>
              <span>Results only</span>
            </article>
            <article>
              <strong>{summary.highIntent}</strong>
              <span>Strategy Spark clicks</span>
            </article>
          </section>
        )}

        <section className="pulse-crm__toolbar">
          <input
            type="search"
            placeholder="Search name, email, industry, perspective…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <label>
            Consent
            <select
              value={consentFilter}
              onChange={(event) =>
                setConsentFilter(event.target.value as "all" | "yes" | "no")
              }
            >
              <option value="all">All</option>
              <option value="yes">Opted in</option>
              <option value="no">Results only</option>
            </select>
          </label>
        </section>

        {loading && <p className="pulse-crm__status">Loading submissions…</p>}
        {error && (
          <p className="pulse-crm__error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="pulse-crm__status">No form submissions yet.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="pulse-crm__table-wrap">
            <table className="pulse-crm__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Industry</th>
                  <th>Perspective</th>
                  <th>Consent</th>
                  <th>Submitted</th>
                  <th>Details</th>
                  <th>HubSpot</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((submission) => {
                  const expanded = expandedId === submission.id;
                  return (
                    <Fragment key={submission.id}>
                      <tr>
                        <td>{submission.firstName}</td>
                        <td>{submission.email}</td>
                        <td>{submission.industry}</td>
                        <td>{submission.perspective}</td>
                        <td>
                          <span
                            className={
                              submission.marketingConsent
                                ? "pulse-crm__pill pulse-crm__pill--yes"
                                : "pulse-crm__pill pulse-crm__pill--no"
                            }
                          >
                            {submission.marketingConsent ? "Opted in" : "Results only"}
                          </span>
                        </td>
                        <td>{submission.submittedAt}</td>
                        <td>
                          <button
                            type="button"
                            className="pulse-crm__expand"
                            onClick={() =>
                              setExpandedId(expanded ? null : submission.id)
                            }
                          >
                            {expanded ? "Hide" : "View"}
                          </button>
                        </td>
                        <td>
                          <a
                            href={submission.hubspotUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="pulse-crm__details-row">
                          <td colSpan={8}>
                            <div className="pulse-crm__details">
                              <div>
                                <h3>Business context</h3>
                                <dl>
                                  <div><dt>Company</dt><dd>{submission.company}</dd></div>
                                  <div><dt>Business type</dt><dd>{submission.businessType}</dd></div>
                                  <div><dt>Business stage</dt><dd>{submission.businessStage}</dd></div>
                                  <div><dt>Primary goal</dt><dd>{submission.primaryGoal}</dd></div>
                                  <div><dt>Priority areas</dt><dd>{submission.priority1}, {submission.priority2}</dd></div>
                                  <div><dt>Consent source</dt><dd>{submission.consentSource}</dd></div>
                                  <div><dt>Strategy click</dt><dd>{submission.strategyClicked ? "Yes" : "No"}</dd></div>
                                </dl>
                              </div>
                              <div>
                                <h3>Section scores</h3>
                                <div className="pulse-crm__scores">
                                  {submission.scores.map((score) => (
                                    <div key={score.label} className="pulse-crm__score-card">
                                      <strong>{score.label}</strong>
                                      <span>{score.score}</span>
                                      <em>{score.result}</em>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {submission.hardestChallenge !== "—" && (
                                <div className="pulse-crm__challenge">
                                  <h3>Hardest challenge</h3>
                                  <p>{submission.hardestChallenge}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
