"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  evaluationQuestions,
  type AnswerOption,
  type EvaluationQuestion,
} from "./questionnaireData";

type QuestionCardProps = {
  question: EvaluationQuestion;
  phase: "idle" | "exiting" | "entering";
  selectedValues: string[];
  onChooseButton: (answer: AnswerOption) => void;
  onSelectValue: (answerId: string) => void;
  onToggleValue: (answerId: string) => void;
  onShowDetails: (answer: AnswerOption) => void;
  showSectionProgress?: boolean;
};

export default function QuestionCard({
  question,
  phase,
  selectedValues,
  onChooseButton,
  onSelectValue,
  onToggleValue,
  onShowDetails,
  showSectionProgress = false,
}: QuestionCardProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [hasLongTitle, setHasLongTitle] = useState(false);
  const sectionQuestions = evaluationQuestions.filter(
    ({ sectionId }) => sectionId === question.sectionId,
  );
  const sectionQuestionIndex = sectionQuestions.findIndex(
    ({ id }) => id === question.id,
  );
  const sectionProgress =
    ((sectionQuestionIndex + 1) / sectionQuestions.length) * 100;
  const progressBar = showSectionProgress ? (
    <div
      className="questionnaire__section-progress"
      role="progressbar"
      aria-label="Section progress"
      aria-valuemin={1}
      aria-valuemax={sectionQuestions.length}
      aria-valuenow={sectionQuestionIndex + 1}
    >
      <span style={{ width: `${sectionProgress}%` }} />
    </div>
  ) : null;

  useLayoutEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    const measureTitle = () => {
      title.classList.remove("questionnaire__title--long");
      const lineHeight = Number.parseFloat(getComputedStyle(title).lineHeight);
      const isLong = title.getBoundingClientRect().height > lineHeight * 3 + 1;
      title.classList.toggle("questionnaire__title--long", isLong);
      setHasLongTitle(isLong);
    };

    measureTitle();
    window.addEventListener("resize", measureTitle);
    void document.fonts.ready.then(measureTitle);

    return () => window.removeEventListener("resize", measureTitle);
  }, [question.id]);

  return (
    <section
      className={`questionnaire questionnaire--${phase}`}
      aria-labelledby="question-title"
    >
      <p className="questionnaire__meta">
        {sectionQuestionIndex + 1} / {sectionQuestions.length}
      </p>
      <h1
        ref={titleRef}
        id="question-title"
        className={`questionnaire__title${hasLongTitle ? " questionnaire__title--long" : ""}`}
      >
        {question.title}
      </h1>
      <p className="questionnaire__instruction">
        {question.kind === "multi-select"
          ? "Choose all that apply."
          : "Choose the one that feels most important today."}
      </p>

      {question.kind === "buttons" && (
        <div
          className="questionnaire__choice-list questionnaire__choice-list--single"
          role="radiogroup"
          aria-label="Choose one answer"
        >
          {progressBar}
          {question.answers.map((answer) => {
            const isSelected = selectedValues.includes(answer.id);

            return (
              <div className="questionnaire__choice-row" key={answer.id}>
                <label>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={answer.id}
                    checked={isSelected}
                    disabled={phase !== "idle"}
                    onChange={() => onChooseButton(answer)}
                  />
                  <span>
                    <strong>{answer.label}</strong>
                  </span>
                </label>
                <button
                  type="button"
                  className="questionnaire__choice-info"
                  aria-label={`Learn more about “${answer.label}”`}
                  disabled={phase !== "idle"}
                  onClick={() => onShowDetails(answer)}
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {question.kind === "select" && (
        <div
          className="questionnaire__choice-list questionnaire__choice-list--single"
          role="radiogroup"
          aria-label="Choose one answer"
        >
          {progressBar}
          {question.answers.map((answer) => (
            <div className="questionnaire__choice-row" key={answer.id}>
              <label>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={answer.id}
                  checked={selectedValues.includes(answer.id)}
                  disabled={phase !== "idle"}
                  onChange={() => onSelectValue(answer.id)}
                />
                <span>
                  <strong>{answer.label}</strong>
                </span>
              </label>
              <button
                type="button"
                className="questionnaire__choice-info"
                aria-label={`Learn more about “${answer.label}”`}
                disabled={phase !== "idle"}
                onClick={() => onShowDetails(answer)}
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {question.kind === "multi-select" && (
        <div
          className="questionnaire__choice-list questionnaire__choice-list--multi"
          role="group"
          aria-label="Select all answers that apply"
        >
          {progressBar}
          {question.answers.map((answer) => (
            <label key={answer.id}>
              <input
                type="checkbox"
                checked={selectedValues.includes(answer.id)}
                disabled={phase !== "idle"}
                onChange={() => onToggleValue(answer.id)}
              />
              <span>
                <strong>{answer.label}</strong>
              </span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
