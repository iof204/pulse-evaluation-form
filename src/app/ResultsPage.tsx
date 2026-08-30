"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { evaluationQuestions } from "./questionnaireData";
import {
  perspectiveCopy,
  resultSections,
  type ResultLevel,
  type ResultSectionDefinition,
} from "./resultsData";
import { sectionIconClasses } from "../lib/sectionIcons";

const sectionIcons = sectionIconClasses;

type Responses = Record<number, string[]>;
type EvaluatedSection = ResultSectionDefinition & {
  score: number;
  level: ResultLevel;
};

function scoreForQuestion(questionId: number, responses: Responses) {
  const question = evaluationQuestions.find(({ id }) => id === questionId);
  const answerId = responses[questionId]?.[0];
  return question?.answers.find(({ id }) => id === answerId)?.score ?? 0;
}

function evaluateSections(responses: Responses): EvaluatedSection[] {
  return resultSections.map((section) => {
    const score = section.questionIds.reduce(
      (total, questionId) => total + scoreForQuestion(questionId, responses),
      0,
    );
    const level: ResultLevel =
      score >= 7 ? "strong" : score >= 5 ? "building" : "needs-love";
    return { ...section, score, level };
  });
}

function shareResults(
  platform: "facebook" | "x" | "linkedin" | "email",
  summary: string,
) {
  const shareUrl = new URL(window.location.href);
  shareUrl.search = "";
  const url = encodeURIComponent(shareUrl.toString());
  const text = encodeURIComponent(summary);
  const destinations = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
    x: `https://x.com/intent/post?url=${url}&text=${text}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    email: `mailto:?subject=${encodeURIComponent("Take the Ecko Marketing Pulse Evaluation")}&body=${text}%0A%0A${url}`,
  };

  if (platform === "email") {
    window.location.href = destinations.email;
    return;
  }

  window.open(destinations[platform], "_blank", "noopener,noreferrer,width=720,height=640");
}

function getPerspective(counts: Record<ResultLevel, number>) {
  if (counts.strong === 7) return perspectiveCopy["all-strong"];
  if (counts.strong >= 5 && counts["needs-love"] === 0)
    return perspectiveCopy["strong-overall"];
  if (counts.strong >= 4 && counts["needs-love"] <= 2)
    return perspectiveCopy["strong-with-gaps"];
  if (counts.building >= 4 && counts["needs-love"] <= 2)
    return perspectiveCopy.building;
  if (counts["needs-love"] >= 4)
    return perspectiveCopy["several-needs-love"];
  return perspectiveCopy.mixed;
}

function TargetDartIcon() {
  return (
    <svg
      className="results-target-dart-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <path
        d="M17.4 6.6L12.3 11.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12.3 11.1L10.8 12.6L12.3 11.1L13.4 10.2Z" fill="currentColor" />
      <path d="M17.4 6.6L18.6 5.2L16.9 5.9Z" fill="currentColor" />
    </svg>
  );
}

function CompactResultSection({ section }: { section: EvaluatedSection }) {
  const snapshot = section.snapshots[section.level];

  return (
    <article className="results-section results-section--with-icon">
      <span className="results-section-title__icon" aria-hidden="true">
        <i className={`fas ${sectionIcons[section.key]}`} />
      </span>
      <div className="results-section__body">
        <h4>{section.name}</h4>
        <p>{section.reminder}</p>
        <strong>What we&apos;re seeing</strong>
        <p>{snapshot.seeing}</p>
        <strong>Why it matters</strong>
        <p>{snapshot.matters}</p>
      </div>
    </article>
  );
}

function Insight({ section }: { section: EvaluatedSection }) {
  const snapshot = section.snapshots[section.level];
  return (
    <article className="results-insight">
      <header>
        <div>
          <h3>{section.name}</h3>
          <p>{section.reminder}</p>
        </div>
        <span>{snapshot.label}</span>
      </header>
      <div className="results-insight__copy">
        <div>
          <h4>What we&apos;re seeing</h4>
          <p>{snapshot.seeing}</p>
        </div>
        <div>
          <h4>Why it matters</h4>
          <p>{snapshot.matters}</p>
        </div>
      </div>
    </article>
  );
}

function PulseGlanceCard({ counts }: { counts: Record<ResultLevel, number> }) {
  return (
    <section className="results-glance" aria-labelledby="glance-title">
      <div className="results-expanded-card results-glance-card">
        <h2 id="glance-title">Marketing Pulse at a Glance</h2>
        <div className="results-glance-card__grid">
          <article className="results-glance-card__item results-glance-card__item--strong">
            <span className="results-glance-card__icon" aria-hidden="true">
              <i className="fas fa-trophy" />
            </span>
            <div>
              <strong>{counts.strong}</strong>
              <h3>Strong Foundation</h3>
              <p>Solid strengths to build on.</p>
            </div>
          </article>
          <article className="results-glance-card__item results-glance-card__item--building">
            <span className="results-glance-card__icon" aria-hidden="true">
              <i className="fas fa-arrow-trend-up" />
            </span>
            <div>
              <strong>{counts.building}</strong>
              <h3>Building Momentum</h3>
              <p>Progress with room to grow.</p>
            </div>
          </article>
          <article className="results-glance-card__item results-glance-card__item--needs-love">
            <span className="results-glance-card__icon" aria-hidden="true">
              <i className="far fa-heart" />
            </span>
            <div>
              <strong>{counts["needs-love"]}</strong>
              <h3>Needs a Little Love</h3>
              <p>Areas where focused support can help.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default function ResultsPage({
  responses,
  compact = false,
}: {
  responses: Responses;
  onRestart: () => void;
  compact?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copiedEvaluationLink, setCopiedEvaluationLink] = useState(false);
  const [showSocialMenu, setShowSocialMenu] = useState(false);
  const [showFullResultsModal, setShowFullResultsModal] = useState(false);
  const [fullResultsModalView, setFullResultsModalView] = useState<"form" | "confirmation">("form");
  const socialMenuRef = useRef<HTMLDivElement>(null);

  async function submitFullResults(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    const data = new FormData(event.currentTarget);
    const value = (...names: string[]) => {
      for (const name of names) {
        const field = data.get(name);
        if (typeof field === "string" && field) return field;
      }
      return "";
    };

    try {
      const response = await fetch("/api/results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: value("firstName", "modalFirstName"),
          email: value("email", "modalEmail"),
          businessName: value("businessName", "modalBusinessName"),
          industry: value("industry", "modalIndustry"),
          marketingConsent:
            data.has("marketingConsent") || data.has("modalMarketingConsent"),
          hardestChallenge: value("hardestChallenge", "modalHardestChallenge"),
          responses,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to send results.");
      setSubmitted(true);
      setFullResultsModalView("confirmation");
      setShowFullResultsModal(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to send results.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!showSocialMenu) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!socialMenuRef.current?.contains(event.target as Node)) {
        setShowSocialMenu(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowSocialMenu(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showSocialMenu]);

  useEffect(() => {
    if (!showFullResultsModal) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowFullResultsModal(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showFullResultsModal]);
  const evaluated = evaluateSections(responses);
  const counts = evaluated.reduce<Record<ResultLevel, number>>(
    (total, section) => ({
      ...total,
      [section.level]: total[section.level] + 1,
    }),
    { strong: 0, building: 0, "needs-love": 0 },
  );

  if (compact) {
    const categories: Array<{
      level: ResultLevel;
      cardClass: string;
      label: string;
      summary: string;
      badge: string;
      headerIcon: string;
      gatedClass: string;
      ctaClass: string;
      badgeClass: string;
      emptyMessage: string;
    }> = [
      {
        level: "strong",
        cardClass: "results-expanded-card--clicking",
        label: "What's Clicking",
        summary: "Top strengths you're doing well",
        badge: "Strong Foundation",
        headerIcon: "fa-thumbs-up",
        gatedClass: "results-gated-preview--clicking",
        ctaClass: "results-gated-preview__cta--clicking",
        badgeClass: "results-full-results-cta--clicking",
        emptyMessage: "No areas landed here this time.",
      },
      {
        level: "needs-love",
        cardClass: "results-expanded-card--focus",
        label: "Where to Focus Next",
        summary: "Top areas for improvement",
        badge: "Needs a Little Love",
        headerIcon: "target-dart",
        gatedClass: "results-gated-preview--focus",
        ctaClass: "results-gated-preview__cta--focus",
        badgeClass: "results-full-results-cta--focus",
        emptyMessage:
          "Nothing here is waving a red flag, but these areas may have the most room to become clearer, more intentional, or easier to manage.",
      },
    ];
    const evaluationShareCopy =
      "Take the Ecko Marketing Pulse Evaluation—a quick check-in to see what's working, what's building momentum, and what could use a little love.";
    const openFullResultsModal = () => {
      setFullResultsModalView("form");
      setSubmitError("");
      setShowFullResultsModal(true);
    };
    const copyEvaluationLink = async () => {
      const shareUrl = new URL(window.location.href);
      shareUrl.search = "";
      await navigator.clipboard.writeText(shareUrl.toString());
      setCopiedEvaluationLink(true);
      window.setTimeout(() => setCopiedEvaluationLink(false), 1800);
    };

    return (
      <main className="questionnaire-page results-page-minimal results-page-compact">
        <div className="results-content">
          <header className="results-header">
            <h1>
              <span className="results-header__gold">Good News:</span>
              <br />
              Your Marketing Has a Pulse!
            </h1>
          </header>

          <PulseGlanceCard counts={counts} />

          <section className="results-block" aria-label="Marketing results">
            <div className="results-expanded-cards">
              {categories.map(
                ({
                  level,
                  cardClass,
                  label,
                  summary,
                  badge,
                  headerIcon,
                  gatedClass,
                  ctaClass,
                  badgeClass,
                  emptyMessage,
                }) => {
                const sections = evaluated.filter((section) => section.level === level);

                return (
                  <section className={`results-expanded-card ${cardClass}`} key={level}>
                    <header>
                      <div className="results-expanded-card__heading">
                        <span className="results-expanded-card__icon" aria-hidden="true">
                          {headerIcon === "target-dart" ? (
                            <TargetDartIcon />
                          ) : (
                            <i className={`fas ${headerIcon}`} />
                          )}
                        </span>
                        <div>
                          <h3>{label}</h3>
                          <p>{summary}</p>
                        </div>
                      </div>
                      <span className={`results-full-results-cta ${badgeClass}`}>
                        {badge}
                      </span>
                    </header>

                    <div className="results-category-details results-expanded-card__details">
                      {sections[0] ? (
                        <CompactResultSection section={sections[0]} />
                      ) : (
                        <p className="results-category-details__empty">{emptyMessage}</p>
                      )}
                      {sections[1] && <CompactResultSection section={sections[1]} />}
                      <div className={`results-gated-preview ${gatedClass}`}>
                        <div className="results-gated-preview__content" aria-hidden="true">
                          {sections.length > 2 ? (
                            sections.slice(2).map((section) => {
                              const snapshot = section.snapshots[section.level];
                              return (
                                <article key={section.key}>
                                  <h4>{section.name}</h4>
                                  <p>{section.reminder}</p>
                                  <strong>What we&apos;re seeing</strong>
                                  <p>{snapshot.seeing}</p>
                                </article>
                              );
                            })
                          ) : (
                            <article className="results-gated-preview__placeholder">
                              <h4>Your Complete Marketing Pulse</h4>
                              <p>A closer look at every area of your evaluation.</p>
                              <strong>What we&apos;re seeing</strong>
                              <p>
                                Your full results include the context, patterns, and next
                                considerations behind your snapshot.
                              </p>
                            </article>
                          )}
                        </div>
                        <button
                          className={`results-full-results-cta results-gated-preview__cta ${ctaClass}`}
                          type="button"
                          onClick={openFullResultsModal}
                        >
                          View Detailed Results
                        </button>
                      </div>
                    </div>
                  </section>
                );
              })}
              <section
                className="results-expanded-card results-expanded-card--perspective"
                aria-labelledby="ecko-perspective-title"
              >
                <div className="results-category-details results-expanded-card__details">
                  <article className="results-section results-section--with-icon">
                    <span className="results-section-title__icon" aria-hidden="true">
                      <i className="fas fa-eye" />
                    </span>
                    <div className="results-section__body">
                      <h4 id="ecko-perspective-title">A Little Ecko Perspective</h4>
                      <p>
                        You have a solid foundation in several important areas, but there are a few
                        places where more clarity and consistency could make your marketing{" "}
                        <strong>work harder for the business.</strong>
                      </p>
                      <p>
                        The biggest opportunity right now is not necessarily doing more marketing —
                        it&apos;s making sure the pieces you already have are working together with
                        more intention.
                      </p>
                    </div>
                  </article>
                </div>
              </section>
              <section
                className="results-expanded-card results-expanded-card--reminder"
                aria-labelledby="ecko-reminder-title"
              >
                <div className="results-category-details results-expanded-card__details">
                  <article className="results-section results-section--with-icon">
                    <span className="results-section-title__icon" aria-hidden="true">
                      <i className="fas fa-star" />
                    </span>
                    <div className="results-section__body">
                      <h4 id="ecko-reminder-title">A Little Ecko Reminder</h4>
                      <div className="results-reminder-card__quote">
                        <span className="results-reminder-card__quote-mark" aria-hidden="true">
                          &ldquo;
                        </span>
                        <p>
                          Remember, marketing is not set it and forget it. It&apos;s always evolving.
                          Elevate what&apos;s working, adjust what isn&apos;t, and let the strongest
                          parts echo.
                        </p>
                      </div>
                    </div>
                  </article>
                  <p className="results-reminder-card__signoff">
                    <span>Evolve. Elevate. Then Echo.</span>
                  </p>
                </div>
              </section>
            </div>
          </section>

          <section id="compact-full-results" className="results-email-minimal" aria-labelledby="compact-email-title">
            <div className="results-email-minimal__intro">
              <span className="results-email-minimal__icon" aria-hidden="true">
                <i className="fas fa-envelope" />
              </span>
              <div>
                <h2 id="compact-email-title">Want the Full Pulse Check?</h2>
                <p>
                  Your full Marketing Pulse breakdown goes beyond the snapshot and
                  walks through all seven areas—what your results may be telling
                  you, why they matter, and a few things worth thinking about as
                  you move forward.
                </p>
              </div>
            </div>
            <form onSubmit={submitFullResults}>
                <div className="results-form-grid">
                  <label>First Name<input name="firstName" autoComplete="given-name" required /></label>
                  <label>Email Address<input name="email" type="email" autoComplete="email" required /></label>
                  <label><span className="results-field-label">Business Name</span><input name="businessName" autoComplete="organization" /></label>
                  <label>Industry<select name="industry" defaultValue="" required><option value="" disabled>Select your industry</option><option>Professional Services</option><option>Retail or E-commerce</option><option>Hospitality or Food Service</option><option>Health or Wellness</option><option>Real Estate or Construction</option><option>Nonprofit or Community</option><option>Technology or B2B</option><option>Other</option></select></label>
                </div>
                <label className="results-check"><input type="checkbox" required /><span>By submitting this form, you&apos;re asking Ecko Mktg to email your detailed Marketing Pulse results and allowing us to use the information you provided to generate and deliver them. See our <a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span></label>
                <p className="results-email-minimal__note">Tap in to what&apos;s moving in marketing. We&apos;ll send occasional practical ideas, trends and shifts we&apos;re watching, things worth questioning, takeaways from Marketing Real Talk by Ecko, Ecko updates, and the occasional &ldquo;hey, this should probably be on your radar&rdquo; moment.</p>
                <label className="results-check"><input type="checkbox" name="marketingConsent" /><span>Yes, I&apos;d like to tap in to Ecko&apos;s Marketing Lens and receive occasional marketing emails from Ecko Mktg. I can unsubscribe anytime.</span></label>
                <button className="questionnaire__continue" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Email My Results"}</button>
                {submitError && <p className="results-email-minimal__error" role="alert">{submitError}</p>}
            </form>
            {submitted && (
              <p className="results-email-minimal__success" role="status">
                Your detailed results are on the way.
              </p>
            )}
          </section>

          <section className="results-strategy-minimal results-strategy-compact">
            <div className="results-strategy-compact__intro">
              <span className="results-strategy-compact__icon" aria-hidden="true">
                <i className="fas fa-calendar-days" />
              </span>
              <div>
                <h2>Want to Talk It Through Instead?</h2>
                <p>
                  Sometimes the hard part isn&apos;t seeing the gap—it&apos;s figuring out
                  where to start, how the pieces should work together, or how to
                  actually get it done while running a business. That&apos;s where Ecko
                  can be your marketing sidekick. Let&apos;s spark some ideas.
                </p>
              </div>
            </div>
            <a href="tel:+17023774261">Book A Strategy Spark Sesh</a>
          </section>

          <section className="results-referral-share" aria-labelledby="share-evaluation-title">
            <h2 id="share-evaluation-title">Pass the Pulse Along</h2>
            <p>
              Know someone who could use a clearer read on their marketing?
              Share the Marketing Pulse Evaluation and help them find their rhythm.
            </p>
            <div className="results-share" aria-label="Share the Marketing Pulse Evaluation">
              <button type="button" aria-label={copiedEvaluationLink ? "Evaluation link copied" : "Copy evaluation link"} onClick={copyEvaluationLink}><i className={`fas ${copiedEvaluationLink ? "fa-check" : "fa-link"}`} aria-hidden="true" /></button>
              <button type="button" aria-label="Share the evaluation by email" onClick={() => shareResults("email", evaluationShareCopy)}><i className="fas fa-envelope" aria-hidden="true" /></button>
              <div className="results-social-menu" ref={socialMenuRef}>
                <button
                  type="button"
                  aria-label="Show social sharing options"
                  aria-expanded={showSocialMenu}
                  aria-haspopup="menu"
                  onClick={() => setShowSocialMenu((visible) => !visible)}
                >
                  <i className="fas fa-share-nodes" aria-hidden="true" />
                </button>
                {showSocialMenu && (
                  <div className="results-social-menu__popover" role="menu" aria-label="Social networks">
                    <button type="button" role="menuitem" aria-label="Share the evaluation on Facebook" onClick={() => { shareResults("facebook", evaluationShareCopy); setShowSocialMenu(false); }}><i className="fab fa-facebook-f" aria-hidden="true" /></button>
                    <button type="button" role="menuitem" aria-label="Share the evaluation on X" onClick={() => { shareResults("x", evaluationShareCopy); setShowSocialMenu(false); }}><i className="fab fa-x-twitter" aria-hidden="true" /></button>
                    <button type="button" role="menuitem" aria-label="Share the evaluation on LinkedIn" onClick={() => { shareResults("linkedin", evaluationShareCopy); setShowSocialMenu(false); }}><i className="fab fa-linkedin-in" aria-hidden="true" /></button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <footer className="results-signoff-minimal results-signoff-compact">
            <strong>Your marketing has a pulse. Now let&apos;s help it get stronger.</strong>
            <p>Evolve. Elevate. Then Echo!</p>
          </footer>

        </div>

        {showFullResultsModal && createPortal(
          <div
            className="results-full-results-modal"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowFullResultsModal(false);
            }}
          >
            <section
              className="results-full-results-modal__dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="full-results-modal-title"
            >
              <button
                className="results-full-results-modal__close"
                type="button"
                aria-label="Close full evaluation form"
                onClick={() => setShowFullResultsModal(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
              <div className="results-full-results-modal__body">
                <div className="results-full-results-modal__content">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="results-full-results-modal__logo"
                    src="/images/ecko-marketing-logo.png"
                    alt="Ecko Marketing"
                  />
                  {fullResultsModalView === "confirmation" ? (
                    <div className="results-full-results-modal__confirmation" role="status">
                      <header>
                        <h2 id="full-results-modal-title">Your Full Evaluation Is on Its Way</h2>
                      </header>
                      <p>
                        Thank you! Check your inbox for your detailed Marketing Pulse
                        results and a closer look at what your answers may be telling you.
                        If you&apos;d like to talk through what comes next, book a Strategy
                        Spark Sesh and let&apos;s spark some ideas together.
                      </p>
                      <p className="results-reminder-card__signoff results-full-results-modal__signoff">
                        <span>Evolve. Elevate. Then Echo.</span>
                      </p>
                      <a
                        className="questionnaire__continue results-full-results-modal__confirmation-button"
                        href="tel:+17023774261"
                      >
                        Book A Strategy Spark Sesh
                      </a>
                    </div>
                  ) : (
                    <div className="results-full-results-modal__form-view">
                      <header>
                        <h2 id="full-results-modal-title">See Your Full Evaluation</h2>
                      </header>
                      <form onSubmit={submitFullResults}>
                        <div className="results-form-grid">
                          <label>First Name<input name="modalFirstName" autoComplete="given-name" required /></label>
                          <label>Email Address<input name="modalEmail" type="email" autoComplete="email" required /></label>
                          <label><span className="results-field-label">Business Name</span><input name="modalBusinessName" autoComplete="organization" /></label>
                          <label>Industry<select name="modalIndustry" defaultValue="" required><option value="" disabled>Select your industry</option><option>Professional Services</option><option>Retail or E-commerce</option><option>Hospitality or Food Service</option><option>Health or Wellness</option><option>Real Estate or Construction</option><option>Nonprofit or Community</option><option>Technology or B2B</option><option>Other</option></select></label>
                        </div>
                        <label className="results-check"><input type="checkbox" required /><span>By submitting this form, you&apos;re asking Ecko Mktg to email your detailed Marketing Pulse results and allowing us to use the information you provided to generate and deliver them. See our <a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span></label>
                        <label className="results-check"><input type="checkbox" name="modalMarketingConsent" /><span>Yes, I&apos;d like to tap in to Ecko&apos;s Marketing Lens and receive occasional marketing emails from Ecko Mktg. I can unsubscribe anytime.</span></label>
                        <button className="questionnaire__continue" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Email My Results"}</button>
                        {submitError && <p className="results-email-minimal__error" role="alert">{submitError}</p>}
                      </form>
                    </div>
                  )}
                </div>
                <figure className="results-full-results-modal__portrait">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/strategy-spark-portrait.webp"
                    alt="Ecko Marketing strategist"
                  />
                </figure>
              </div>
            </section>
          </div>
        , document.body)}
      </main>
    );
  }

  const clicking = evaluated.filter(({ level }) => level === "strong").slice(0, 2);
  const needsLove = evaluated.filter(({ level }) => level === "needs-love");
  const building = evaluated
    .filter(({ level }) => level === "building")
    .sort((a, b) => a.score - b.score);
  const focus = (needsLove.length ? needsLove : building).slice(0, 2);
  const allStrong = counts.strong === 7;
  const focusHeading = needsLove.length
    ? "Where to Focus Next"
    : "Opportunities to Build On";
  const focusIntro = needsLove.length
    ? "These areas may be creating more friction, extra work, or missed opportunity than the rest of your marketing."
    : "Nothing here is waving a red flag, but these areas may have the most room to become clearer, more intentional, or easier to manage.";

  return (
    <main className="questionnaire-page results-page-minimal">
      <div className="results-content">
        <header className="results-header">
          <p className="questionnaire__meta">Results</p>
          <h1>
            <span className="results-header__gold">Good News:</span>
            <br />
            Your Marketing Has a Pulse!
          </h1>
          <p>
            A quick look at what&apos;s clicking, where there may be room to grow,
            and what your results could mean for your marketing right now.
          </p>
          <small>
            Not a grade. Not a pass/fail. Just a clearer look at where your
            marketing stands today.
          </small>
        </header>

        <PulseGlanceCard counts={counts} />

        {clicking.length > 0 && (
          <section className="results-block" aria-labelledby="clicking-title">
            <h2 id="clicking-title">What&apos;s Clicking</h2>
            <div className="results-insights">
              {clicking.map((section) => <Insight key={section.key} section={section} />)}
            </div>
          </section>
        )}

        <section className="results-block" aria-labelledby="focus-title">
          <h2 id="focus-title">{allStrong ? "Keep the Momentum Going" : focusHeading}</h2>
          <p className="results-block__intro">
            {allStrong
              ? "Your results suggest that you have a strong foundation across the areas we reviewed. That doesn't mean your marketing is finished—it means you have solid pieces in place to keep refining as your business, customers, and goals evolve."
              : focusIntro}
          </p>
          {!allStrong && (
            <div className="results-insights">
              {focus.map((section) => <Insight key={section.key} section={section} />)}
            </div>
          )}
        </section>

        <section className="results-perspective-minimal" aria-labelledby="perspective-title">
          <p>A Little Ecko Perspective</p>
          <h2 id="perspective-title">What the bigger picture may be telling you</h2>
          <div>{getPerspective(counts)}</div>
        </section>

        <section className="results-email-minimal" aria-labelledby="full-results-title">
          <div>
            <h2 id="full-results-title">Want the Full Pulse Check?</h2>
            <p>
              Get your full breakdown across all seven areas—what your results
              may be telling you, why they matter, and what to think about next.
            </p>
          </div>
          <form onSubmit={submitFullResults}>
              <div className="results-form-grid">
                <label>First Name<input name="firstName" autoComplete="given-name" required /></label>
                <label>Email Address<input name="email" type="email" autoComplete="email" required /></label>
                <label><span className="results-field-label">Business Name</span><input name="businessName" autoComplete="organization" /></label>
                <label>Industry<select name="industry" defaultValue="" required><option value="" disabled>Select your industry</option><option>Professional Services</option><option>Retail or E-commerce</option><option>Hospitality or Food Service</option><option>Health or Wellness</option><option>Real Estate or Construction</option><option>Nonprofit or Community</option><option>Technology or B2B</option><option>Other</option></select></label>
              </div>
              <label className="results-check"><input type="checkbox" required /><span>By submitting this form, you&apos;re asking Ecko Mktg to email your detailed Marketing Pulse results and allowing us to use the information you provided to generate and deliver them. See our <a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span></label>
              <p className="results-email-minimal__note">Tap in to what&apos;s moving in marketing. We&apos;ll send occasional practical ideas, trends and shifts we&apos;re watching, things worth questioning, takeaways from Marketing Real Talk by Ecko, Ecko updates, and the occasional &ldquo;hey, this should probably be on your radar&rdquo; moment.</p>
              <label className="results-check"><input type="checkbox" name="marketingConsent" /><span>Yes, I&apos;d like to tap in to Ecko&apos;s Marketing Lens and receive occasional marketing emails from Ecko Mktg. I can unsubscribe anytime.</span></label>
              <button className="questionnaire__continue" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send Me My Detailed Results"}</button>
              {submitError && <p className="results-email-minimal__error" role="alert">{submitError}</p>}
          </form>
          {submitted && (
            <p className="results-email-minimal__success" role="status">
              Your detailed results are on the way.
            </p>
          )}
        </section>

        <section className="results-strategy-minimal">
          <h2>Know something needs attention, but not sure what to do next?</h2>
          <p>That&apos;s where Ecko can be your marketing sidekick.</p>
          <a href="tel:+17023774261">Book a Strategy Spark Sesh</a>
        </section>

        <footer className="results-signoff-minimal">
          <p>Your marketing has a pulse. Now let&apos;s help it get stronger.</p>
          <strong>Evolve. Elevate. Then Echo.</strong>
        </footer>
      </div>
    </main>
  );
}
