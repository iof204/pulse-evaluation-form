"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

const questions = [
  {
    title:
      "How clearly does your marketing communicate what your business offers and why it matters?",
    answers: [
      "Crystal clear",
      "Mostly clear",
      "More “what” than “why”",
      "It takes some explaining",
    ],
  },
  {
    title: "How consistently does your brand show up across your marketing?",
    answers: [
      "Consistent everywhere",
      "Mostly consistent",
      "It varies by channel",
      "We are still finding our style",
    ],
  },
];

export default function Questionnaire() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "exiting" | "entering">(
    "idle",
  );
  const [answerDetails, setAnswerDetails] = useState<{
    question: string;
    answer: string;
  } | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const question = questions[questionIndex];

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
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

  function chooseAnswer(answer: string) {
    if (phase !== "idle") return;

    setSelectedAnswer(answer);
    setPhase("exiting");
    transitionTimer.current = setTimeout(() => {
      setQuestionIndex((current) => (current + 1) % questions.length);
      setSelectedAnswer(null);
      setPhase("entering");
      transitionTimer.current = setTimeout(() => setPhase("idle"), 500);
    }, 1420);
  }

  return (
    <main className="questionnaire-page">
      <section
        key={questionIndex}
        className={`questionnaire questionnaire--${phase}`}
        aria-labelledby="question-title"
      >
        <h1 id="question-title" className="questionnaire__title">
          {question.title}
        </h1>

        <div className="questionnaire__answers" role="radiogroup">
          {question.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;

            return (
              <div
                key={answer}
                style={{ "--answer-index": index } as CSSProperties}
                className={`questionnaire__answer-wrap${isSelected ? " questionnaire__answer-wrap--selected" : " questionnaire__answer-wrap--unselected"}`}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={phase !== "idle"}
                  className={`questionnaire__answer${isSelected ? " questionnaire__answer--selected" : " questionnaire__answer--unselected"}`}
                  onClick={() => chooseAnswer(answer)}
                >
                  {answer}
                </button>
                <button
                  type="button"
                  className="questionnaire__answer-info"
                  aria-label={`Learn more about “${answer}”`}
                  disabled={phase !== "idle"}
                  onClick={() =>
                    setAnswerDetails({ question: question.title, answer })
                  }
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="questionnaire__controls">
          <button type="button" className="questionnaire__back">
            ← Back
          </button>
          <button type="button" className="questionnaire__continue">
            Continue
          </button>
        </div>
      </section>

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
            <p className="answer-dialog__eyebrow">About this response</p>
            <h2 id="answer-dialog-title">{answerDetails.answer}</h2>
            <p className="answer-dialog__question">{answerDetails.question}</p>
            <p id="answer-dialog-description">
              Choose this response if it best reflects where your marketing is
              today. There is no wrong answer—this helps identify the clearest
              next opportunity for your strategy.
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
