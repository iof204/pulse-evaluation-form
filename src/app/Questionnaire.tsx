"use client";

import { useEffect, useRef, useState } from "react";
import QuestionCard from "./QuestionCard";
import ResultsPage from "./ResultsPage";
import {
  evaluationQuestions,
  type AnswerOption,
} from "./questionnaireData";

type TransitionPhase = "idle" | "exiting" | "entering";
type Responses = Record<number, string[]>;
type SectionIntro = { title: string; description: string };

const sectionIntros: Record<number, SectionIntro> = {
  1: {
    title: "Section, Goals",
    description: "These first three questions are not scored. They help make the results more relevant to your business, goals, and current stage.",
  },
  2: {
    title: "Section 1, Brand",
    description: "Let’s look at whether the heart of your brand stays clear and recognizable, even when the format, campaign, or channel changes.",
  },
  3: {
    title: "Section 2, Audience",
    description: "This section looks at whether your marketing is shaped by the people you want to reach—not just what the business wants to say.",
  },
  4: {
    title: "Section 3, Purpose",
    description: "Marketing gets easier to measure when everyone knows what it is supposed to accomplish.",
  },
  5: {
    title: "Section 4, Journey",
    description: "Now let’s look at how people move from discovering your business to understanding it, trusting it, and taking action.",
  },
  6: {
    title: "Section 5, Visibility",
    description: "This is not about being everywhere. It is about whether your campaigns, promotions, content, partnerships, and visibility efforts are planned with purpose.",
  },
  7: {
    title: "Section 6, Mix",
    description: "These questions look at whether digital, traditional, community, sponsorship, partnership, and in-person efforts support one shared strategy—and whether you can learn from the results.",
  },
  8: {
    title: "Section 7, Retention",
    description: "Getting attention is only part of the job. This section looks at how your business follows through with interested customers—and how you stay connected after they buy, book, visit, or work with you.",
  },
};

const questionDetailContext: Record<number, string> = {
  2: "This describes the basic operating model of the business—what it delivers, how customers receive it, and how revenue is generally created.",
  3: "This describes the business’s current stage and the kind of change or momentum shaping its marketing needs right now.",
  4: "In this question, the answer reflects how consistently a customer would understand the same core value across different marketing touchpoints.",
  5: "Here, the answer describes how recognizable the business would feel when different marketing pieces are viewed together.",
  6: "For this question, the answer shows how specifically the business has defined the people its marketing is primarily meant to reach.",
  7: "Here, the answer describes the information the business most often relies on when deciding what to say, offer, or publish.",
  8: "For this question, the answer reflects how clearly current marketing activity is organized around a specific business outcome.",
  9: "Here, the answer describes how deliberately each message is connected to a purpose, channel, desired response, and next step.",
  10: "For this question, the answer reflects how much explanation a new customer needs before understanding the offer and knowing how to move forward.",
  11: "Here, the answer describes how visible the customer journey is to the business, especially at moments of confusion, hesitation, or drop-off.",
  12: "For this question, the answer reflects what is intentionally decided before a larger marketing effort begins and what is left to develop along the way.",
  13: "Here, the answer describes what drives the timing and placement of marketing activity—from a planned rhythm to a response to immediate needs.",
  16: "For this question, the answer reflects whether each channel has a defined role within one connected marketing approach or operates mostly on its own.",
  17: "Here, the answer describes the evidence the business uses to understand performance and decide what should happen differently next time.",
  18: "For this question, the answer reflects how consistently customer interest is captured, followed up on, and guided toward a clear next step.",
  19: "Here, the answer describes how intentionally the business maintains the customer relationship after the initial purchase, visit, booking, or service.",
};

function answerDetailText(questionId: number, answer: AnswerOption) {
  const context = questionDetailContext[questionId];
  return context ? `${answer.description} ${context}` : answer.description;
}

function indexFromUrl() {
  const value = Number(
    new URL(window.location.href).searchParams.get("question"),
  );

  return Number.isInteger(value) &&
    value >= 1 &&
    value <= evaluationQuestions.length
    ? value - 1
    : 0;
}

function announceQuestion(index: number) {
  window.dispatchEvent(
    new CustomEvent("evaluationquestionchange", {
      detail: { questionId: evaluationQuestions[index].id },
    }),
  );
}

function updateUrl(index: number, mode: "push" | "replace" = "push") {
  const url = new URL(window.location.href);
  url.searchParams.set("question", String(evaluationQuestions[index].id));
  window.history[mode === "push" ? "pushState" : "replaceState"](
    window.history.state,
    "",
    url,
  );
  announceQuestion(index);
}

export default function Questionnaire({
  autoAdvanceOnSelect = false,
  showSectionProgress = false,
  exitDuration = 1420,
  inlineAnswerDetails = false,
  compactResults = false,
  scrollToTopOnQuestionChange = false,
}: {
  autoAdvanceOnSelect?: boolean;
  showSectionProgress?: boolean;
  exitDuration?: number;
  inlineAnswerDetails?: boolean;
  compactResults?: boolean;
  scrollToTopOnQuestionChange?: boolean;
} = {}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [showResults, setShowResults] = useState(false);
  const [showResultsLoading, setShowResultsLoading] = useState(false);
  const [showIntroLoading, setShowIntroLoading] = useState(compactResults);
  const [answerDetails, setAnswerDetails] = useState<AnswerOption | null>(null);
  const [isSectionIntroOpen, setIsSectionIntroOpen] = useState(false);
  const [seenSectionIntros, setSeenSectionIntros] = useState<Set<number>>(
    () => new Set(),
  );
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const sectionIntroButtonRef = useRef<HTMLButtonElement | null>(null);
  const question = evaluationQuestions[questionIndex];
  const previousSectionId = useRef<number | null>(null);
  const sectionBadgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSectionLauncherPulsing, setIsSectionLauncherPulsing] = useState(false);
  const [badgeReadySection, setBadgeReadySection] = useState<number | null>(null);
  const sectionIntro = sectionIntros[question.sectionId];
  const hasSectionNotification =
    badgeReadySection === question.sectionId &&
    !seenSectionIntros.has(question.sectionId);
  const selectedValues = responses[question.id] ?? [];
  const canContinue = selectedValues.length > 0;
  const detailText = answerDetails
    ? answerDetailText(question.id, answerDetails)
    : null;

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      if (introTimer.current) clearTimeout(introTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!compactResults) return;
    introTimer.current = setTimeout(() => setShowIntroLoading(false), 1400);
  }, [compactResults]);

  useEffect(() => {
    if (showIntroLoading) return;
    if (previousSectionId.current === question.sectionId) return;
    previousSectionId.current = question.sectionId;

    if (sectionBadgeTimer.current) clearTimeout(sectionBadgeTimer.current);
    setBadgeReadySection(null);
    setIsSectionLauncherPulsing(true);
    sectionBadgeTimer.current = setTimeout(() => {
      setIsSectionLauncherPulsing(false);
      setBadgeReadySection(question.sectionId);
    }, 720);

    return () => {
      if (sectionBadgeTimer.current) clearTimeout(sectionBadgeTimer.current);
    };
  }, [question.sectionId, showIntroLoading]);

  useEffect(() => {
    function showQuestionFromUrl() {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      const nextIndex = indexFromUrl();
      setIsSectionIntroOpen(false);
      setShowResults(false);
      setShowResultsLoading(false);
      setQuestionIndex(nextIndex);
      setPhase("idle");
      announceQuestion(nextIndex);
    }

    const initialIndex = 0;
    updateUrl(initialIndex, "replace");
    let isActive = true;
    queueMicrotask(() => {
      if (isActive) setQuestionIndex(initialIndex);
    });

    window.addEventListener("popstate", showQuestionFromUrl);
    return () => {
      isActive = false;
      window.removeEventListener("popstate", showQuestionFromUrl);
    };
  }, []);

  useEffect(() => {
    if (!answerDetails) return;

    closeButtonRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setAnswerDetails(null);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [answerDetails]);

  function storeSingleAnswer(answerId: string) {
    setResponses((current) => ({
      ...current,
      [question.id]: answerId ? [answerId] : [],
    }));
  }

  function toggleAnswer(answerId: string) {
    setResponses((current) => {
      const values = current[question.id] ?? [];
      return {
        ...current,
        [question.id]: values.includes(answerId)
          ? values.filter((value) => value !== answerId)
          : [...values, answerId],
      };
    });
  }

  function moveToQuestion(nextIndex: number, animate = true) {
    if (phase !== "idle" || nextIndex === questionIndex) return;
    setIsSectionIntroOpen(false);

    if (!animate) {
      updateUrl(nextIndex);
      setQuestionIndex(nextIndex);
      return;
    }

    window.dispatchEvent(
      new CustomEvent("evaluationvideotransition", {
        detail: { questionId: evaluationQuestions[nextIndex].id },
      }),
    );
    setPhase("exiting");
    const transitionDelay = window.matchMedia("(max-width: 967px)").matches
      ? Math.min(exitDuration, 260)
      : exitDuration;
    transitionTimer.current = setTimeout(() => {
      updateUrl(nextIndex);
      setQuestionIndex(nextIndex);
      setPhase("entering");
      if (
        scrollToTopOnQuestionChange &&
        window.matchMedia("(max-width: 599px)").matches
      ) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
      transitionTimer.current = setTimeout(() => setPhase("idle"), 500);
    }, transitionDelay);
  }

  function chooseButtonAnswer(answer: AnswerOption) {
    if (phase !== "idle") return;
    storeSingleAnswer(answer.id);

    if (questionIndex < evaluationQuestions.length - 1) {
      moveToQuestion(questionIndex + 1);
    } else {
      finishEvaluation();
    }
  }

  function chooseSelectAnswer(answerId: string) {
    if (phase !== "idle") return;
    storeSingleAnswer(answerId);

    if (questionIndex < evaluationQuestions.length - 1) {
      moveToQuestion(questionIndex + 1);
    } else {
      finishEvaluation();
    }
  }

  function finishEvaluation() {
    if (phase !== "idle") return;
    window.dispatchEvent(
      new CustomEvent("evaluationvideotransition", {
        detail: { questionId: evaluationQuestions.length + 1 },
      }),
    );
    setPhase("exiting");
    const revealResults = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("question");
      url.searchParams.set("results", "1");
      window.history.pushState(window.history.state, "", url);
      setShowResultsLoading(false);
      setShowResults(true);
      setPhase("idle");
      window.scrollTo({ top: 0, behavior: "smooth" });
      const announceResults = () => {
        window.dispatchEvent(
          new CustomEvent("evaluationresults", {
            detail: { questionId: evaluationQuestions.length + 1 },
          }),
        );
      };

      announceResults();
    };

    const transitionDelay = window.matchMedia("(max-width: 967px)").matches
      ? Math.min(exitDuration, 260)
      : exitDuration;
    transitionTimer.current = setTimeout(() => {
      if (!compactResults) {
        revealResults();
        return;
      }

      setShowResultsLoading(true);
      setPhase("idle");
      transitionTimer.current = setTimeout(revealResults, 1500);
    }, transitionDelay);
  }

  function restartEvaluation() {
    setSeenSectionIntros(new Set());
    setIsSectionIntroOpen(false);
    setResponses({});
    setShowResults(false);
    setShowResultsLoading(false);
    setQuestionIndex(0);
    setPhase("idle");
    updateUrl(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (showIntroLoading || showResultsLoading) {
    return (
      <main className="questionnaire-page results-loading" aria-live="polite" aria-busy="true">
        <div className="results-loading__content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="results-loading__logo"
            src="https://d14tal8bchn59o.cloudfront.net/tT8kTKStgAOAqD3CF-vqwSdDxRBYUlCtZatT91hBmrM/w:1920/plain/https%3A%2F%2F02f0a56ef46d93f03c90-22ac5f107621879d5667e0d7ed595bdb.ssl.cf2.rackcdn.com%2Fsites%2F127849%2Fphotos%2F24248554%2FEK_Ecko_Logo_%2528Page_1%2529_original.png"
            alt="Ecko Marketing"
          />
          <h1>{showIntroLoading ? "Pulse Evaluation" : "Pulse Evaluation Results"}</h1>
          <span className="results-loading__loader" aria-hidden="true" />
        </div>
      </main>
    );
  }

  if (showResults) {
    return (
      <ResultsPage
        responses={responses}
        onRestart={restartEvaluation}
        compact={compactResults}
      />
    );
  }

  const questionCard = (
    <QuestionCard
      key={question.id}
      question={question}
      phase={phase}
      selectedValues={selectedValues}
      onChooseButton={chooseButtonAnswer}
      onSelectValue={
        autoAdvanceOnSelect ? chooseSelectAnswer : storeSingleAnswer
      }
      onToggleValue={toggleAnswer}
      showSectionProgress={showSectionProgress}
    />
  );

  return (
    <main className="questionnaire-page">
      {inlineAnswerDetails ? (
        <div
          className={`questionnaire-flip${answerDetails ? " questionnaire-flip--turned" : ""}`}
        >
          <div className="questionnaire-flip__inner">
            <div className="questionnaire-flip__front">{questionCard}</div>
            <section
              className="questionnaire-flip__back"
              aria-hidden={!answerDetails}
              aria-live="polite"
            >
              {answerDetails && (
                <>
                  <h2>About this answer</h2>
                  <p>{detailText}</p>
                  <button type="button" onClick={() => setAnswerDetails(null)}>
                    Got it
                  </button>
                </>
              )}
            </section>
          </div>
        </div>
      ) : (
        questionCard
      )}

      <div
        className={`questionnaire__controls${inlineAnswerDetails && answerDetails ? " questionnaire__controls--details-open" : ""}`}
      >
        <button
          type="button"
          className="questionnaire__back"
          disabled={questionIndex === 0 || phase !== "idle"}
          onClick={() => moveToQuestion(questionIndex - 1)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span>Back</span>
        </button>
        <button
          type="button"
          className="questionnaire__continue"
          disabled={!canContinue || phase !== "idle"}
          onClick={() => {
            if (questionIndex < evaluationQuestions.length - 1) {
              moveToQuestion(questionIndex + 1);
            } else {
              finishEvaluation();
            }
          }}
        >
          {questionIndex === evaluationQuestions.length - 1
            ? "Complete"
            : "Continue"}
        </button>
      </div>

      {isSectionIntroOpen && (
        <aside
          className="section-intro-toast"
          role="dialog"
          aria-modal="false"
          aria-labelledby="section-intro-title"
          aria-describedby="section-intro-description"
        >
          <h2 id="section-intro-title">{sectionIntro.title}</h2>
          <p id="section-intro-description">{sectionIntro.description}</p>
          <button
            ref={sectionIntroButtonRef}
            type="button"
            onClick={() => setIsSectionIntroOpen(false)}
          >
            Got it
          </button>
        </aside>
      )}

      <button
        type="button"
        className={`section-intro-launcher${isSectionLauncherPulsing ? " section-intro-launcher--pulse" : ""}`}
        aria-label={`${isSectionIntroOpen ? "Close" : "Open"} ${sectionIntro.title} introduction`}
        aria-expanded={isSectionIntroOpen}
        onClick={() => {
          const nextOpenState = !isSectionIntroOpen;
          setIsSectionIntroOpen(nextOpenState);
          if (nextOpenState) {
            setBadgeReadySection(null);
            setSeenSectionIntros((current) => {
              const next = new Set(current);
              next.add(question.sectionId);
              return next;
            });
            requestAnimationFrame(() => sectionIntroButtonRef.current?.focus());
          }
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v1M3 12h1m16 0h1M5.6 5.6l.7.7m12.1-.7-.7.7M9 16a5 5 0 1 1 6 0c-.64.58-1 1.3-1 2.2V19a2 2 0 0 1-4 0v-.8c0-.9-.36-1.62-1-2.2Zm.7 1.5h4.6" />
        </svg>
        {hasSectionNotification && (
          <span className="section-intro-launcher__badge">1</span>
        )}
      </button>

      {answerDetails && !inlineAnswerDetails && (
        <div
          className="answer-dialog__backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAnswerDetails(null);
          }}
        >
          <div
            className="answer-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="answer-dialog-title"
            aria-describedby="answer-dialog-description"
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="answer-dialog__close"
              aria-label="Close dialog"
              onClick={() => setAnswerDetails(null)}
            >
              ×
            </button>
            <h2 id="answer-dialog-title" className="answer-dialog__title">
              About this answer
            </h2>
            <p id="answer-dialog-description" className="answer-dialog__description">
              {detailText}
            </p>
            <button
              type="button"
              className="answer-dialog__done"
              onClick={() => setAnswerDetails(null)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
