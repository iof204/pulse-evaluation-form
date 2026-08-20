"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  evaluationQuestions,
  evaluationSections,
  questionIndexForSection,
} from "./questionnaireData";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [activeSection, setActiveSection] = useState<number | null>(1);
  const navigationScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateStickyState = () => setIsStuck(window.scrollY > 0);

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });

    return () => window.removeEventListener("scroll", updateStickyState);
  }, []);

  useEffect(() => {
    if (activeSection === null || !window.matchMedia("(max-width: 967px)").matches) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const scroller = navigationScrollRef.current;
      const activeItem = scroller?.querySelector<HTMLElement>(
        ".page-listing button.active",
      );
      if (!scroller || !activeItem) return;

      const activeListItem = activeItem.closest<HTMLElement>("li");
      scroller.scrollTo({
        left: activeListItem?.offsetLeft ?? activeItem.offsetLeft,
        behavior: "smooth",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [activeSection]);

  useEffect(() => {
    function sectionFromQuestion(questionId: number) {
      return (
        evaluationQuestions.find((question) => question.id === questionId)
          ?.sectionId ?? 1
      );
    }

    function updateFromUrl() {
      const questionId = Number(
        new URL(window.location.href).searchParams.get("question"),
      );
      setActiveSection(sectionFromQuestion(questionId));
    }

    function updateFromQuestionEvent(event: Event) {
      const questionId = (event as CustomEvent<{ questionId: number }>).detail
        .questionId;
      setActiveSection(sectionFromQuestion(questionId));
    }

    function showCompletedState() {
      setActiveSection(null);
    }

    queueMicrotask(updateFromUrl);
    window.addEventListener("popstate", updateFromUrl);
    window.addEventListener(
      "evaluationquestionchange",
      updateFromQuestionEvent,
    );
    window.addEventListener("evaluationresults", showCompletedState);
    return () => {
      window.removeEventListener("popstate", updateFromUrl);
      window.removeEventListener(
        "evaluationquestionchange",
        updateFromQuestionEvent,
      );
      window.removeEventListener("evaluationresults", showCompletedState);
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const openSection = (sectionId: number) => {
    const questionIndex = questionIndexForSection(sectionId);
    const url = new URL(window.location.href);
    url.searchParams.set(
      "question",
      String(evaluationQuestions[questionIndex].id),
    );
    window.history.pushState(window.history.state, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
    closeMenu();
  };

  return (
    <header
      className={`primary-header layout-bottom_nav_left_branding branding-style-logo-text is-sticky${isStuck ? " stuck" : ""}`}
    >
      <div className="primary-header__content">
        <div className="branding">
          <Link className="logo" href="/">
            {/* The original header uses a plain image with intrinsic proportions. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Ecko Marketing  "
              src="https://d14tal8bchn59o.cloudfront.net/tT8kTKStgAOAqD3CF-vqwSdDxRBYUlCtZatT91hBmrM/w:1920/plain/https%3A%2F%2F02f0a56ef46d93f03c90-22ac5f107621879d5667e0d7ed595bdb.ssl.cf2.rackcdn.com%2Fsites%2F127849%2Fphotos%2F24248554%2FEK_Ecko_Logo_%2528Page_1%2529_original.png"
            />
          </Link>

          <div className="headings">
            <h2>
              <span>Evolve. Elevate. Then Echo!</span>
            </h2>
          </div>
        </div>

        <div className="buttons evaluation-badge" aria-label="Marketing Pulse Evaluation, approximately 5 minutes">
          <span className="evaluation-badge__copy">
            <strong>Marketing Pulse Evaluation</strong>
            <small>Discover your marketing rhythm</small>
          </span>
          <span className="evaluation-badge__time">
            <strong><span className="evaluation-badge__approximation">≈ </span>5</strong>
            <small>
              <span className="evaluation-badge__minute-short">min</span>
              <span className="evaluation-badge__minute-full">minute</span>
            </small>
          </span>
        </div>

      </div>

      <nav
        className={`primary-navigation evaluation-navigation${isMenuOpen ? " open" : ""}`}
        aria-label="Site"
      >
        <div
          ref={navigationScrollRef}
          className="inner-wrap"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeMenu();
          }}
        >
          <button
            type="button"
            aria-label="View Menu"
            aria-expanded={isMenuOpen}
            title="View Menu"
            className="menu-toggle"
            onClick={() => setIsMenuOpen((open) => !open)}
          />

          <ul className="page-listing" data-behavior="site-navigation">
            {evaluationSections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={activeSection === section.id ? "active" : undefined}
                  aria-current={
                    activeSection === section.id ? "step" : undefined
                  }
                  onClick={() => openSection(section.id)}
                >
                  <div>
                    {section.number !== null &&
                      `${String(section.number).padStart(2, "0")} `}
                    {section.label}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
