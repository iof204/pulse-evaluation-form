"use client";

import { useState } from "react";
import { evaluationQuestions } from "./questionnaireData";
import {
  perspectiveCopy,
  resultSections,
  type ResultLevel,
  type ResultSectionDefinition,
} from "./resultsData";

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

export default function ResultsPage({
  responses,
}: {
  responses: Responses;
  onRestart: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const evaluated = evaluateSections(responses);
  const counts = evaluated.reduce<Record<ResultLevel, number>>(
    (total, section) => ({
      ...total,
      [section.level]: total[section.level] + 1,
    }),
    { strong: 0, building: 0, "needs-love": 0 },
  );
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
          <h1>Good News: Your Marketing Has a Pulse</h1>
          <p>
            A quick look at what&apos;s clicking, where there may be room to grow,
            and what your results could mean for your marketing right now.
          </p>
          <small>
            Not a grade. Not a pass/fail. Just a clearer look at where your
            marketing stands today.
          </small>
        </header>

        <section className="results-block" aria-labelledby="glance-title">
          <h2 id="glance-title">Marketing Pulse at a Glance</h2>
          <div className="results-distribution">
            <div><strong>{counts.strong}</strong><span>Strong Foundation</span></div>
            <div><strong>{counts.building}</strong><span>Building Momentum</span></div>
            <div><strong>{counts["needs-love"]}</strong><span>Needs a Little Love</span></div>
          </div>
        </section>

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
          {submitted ? (
            <p className="results-email-minimal__success" role="status">
              Your detailed results are on the way.
            </p>
          ) : (
            <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
              <div className="results-form-grid">
                <label>First Name<input name="firstName" autoComplete="given-name" required /></label>
                <label>Email Address<input name="email" type="email" autoComplete="email" required /></label>
                <label>Business Name <span>Optional</span><input name="businessName" autoComplete="organization" /></label>
                <label>Industry<select name="industry" defaultValue="" required><option value="" disabled>Select your industry</option><option>Professional Services</option><option>Retail or E-commerce</option><option>Hospitality or Food Service</option><option>Health or Wellness</option><option>Real Estate or Construction</option><option>Nonprofit or Community</option><option>Technology or B2B</option><option>Other</option></select></label>
              </div>
              <label className="results-check"><input type="checkbox" required /><span>By submitting, you agree to receive your requested results and acknowledge our <a href="/privacy-policy">Privacy Policy</a>.</span></label>
              <label className="results-check"><input type="checkbox" name="marketingConsent" /><span>Yes, I&apos;d also like occasional practical marketing tips, resources, and Ecko updates.</span></label>
              <p className="results-email-minimal__note">We&apos;ll use your email to send the results you requested. No surprise newsletter signup.</p>
              <button className="questionnaire__continue" type="submit">Send Me My Detailed Results</button>
            </form>
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
