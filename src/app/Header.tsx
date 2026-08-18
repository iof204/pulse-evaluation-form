"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const updateStickyState = () => setIsStuck(window.scrollY > 0);

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });

    return () => window.removeEventListener("scroll", updateStickyState);
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
              <span>Bold Ideas. Seamless Execution. </span>
            </h2>
          </div>
        </div>

        <div className="buttons">
          <a
            className="site-button site-button--pulse"
            style={
              {
                "--ss-site-button-background-color": "#7C4D9E",
                "--ss-site-button-background-color-dark": "#633485",
                "--ss-site-button-text-color": "#FAFAFA",
              } as React.CSSProperties
            }
            href="tel:+17023774261"
          >
            Book Your Strategy Spark Sesh
          </a>
        </div>
      </div>

      <nav
        className={`primary-navigation${isMenuOpen ? " open" : ""}`}
        aria-label="Site"
      >
        <div
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
            <li>
              <Link className="active" href="/" onClick={closeMenu}>
                <div>Home</div>
              </Link>
            </li>{" "}
            <li>
              <Link href="/our-services" onClick={closeMenu}>
                <div>Our Services</div>
              </Link>
            </li>{" "}
            <li>
              <Link href="/meet-bri" onClick={closeMenu}>
                <div>Meet Bri </div>
              </Link>
            </li>{" "}
            <li>
              <Link href="/let-s-talk" onClick={closeMenu}>
                <div>Let&apos;s Talk</div>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
