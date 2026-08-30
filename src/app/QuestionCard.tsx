"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  evaluationQuestions,
  type AnswerOption,
  type EvaluationQuestion,
} from "./questionnaireData";

const questionHighlights: Record<number, string[]> = {
  1: ["biggest job", "right now?"],
  2: ["how your business works?"],
  3: ["where your business is today?"],
  4: ["core message"],
  5: ["how obvious", "same business?"],
  6: ["primary audience?"],
  7: ["messages, offers, or content"],
  8: ["want your marketing to accomplish"],
  9: ["meant to accomplish?"],
  10: ["explain what you offer"],
  11: ["where customers hesitate, ask for help, or drop off?"],
  12: ["what is usually planned?"],
  13: ["when and where to show up"],
  14: ["find your business?"],
  15: ["currently part of your mix?"],
  16: ["work together?"],
  17: ["repeat, adjust, or try differently"],
  18: ["what usually happens next?"],
  19: ["stay connected"],
};

function highlightedQuestionTitle(question: EvaluationQuestion) {
  const phrases = questionHighlights[question.id] ?? [];
  const segments: Array<{ text: string; highlighted: boolean }> = [];
  let cursor = 0;

  for (const phrase of phrases) {
    const start = question.title.indexOf(phrase, cursor);
    if (start < 0) continue;
    if (start > cursor) {
      segments.push({ text: question.title.slice(cursor, start), highlighted: false });
    }
    segments.push({ text: phrase, highlighted: true });
    cursor = start + phrase.length;
  }

  if (cursor < question.title.length) {
    segments.push({ text: question.title.slice(cursor), highlighted: false });
  }

  return segments.map(({ text, highlighted }, index) =>
    highlighted ? (
      <span className="questionnaire__title-highlight" key={`${text}-${index}`}>
        {text}
      </span>
    ) : (
      text
    ),
  );
}

type QuestionCardProps = {
  question: EvaluationQuestion;
  phase: "idle" | "exiting" | "entering";
  selectedValues: string[];
  onChooseButton: (answer: AnswerOption) => void;
  onSelectValue: (answerId: string) => void;
  onToggleValue: (answerId: string) => void;
  showSectionProgress?: boolean;
};

export default function QuestionCard({
  question,
  phase,
  selectedValues,
  onChooseButton,
  onSelectValue,
  onToggleValue,
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
        {highlightedQuestionTitle(question)}
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
