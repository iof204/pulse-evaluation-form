"use client";

import { useEffect, useRef, useState } from "react";
import QuestionCard from "./QuestionCard";
import {
  evaluationQuestions,
  type AnswerOption,
} from "./questionnaireData";

type TransitionPhase = "idle" | "exiting" | "entering";
type Responses = Record<number, string[]>;

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

export default function Questionnaire() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [phase, setPhase] = useState<TransitionPhase>("idle");
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

    setPhase("exiting");
    transitionTimer.current = setTimeout(() => {
      updateUrl(nextIndex);
      setQuestionIndex(nextIndex);
      setPhase("entering");
      transitionTimer.current = setTimeout(() => setPhase("idle"), 500);
    }, 1420);
  }

  function chooseButtonAnswer(answer: AnswerOption) {
    if (phase !== "idle") return;
    storeSingleAnswer(answer.id);

    if (questionIndex < evaluationQuestions.length - 1) {
      moveToQuestion(questionIndex + 1);
    }
  }

  return (
    <main className="questionnaire-page">
      <QuestionCard
        key={question.id}
        question={question}
        phase={phase}
        selectedValues={selectedValues}
        onChooseButton={chooseButtonAnswer}
        onSelectValue={storeSingleAnswer}
        onToggleValue={toggleAnswer}
        onShowDetails={setAnswerDetails}
      />

      <div className="questionnaire__controls">
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
            }
          }}
        >
          {questionIndex === evaluationQuestions.length - 1
            ? "Complete"
            : "Continue"}
        </button>
      </div>

      {answerDetails && (
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
