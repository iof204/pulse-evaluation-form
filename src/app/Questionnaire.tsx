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

const actionTitles: Record<string, string> = {
  Build: "Building",
  Generate: "Generating",
  Increase: "Increasing",
  Support: "Supporting",
  Improve: "Improving",
  Strengthen: "Strengthening",
  Become: "Becoming",
  Clarify: "Clarifying",
  Review: "Reviewing",
  Rely: "Relying",
};

const detailPriorities: Record<number, string> = {
  1: "Prioritizing context that keeps the recommendations ahead practical and relevant to your business.",
  2: "Prioritizing a recognizable message and brand experience across every customer touchpoint.",
  3: "Prioritizing a clearer understanding of the people you most want to reach and what matters to them.",
  4: "Prioritizing marketing activity that connects to a defined purpose instead of the need of the moment.",
  5: "Prioritizing a customer journey that makes the offer, next step, and path forward easier to understand.",
  6: "Prioritizing intentional planning around the right message, timing, audience, and places to show up.",
  7: "Prioritizing a connected channel mix and clearer signals about what deserves repeating or changing.",
  8: "Prioritizing reliable follow-through that turns interest into action and first-time customers into lasting relationships.",
};

function detailTitle(label: string) {
  const [firstWord, ...rest] = label.split(" ");
  const action = actionTitles[firstWord];
  return action ? `${action}${rest.length ? ` ${rest.join(" ")}` : ""}` : label;
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
}: {
  autoAdvanceOnSelect?: boolean;
  showSectionProgress?: boolean;
  exitDuration?: number;
  inlineAnswerDetails?: boolean;
  compactResults?: boolean;
} = {}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [showResults, setShowResults] = useState(false);
  const [showResultsLoading, setShowResultsLoading] = useState(false);
  const [showIntroLoading, setShowIntroLoading] = useState(compactResults);
  const [answerDetails, setAnswerDetails] = useState<AnswerOption | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const question = evaluationQuestions[questionIndex];
  const selectedValues = responses[question.id] ?? [];
  const canContinue = selectedValues.length > 0;

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
    function showQuestionFromUrl() {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      const nextIndex = indexFromUrl();
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
    transitionTimer.current = setTimeout(() => {
      updateUrl(nextIndex);
      setQuestionIndex(nextIndex);
      setPhase("entering");
      transitionTimer.current = setTimeout(() => setPhase("idle"), 500);
    }, exitDuration);
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

      if (compactResults) {
        transitionTimer.current = setTimeout(announceResults, 560);
      } else {
        announceResults();
      }
    };

    transitionTimer.current = setTimeout(() => {
      if (!compactResults) {
        revealResults();
        return;
      }

      setShowResultsLoading(true);
      setPhase("idle");
      transitionTimer.current = setTimeout(revealResults, 1500);
    }, exitDuration);
  }

  function restartEvaluation() {
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
      onShowDetails={setAnswerDetails}
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
                  <h2>{detailTitle(answerDetails.label)}</h2>
                  <p>
                    {answerDetails.description}
                    {question.id !== 1 && ` ${detailPriorities[question.sectionId]}`}
                  </p>
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
              About “{answerDetails.label}”
            </h2>
            <p
              id="answer-dialog-description"
              className="answer-dialog__description"
            >
              {answerDetails.description}
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
