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
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = questions[questionIndex];

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

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
              <button
                key={answer}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={phase !== "idle"}
                style={{ "--answer-index": index } as CSSProperties}
                className={`questionnaire__answer${isSelected ? " questionnaire__answer--selected" : " questionnaire__answer--unselected"}`}
                onClick={() => chooseAnswer(answer)}
              >
                {answer}
              </button>
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
    </main>
  );
}
