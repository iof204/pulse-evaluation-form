"use client";

import { useState } from "react";

const answers = [
  "Crystal clear",
  "Mostly clear",
  "More “what” than “why”",
  "It takes some explaining",
];

export default function Questionnaire() {
  const [selectedAnswer, setSelectedAnswer] = useState("Mostly clear");

  return (
    <main className="questionnaire-page">
      <section className="questionnaire" aria-labelledby="question-title">
        <h1 id="question-title" className="questionnaire__title">
          How clearly does your marketing communicate what your business offers
          and why it matters?
        </h1>

        <div className="questionnaire__answers" role="radiogroup">
          {answers.map((answer) => {
            const isSelected = selectedAnswer === answer;

            return (
              <button
                key={answer}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`questionnaire__answer${isSelected ? " questionnaire__answer--selected" : ""}`}
                onClick={() => setSelectedAnswer(answer)}
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
