"use client";

import type { CSSProperties } from "react";
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

  return (
    <section
      className={`questionnaire questionnaire--${phase}`}
      aria-labelledby="question-title"
    >
      <p className="questionnaire__meta">
        {question.id}/{evaluationQuestions.length}
      </p>
      <h1 id="question-title" className="questionnaire__title">
        {question.title}
      </h1>

      {question.kind === "buttons" && (
        <div className="questionnaire__answers" role="radiogroup">
          {progressBar}
          {question.answers.map((answer, index) => {
            const isSelected = selectedValues.includes(answer.id);

            return (
              <div
                key={answer.id}
                style={{ "--answer-index": index } as CSSProperties}
                className={`questionnaire__answer-wrap${isSelected ? " questionnaire__answer-wrap--selected" : " questionnaire__answer-wrap--unselected"}`}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={phase !== "idle"}
                  className={`questionnaire__answer${isSelected ? " questionnaire__answer--selected" : " questionnaire__answer--unselected"}`}
                  onClick={() => onChooseButton(answer)}
                >
                  {answer.label}
                </button>
                <button
                  type="button"
                  className="questionnaire__answer-info"
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
