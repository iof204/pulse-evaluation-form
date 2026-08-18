"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Questionnaire from "./Questionnaire";
import { evaluationQuestions } from "./questionnaireData";

function VideoRail() {
  const [activeQuestion, setActiveQuestion] = useState(1);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "out" | "in">("idle");
  const railRef = useRef<HTMLDivElement>(null);
  const activeQuestionRef = useRef(1);
  const transitionTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    function updateVideo(event: Event) {
      const nextQuestion = (event as CustomEvent<{ questionId: number }>).detail
        .questionId;

      if (nextQuestion === activeQuestionRef.current) return;

      if (event.type === "evaluationvideotransition") {
        transitionTimers.current.forEach(clearTimeout);
        setTransitionPhase("out");
        return;
      }

      transitionTimers.current.forEach(clearTimeout);
      setTransitionPhase("out");
      transitionTimers.current = [
        setTimeout(() => {
          activeQuestionRef.current = nextQuestion;
          setActiveQuestion(nextQuestion);
          setTransitionPhase("in");
          transitionTimers.current = [
            setTimeout(() => setTransitionPhase("idle"), 440),
          ];
        }, 200),
      ];
    }

    window.addEventListener("evaluationquestionchange", updateVideo);
    window.addEventListener("evaluationvideotransition", updateVideo);
    return () => {
      window.removeEventListener("evaluationquestionchange", updateVideo);
      window.removeEventListener("evaluationvideotransition", updateVideo);
      transitionTimers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 967px)").matches) return;
    const card = railRef.current?.querySelector<HTMLElement>(
      `[data-question-video="${activeQuestion}"]`,
    );
    if (!card || !railRef.current) return;
    railRef.current.scrollTo({
      left: card.offsetLeft - 16,
      behavior: "smooth",
    });
  }, [activeQuestion]);

  return (
    <aside className="v2-video-panel" aria-label="Video content">
      <div
        ref={railRef}
        className="v2-video-rail"
        data-transition={transitionPhase}
      >
        {evaluationQuestions.map((question) => (
          <button
            key={question.id}
            type="button"
            data-question-video={question.id}
            className={`v2-video-card${activeQuestion === question.id ? " is-active" : ""}`}
            aria-label={`Play video for question ${question.id}`}
            aria-hidden={activeQuestion !== question.id ? true : undefined}
            tabIndex={activeQuestion === question.id ? 0 : -1}
          >
            <span className="v2-video-card__media" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 7.6v8.8L16 12 9 7.6Z" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default function V2EvaluationPage() {
  return (
    <>
      <Header />
      <div className="v2-evaluation-layout">
        <VideoRail />
        <div className="v2-question-panel">
          <Questionnaire
            autoAdvanceOnSelect
            exitDuration={720}
            inlineAnswerDetails
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
