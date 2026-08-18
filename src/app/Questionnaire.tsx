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

const detailExpansions: Record<number, string> = {
  1: "This gives us clearer context for the outcome your marketing needs to support first and the kind of momentum you are trying to create.",
  2: "This helps us interpret your answers through the way your business delivers value and how customers typically experience it.",
  3: "Your current stage shapes which marketing priorities are most useful now and what may need to be built before the next phase of growth.",
  4: "This gives us a better sense of whether your brand and message reinforce one recognizable idea across customer touchpoints.",
  5: "This helps reveal how intentionally your marketing is shaped around the people you most want to reach and what matters to them.",
  6: "This helps show whether your marketing activity is connected to a defined purpose or is being driven mainly by immediate needs.",
  7: "This gives us context for how your channels work together, how customers find you, and how confidently you can learn from results.",
  8: "This helps us understand how reliably interest becomes action and how intentionally customer relationships continue after the first transaction.",
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
}: {
  autoAdvanceOnSelect?: boolean;
  showSectionProgress?: boolean;
  exitDuration?: number;
  inlineAnswerDetails?: boolean;
} = {}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [showResults, setShowResults] = useState(false);
  const [answerDetails, setAnswerDetails] = useState<AnswerOption | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const question = evaluationQuestions[questionIndex];
  const selectedValues = responses[question.id] ?? [];
  const canContinue = selectedValues.length > 0;

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

  useEffect(() => {
    function showQuestionFromUrl() {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      const nextIndex = indexFromUrl();
      setShowResults(false);
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
    setPhase("exiting");
    transitionTimer.current = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("question");
      url.searchParams.set("results", "1");
      window.history.pushState(window.history.state, "", url);
      setShowResults(true);
      window.dispatchEvent(new Event("evaluationresults"));
      setPhase("idle");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, exitDuration);
  }

  function restartEvaluation() {
    setResponses({});
    setShowResults(false);
    setQuestionIndex(0);
    setPhase("idle");
    updateUrl(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (showResults) {
    return <ResultsPage responses={responses} onRestart={restartEvaluation} />;
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
                    {answerDetails.description} {detailExpansions[question.sectionId]}
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
