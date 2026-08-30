"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Questionnaire from "./Questionnaire";
import { evaluationQuestions } from "./questionnaireData";

const resultsVideoId = evaluationQuestions.length + 1;

const questionVideos: Partial<Record<number, { src: string; poster: string }>> = {
  1: {
    src: "/videos/question-01.mp4",
    poster: "/images/question-01-poster.jpg",
  },
  [resultsVideoId]: {
    src: "/videos/results.mp4",
    poster: "/images/results-poster.jpg",
  },
};

function QuestionVideo({
  src,
  poster,
  questionId,
  active,
}: {
  src: string;
  poster: string;
  questionId: number;
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active) {
      video.pause();
      return;
    }

    video.muted = false;
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => setIsPlaying(false));
    });
  }, [active]);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = false;
      await video.play();
    } else {
      video.pause();
    }
  }

  async function replayVideo() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = false;
    await video.play();
  }

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  return (
    <>
      <video
        ref={videoRef}
        className="v2-video-card__video"
        src={src}
        poster={poster}
        autoPlay={active}
        playsInline
        preload={active ? "auto" : "none"}
        aria-label={`Video for question ${questionId}`}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
      />
      <div className="v2-video-card__controls v2-video-card__controls--sound">
        <button
          type="button"
          className="v2-video-card__control"
          aria-label={isMuted ? "Turn sound on" : "Mute video"}
          onClick={toggleSound}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            {isMuted ? (
              <>
                <path d="m16 9 5 6" />
                <path d="m21 9-5 6" />
              </>
            ) : (
              <>
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18 6a8.5 8.5 0 0 1 0 12" />
              </>
            )}
          </svg>
        </button>
      </div>
      <div className="v2-video-card__controls">
        <button
          type="button"
          className="v2-video-card__control"
          aria-label="Replay video"
          onClick={replayVideo}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8.28" />
            <path d="M3 3v5.28h5.28" />
          </svg>
        </button>
        <button
          type="button"
          className="v2-video-card__control"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          onClick={togglePlayback}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
            {isPlaying ? (
              <path d="M7 6h3v12H7V6Zm7 0h3v12h-3V6Z" />
            ) : (
              <path d="M9 7.6v8.8L16 12 9 7.6Z" />
            )}
          </svg>
        </button>
      </div>
    </>
  );
}

function VideoRail() {
  const [activeQuestion, setActiveQuestion] = useState(1);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "out" | "in">("idle");
  const [resultsPosition, setResultsPosition] = useState<CSSProperties | undefined>();
  const railRef = useRef<HTMLDivElement>(null);
  const activeQuestionRef = useRef(1);
  const transitionTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    function updateVideo(event: Event) {
      const nextQuestion = (event as CustomEvent<{ questionId: number }>).detail
        .questionId;

      if (
        event.type === "evaluationresults" &&
        window.matchMedia("(min-width: 968px)").matches
      ) {
        const bounds = railRef.current?.getBoundingClientRect();
        const headerBottom = document
          .querySelector<HTMLElement>(".primary-header")
          ?.getBoundingClientRect().bottom;
        if (bounds) {
          setResultsPosition({
            position: "sticky",
            top: (headerBottom ?? bounds.top - 44) + 44,
            zIndex: 2,
          });
        }
      } else if (event.type === "evaluationquestionchange") {
        setResultsPosition(undefined);
      }

      if (nextQuestion === activeQuestionRef.current) return;

      if (event.type === "evaluationresults") {
        transitionTimers.current.forEach(clearTimeout);
        activeQuestionRef.current = nextQuestion;
        setActiveQuestion(nextQuestion);
        setTransitionPhase("in");
        transitionTimers.current = [
          setTimeout(() => setTransitionPhase("idle"), 440),
        ];
        return;
      }

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
    window.addEventListener("evaluationresults", updateVideo);
    return () => {
      window.removeEventListener("evaluationquestionchange", updateVideo);
      window.removeEventListener("evaluationvideotransition", updateVideo);
      window.removeEventListener("evaluationresults", updateVideo);
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
        style={resultsPosition}
      >
        {[...evaluationQuestions.map(({ id }) => id), resultsVideoId].map((videoId) => {
          const video = questionVideos[videoId];
          return (
            <div
              key={videoId}
              data-question-video={videoId}
              className={`v2-video-card${activeQuestion === videoId ? " is-active" : ""}${videoId === resultsVideoId ? " v2-video-card--results" : ""}`}
              aria-hidden={activeQuestion !== videoId ? true : undefined}
            >
              {video ? (
                <QuestionVideo
                  src={video.src}
                  poster={video.poster}
                  questionId={videoId}
                  active={activeQuestion === videoId}
                />
              ) : (
                <span className="v2-video-card__media" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 7.6v8.8L16 12 9 7.6Z" />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function EvaluationIntro({ onStart }: { onStart: () => void }) {
  return (
    <main className="questionnaire-page results-page-compact v2-evaluation-intro">
      <section className="questionnaire" aria-labelledby="evaluation-intro-title">
        <div className="v2-evaluation-intro__heading">
          <div>
            <h1 id="evaluation-intro-title" className="questionnaire__title">
              The Ecko
              <br />
              Marketing Pulse
              <br />
              <span className="v2-evaluation-intro__title-gold">Evaluation.</span>
            </h1>
          </div>
        </div>

        <div className="results-expanded-card results-expanded-card--reminder v2-evaluation-intro__card">
          <div className="results-category-details results-expanded-card__details">
            <blockquote className="v2-evaluation-intro__quote">
              <span aria-hidden="true">&ldquo;</span>
              A quick, judgment-free look at what is clicking, what could use a
              little love, and where your marketing may be leaving opportunity
              on the table.
            </blockquote>

            <ul className="v2-evaluation-intro__features">
              <li>
                <span className="results-section-title__icon" aria-hidden="true">
                  <i className="fas fa-heart-pulse" />
                </span>
                <strong>Honest insights about your marketing mix</strong>
              </li>
              <li>
                <span className="results-section-title__icon" aria-hidden="true">
                  <i className="far fa-circle-question" />
                </span>
                <strong>Simple, friendly questions (no jargon)</strong>
              </li>
              <li>
                <span className="results-section-title__icon" aria-hidden="true">
                  <i className="far fa-clock" />
                </span>
                <strong>Takes 5 minutes to complete</strong>
              </li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          className="questionnaire__continue v2-evaluation-intro__button"
          onClick={onStart}
        >
          Take the Evaluation
        </button>
      </section>
    </main>
  );
}

export default function V2EvaluationPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [activeView, setActiveView] = useState(1);

  useEffect(() => {
    if (hasStarted) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("question");
    url.searchParams.delete("results");
    window.history.replaceState(window.history.state, "", url);
  }, [hasStarted]);

  useEffect(() => {
    function updateActiveView(event: Event) {
      setActiveView(
        (event as CustomEvent<{ questionId: number }>).detail.questionId,
      );
    }

    window.addEventListener("evaluationquestionchange", updateActiveView);
    window.addEventListener("evaluationresults", updateActiveView);
    return () => {
      window.removeEventListener("evaluationquestionchange", updateActiveView);
      window.removeEventListener("evaluationresults", updateActiveView);
    };
  }, []);

  const showVideo = !hasStarted || activeView === resultsVideoId;

  return (
    <>
      <Header />
      <div
        className={`v2-evaluation-layout${showVideo ? "" : " v2-evaluation-layout--question-only"}`}
      >
        <VideoRail />
        <div className="v2-question-panel">
          {hasStarted ? (
            <Questionnaire
              autoAdvanceOnSelect
              compactResults
              exitDuration={720}
              inlineAnswerDetails
              scrollToTopOnQuestionChange
            />
          ) : (
            <EvaluationIntro onStart={() => setHasStarted(true)} />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
