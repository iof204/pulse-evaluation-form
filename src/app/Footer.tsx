import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-inner-container">
        <div className="footer">
          <div className="footer__content footer__content--two_column">
            <div className="footer__column">
              <div className="about">
                <div className="about-title wysiwyg-text">
                  <h1>
                    <strong>
                      <span className="font-size-s">About Ecko Marketing&nbsp;&nbsp;</span>
                    </strong>
                  </h1>
                </div>
                <div className="about-content wysiwyg-text">
                  <span className="font-size-s">
                    Ecko Mktg is a Las Vegas-based marketing consultancy helping
                    businesses grow through thoughtful strategy, creative
                    problem-solving, and marketing that works. Think of us as your
                    Marketing Sidekick - here to bring clarity, confidence, and
                    measurable results to every stage of your business.
                  </span>
                  <br />
                  <br />
                  <br />
                  <span className="font-size-s">
                    <Link href="/privacy-policy">
                      <span style={{ color: "#ffffff" }}>Privacy Policy</span>
                    </Link>
                  </span>
                </div>
              </div>

              <div className="social-icons">
                <div className="social-icons__networks">
                  <a
                    target="_blank"
                    title="Visit Ecko Marketing   on Facebook Page"
                    aria-label="Visit Ecko Marketing   on Facebook Page (opens in new window)"
                    href="https://www.facebook.com/people/Ecko-Marketing/61590853405935/"
                    rel="noreferrer"
                  >
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a
                    target="_blank"
                    title="Visit Ecko Marketing   on Instagram"
                    aria-label="Visit Ecko Marketing   on Instagram (opens in new window)"
                    href="https://www.instagram.com/eckomktg/"
                    rel="noreferrer"
                  >
                    <i className="fab fa-instagram" />
                  </a>
                  <a
                    target="_blank"
                    title="Visit Ecko Marketing   on LinkedIn"
                    aria-label="Visit Ecko Marketing   on LinkedIn (opens in new window)"
                    href="https://www.linkedin.com/company/ecko-marketing-llc"
                    rel="noreferrer"
                  >
                    <i className="fab fa-linkedin-in" />
                  </a>
                </div>
              </div>
            </div>

            <div className="footer__column">
              <div className="locations">
                <div className="location-title wysiwyg-text">
                  <strong>Contact Details:</strong>
                </div>
                <div className="location font-size-s">
                  <div className="location__item">
                    <div className="location__icon">
                      <i className="fa-solid fa-phone" />
                    </div>
                    <div className="location__content">
                      Phone: <a href="tel:702.377.4261">702.377.4261</a>
                      <br />
                    </div>
                  </div>

                  <div className="location__item">
                    <div className="location__icon">
                      <i className="fa-solid fa-envelope" />
                    </div>
                    <div className="location__content">
                      <a href="mailto:Info@Eckomktg.com">Info@Eckomktg.com</a>
                      <br />
                    </div>
                  </div>

                  <div className="location__item">
                    <div className="location__icon">
                      <i className="fa-solid fa-clock" />
                    </div>
                    <div className="location__content">
                      <span className="location-hours-day">Monday - Friday:</span>{" "}
                      9:00am - 5:00pm
                      <br />
                      <span className="location-hours-day">Saturday - Sunday:</span>{" "}
                      Closed
                      <br />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="Site">
          <ul className="page-listing" data-behavior="site-navigation">
            <li>
              <Link className="active" href="/">
                <div>Home</div>
              </Link>
            </li>
            <li>
              <Link href="/our-services">
                <div>Our Services</div>
              </Link>
            </li>
            <li>
              <Link href="/meet-bri">
                <div>Meet Bri </div>
              </Link>
            </li>
            <li>
              <Link href="/let-s-talk">
                <div>Let&apos;s Talk</div>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="copyright">
          Copyright ©2026 Ecko Marketing&nbsp;&nbsp;. All Rights Reserved.{" "}
          <a
            target="_blank"
            aria-label="Designed by The LB Agency (opens in new window)"
            href="http://www.theLBagency.com"
            rel="noreferrer"
          >
            Designed by The LB Agency
          </a>
        </div>
      </div>
    </footer>
  );
}
