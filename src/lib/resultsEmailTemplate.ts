import {
  countLevels,
  evaluateSections,
  getPerspective,
  sampleEmailResponses,
  type EvaluatedSection,
  type Responses,
} from "./evaluateResults";
import {
  emailIconCircle,
  iconSectionRowHtml,
  sectionEmailIcon,
  type EmailIconName,
} from "./emailIcons";
type CategoryLensKey = "clicking" | "building" | "focus";

const industryLensCopy: Record<CategoryLensKey, string> = {
  clicking:
    "Clarity and consistency are a top driver of trust across most industries.",
  building:
    "Across industries, steady improvement in a few key areas usually creates more momentum than spreading effort thin.",
  focus:
    "In most industries, the biggest gains come from tightening the areas that create the most friction for customers.",
};

export type ResultsEmailInput = {
  firstName: string;
  businessName?: string;
  industry?: string;
  evaluated: EvaluatedSection[];
  evaluationUrl?: string;
  strategyUrl?: string;
};

export const DEFAULT_EVALUATION_URL = "https://post-evaluation-form-v2.vercel.app/v2";
export const DEFAULT_STRATEGY_URL = "tel:+17023774261";
export const SHARE_COPY =
  "Take the Ecko Marketing Pulse Evaluation—a quick check-in to see what's working, what's building momentum, and what could use a little love.";

export const EMAIL_LOGO_URL =
  "https://d14tal8bchn59o.cloudfront.net/tT8kTKStgAOAqD3CF-vqwSdDxRBYUlCtZatT91hBmrM/w:1920/plain/https%3A%2F%2F02f0a56ef46d93f03c90-22ac5f107621879d5667e0d7ed595bdb.ssl.cf2.rackcdn.com%2Fsites%2F127849%2Fphotos%2F24248554%2FEK_Ecko_Logo_%2528Page_1%2529_original.png";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] ?? character);

function emailHeaderHtml() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;border:0;border-bottom:1px solid #eeeaf0">
    <tr>
      <td bgcolor="#ffffff" style="background-color:#ffffff;padding:16px 24px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td valign="middle" style="vertical-align:middle">
              <img
                src="${EMAIL_LOGO_URL}"
                width="168"
                alt="Ecko Marketing"
                style="display:block;width:168px;max-width:50%;height:auto;border:0;outline:none;text-decoration:none"
              />
            </td>
            <td valign="middle" align="right" style="vertical-align:middle;text-align:right;padding-left:16px">
              <p style="margin:0;color:#7c4d9e;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;line-height:1.3">
                Your Marketing Pulse
              </p>
              <p style="margin:6px 0 0;color:#33185c;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;line-height:1.25">
                Detailed Results
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function iconTheme(accentColor: string) {
  if (accentColor === "#d4a017") return { background: "#f8efd8", color: "#d4a017" };
  if (accentColor === "#c45c5c") return { background: "#fde8e8", color: "#c45c5c" };
  return { background: "#eee8f2", color: "#7c4d9e" };
}

function sectionDetailHtml(section: EvaluatedSection, accentColor: string, isFirst = false) {
  const snapshot = section.snapshots[section.level];
  const theme = iconTheme(accentColor);
  const topBorder = isFirst ? "border-top:0" : "border-top:1px solid #eeeaf0";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${topBorder}">
    <tr>
      <td style="padding:20px 4px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="46" valign="top" style="width:46px;padding-top:2px;vertical-align:top">
              ${sectionEmailIcon(section.key, theme.background, theme.color)}
            </td>
            <td valign="top" style="vertical-align:top">
              <h4 style="margin:0;color:${accentColor};font-size:18px;font-weight:600;line-height:1.3">${escapeHtml(section.name)}</h4>
              <p style="margin:4px 0 10px;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(section.reminder)}</p>
              <p style="margin:9px 0 0;color:${accentColor};font-size:14px;font-weight:700;line-height:1.4">What we&rsquo;re seeing</p>
              <p style="margin:4px 0 10px;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(snapshot.seeing)}</p>
              <p style="margin:9px 0 0;color:${accentColor};font-size:14px;font-weight:700;line-height:1.4">Why it matters</p>
              <p style="margin:4px 0 16px;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(snapshot.matters)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function industryLensHtml(lensKey: CategoryLensKey, isFirst = false) {
  const topBorder = isFirst ? "border-top:0" : "border-top:1px solid #eeeaf0";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${topBorder}">
    <tr>
      <td style="padding:20px 4px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="46" valign="top" style="width:46px;padding-top:2px;vertical-align:top">
              ${emailIconCircle("binoculars", "#eee8f2", "#7c4d9e", 36)}
            </td>
            <td valign="top" style="vertical-align:top">
              <h4 style="margin:0;color:#33185c;font-size:18px;font-weight:600;line-height:1.3">Industry Lens</h4>
              <p style="margin:4px 0 16px;color:#33185c;font-size:14px;line-height:1.65">${escapeHtml(industryLensCopy[lensKey])}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function categoryCardHtml({
  title,
  summary,
  badge,
  badgeBackground,
  badgeColor,
  accentColor,
  headerIcon,
  headerIconBackground,
  headerIconColor,
  sections,
  emptyMessage,
  industryLensKey,
}: {
  title: string;
  summary: string;
  badge: string;
  badgeBackground: string;
  badgeColor: string;
  accentColor: string;
  headerIcon: EmailIconName;
  headerIconBackground: string;
  headerIconColor: string;
  sections: EvaluatedSection[];
  emptyMessage: string;
  industryLensKey: CategoryLensKey;
}) {
  const sectionHtml = sections.length
    ? sections
        .map((section, index) => sectionDetailHtml(section, accentColor, index === 0))
        .join("")
    : `<p style="margin:0;padding:20px 4px 16px;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(emptyMessage)}</p>`;
  const lensHtml = industryLensHtml(industryLensKey);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border:1px solid #e3e0e5;border-radius:12px;background:#ffffff;box-shadow:0 14px 36px rgba(34,18,51,.12)">
    <tr>
      <td style="padding:18px 18px 14px;border-bottom:1px solid #eeeaf0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="68" valign="top" style="width:68px;padding-right:12px;vertical-align:top">
              ${emailIconCircle(headerIcon, headerIconBackground, headerIconColor, 56)}
            </td>
            <td style="vertical-align:top">
              <h3 style="margin:0;color:${accentColor};font-size:20px;font-weight:600;line-height:1.3">${escapeHtml(title)}</h3>
              <p style="margin:7px 0 0;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(summary)}</p>
            </td>
            <td style="width:1%;padding-left:16px;vertical-align:top;white-space:nowrap">
              <span style="display:inline-block;padding:8px 12px;border-radius:8px;background:${badgeBackground};color:${badgeColor};font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase">${escapeHtml(badge)}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 8px">${sectionHtml}${lensHtml}</td>
    </tr>
  </table>`;
}

function perspectiveCardHtml() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border:1px solid #e3e0e5;border-radius:12px;background:#ffffff;box-shadow:0 14px 36px rgba(34,18,51,.12)">
    <tr>
      <td style="padding:24px 24px 20px">
        ${iconSectionRowHtml({
          icon: "eye",
          background: "#e6eef6",
          color: "#3b5f8f",
          title: "A Little Context",
          titleColor: "#3b5f8f",
          bodyHtml: `<p style="margin:14px 0 0;color:#33185c;font-size:14px;font-weight:700;line-height:1.65">Your results aren&rsquo;t a grade, and there isn&rsquo;t one perfect marketing formula.</p>
        <p style="margin:12px 0 0;color:#544b5a;font-size:14px;line-height:1.65">This deeper look is designed to help you better understand the patterns behind your answers, why they may matter, and where there may be opportunities to strengthen your marketing. Think of it as a clearer view of where your marketing stands today &mdash; not a prescription for what you &ldquo;should&rdquo; be doing.</p>`,
        })}
      </td>
    </tr>
  </table>`;
}

function reminderCardHtml() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border:1px solid #e3e0e5;border-radius:12px;background:#ffffff;box-shadow:0 14px 36px rgba(34,18,51,.12)">
    <tr>
      <td style="padding:24px 24px 12px">
        ${iconSectionRowHtml({
          icon: "star",
          background: "#eee8f2",
          color: "#7c4d9e",
          title: "One Last Ecko Reminder",
          titleColor: "#7c4d9e",
          bodyHtml: `<p style="margin:14px 0 0;color:#544b5a;font-size:14px;line-height:1.65">Your Marketing Pulse is a snapshot of where your marketing stands today, not a finish line. Keep evolving, elevate what&rsquo;s working, adjust what isn&rsquo;t, and let the strongest parts echo.</p>`,
        })}
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 24px;text-align:center">
        <span style="display:inline-block;padding-bottom:8px;border-bottom:2px solid #7c4d9e;color:#7c4d9e;font-size:24px;line-height:1.2;font-family:'Segoe Script','Brush Script MT',cursive">Evolve. Elevate. Then Echo.</span>
      </td>
    </tr>
  </table>`;
}

function strategyBlockHtml(strategyUrl: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:42px;background:#321c58">
    <tr>
      <td style="padding:30px 28px;text-align:left">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="68" valign="top" style="width:68px;padding-right:12px;vertical-align:top">
              ${emailIconCircle("calendar-days", "#ffffff", "#7c4d9e", 56)}
            </td>
            <td valign="top" style="vertical-align:top">
              <h2 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;line-height:1.35">Want to Talk It Through Instead?</h2>
              <p style="margin:14px 0 0;color:rgba(255,255,255,.78);font-size:14px;line-height:1.65">Sometimes the hard part isn&rsquo;t seeing the gap&mdash;it&rsquo;s figuring out where to start, how the pieces should work together, or how to actually get it done while running a business. That&rsquo;s where Ecko can be your marketing sidekick. Let&rsquo;s spark some ideas.</p>
            </td>
          </tr>
        </table>
        <div style="margin-top:24px;text-align:center">
          <a href="${strategyUrl}" style="display:inline-block;padding:12px 24px;border-radius:16px;background:#7c4d9e;box-shadow:0 4px 12px rgba(0,0,0,.3);color:#ffffff;font-size:16px;font-weight:400;text-decoration:none">Book A Strategy Spark Sesh</a>
        </div>
      </td>
    </tr>
  </table>`;
}

function shareBlockHtml(evaluationUrl: string) {
  const encodedEvaluationUrl = encodeURIComponent(evaluationUrl);
  const encodedShareCopy = encodeURIComponent(SHARE_COPY);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px">
    <tr>
      <td style="padding:0 8px 6px;text-align:left">
        <h2 style="margin:0;color:#33185c;font-size:20px;font-weight:600;line-height:1.3">Pass the Pulse Along</h2>
        <p style="max-width:480px;margin:7px 0 18px;color:#544b5a;font-size:14px;line-height:1.65">Know someone who could use a clearer read on their marketing? Share the Marketing Pulse Evaluation and help them find their rhythm.</p>
        <a href="mailto:?subject=${encodeURIComponent("Take the Ecko Marketing Pulse Evaluation")}&amp;body=${encodedShareCopy}%0A%0A${encodedEvaluationUrl}" style="display:inline-block;width:38px;height:38px;margin:0 8px 8px 0;border:1px solid #ddd4e3;border-radius:50%;background:#fff;color:#633485;font-size:18px;font-weight:600;line-height:38px;text-align:center;text-decoration:none">&#9993;</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedEvaluationUrl}" style="display:inline-block;width:38px;height:38px;margin:0 8px 8px 0;border:1px solid #ddd4e3;border-radius:50%;background:#fff;color:#633485;font-family:Arial,sans-serif;font-size:18px;font-weight:700;line-height:38px;text-align:center;text-decoration:none">f</a>
        <a href="https://x.com/intent/post?url=${encodedEvaluationUrl}&amp;text=${encodedShareCopy}" style="display:inline-block;width:38px;height:38px;margin:0 8px 8px 0;border:1px solid #ddd4e3;border-radius:50%;background:#fff;color:#633485;font-family:Arial,sans-serif;font-size:17px;font-weight:600;line-height:38px;text-align:center;text-decoration:none">&#120143;</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedEvaluationUrl}" style="display:inline-block;width:38px;height:38px;margin:0 0 8px;border:1px solid #ddd4e3;border-radius:50%;background:#fff;color:#633485;font-family:Arial,sans-serif;font-size:14px;font-weight:700;line-height:38px;text-align:center;text-decoration:none">in</a>
      </td>
    </tr>
  </table>`;
}

function footerHtml(businessName?: string, industry?: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:32px 8px;text-align:center;color:#321c58">
        <strong>Your marketing has a pulse. Now let&rsquo;s help it get stronger.</strong>
        <p style="margin:6px 0 0;color:#7c4d9e">Evolve. Elevate. Then Echo!</p>
        ${businessName ? `<p style="margin:18px 0 0;color:#817889;font-size:12px">Prepared for ${escapeHtml(businessName)} &middot; ${escapeHtml(industry ?? "")}</p>` : ""}
      </td>
    </tr>
  </table>`;
}

export function buildResultsEmailHtml({
  firstName,
  businessName,
  industry,
  evaluated,
  evaluationUrl = DEFAULT_EVALUATION_URL,
  strategyUrl = DEFAULT_STRATEGY_URL,
}: ResultsEmailInput) {
  const strongSections = evaluated.filter((section) => section.level === "strong");
  const focusSections = evaluated.filter((section) => section.level === "needs-love");
  const buildingSections = evaluated.filter((section) => section.level === "building");
  const perspective = getPerspective(countLevels(evaluated));

  const cards = [
    categoryCardHtml({
      title: "What's Clicking",
      summary: "Top strengths you're doing well",
      badge: "Strong Foundation",
      badgeBackground: "#f8efd8",
      badgeColor: "#b8860b",
      accentColor: "#d4a017",
      headerIcon: "thumbs-up",
      headerIconBackground: "#f8efd8",
      headerIconColor: "#d4a017",
      sections: strongSections,
      emptyMessage: "No areas landed here this time.",
      industryLensKey: "clicking",
    }),
    categoryCardHtml({
      title: "Building Momentum",
      summary: "Areas that are moving in the right direction",
      badge: "Building Momentum",
      badgeBackground: "#eee8f2",
      badgeColor: "#7c4d9e",
      accentColor: "#7c4d9e",
      headerIcon: "chart-line",
      headerIconBackground: "#eee8f2",
      headerIconColor: "#7c4d9e",
      sections: buildingSections,
      emptyMessage: "No areas landed here this time.",
      industryLensKey: "building",
    }),
    categoryCardHtml({
      title: "Where to Focus Next",
      summary: "Top areas for improvement",
      badge: "Needs a Little Love",
      badgeBackground: "#fde8e8",
      badgeColor: "#c45c5c",
      accentColor: "#c45c5c",
      headerIcon: "target-dart",
      headerIconBackground: "#fde8e8",
      headerIconColor: "#c45c5c",
      sections: focusSections,
      emptyMessage:
        "Nothing here is waving a red flag, but these areas may have the most room to become clearer, more intentional, or easier to manage.",
      industryLensKey: "focus",
    }),
  ];

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your Full Marketing Pulse Evaluation</title>
  </head>
  <body style="margin:0;padding:0;background:#ffffff">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif">
      <tr>
        <td align="center" style="padding:0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;background:#ffffff">
            <tr>
              <td style="padding:0">${emailHeaderHtml()}</td>
            </tr>
            <tr>
              <td align="left" style="padding:28px 24px 8px;text-align:left">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px">
                  <tr>
                    <td width="40" valign="middle" style="width:40px;padding-right:6px;vertical-align:middle">
                      ${emailIconCircle("eye", "#eee8f2", "#7c4d9e", 36)}
                    </td>
                    <td valign="middle" style="vertical-align:middle">
                      <p style="margin:0;color:#7c4d9e;font-size:18px;font-weight:600;line-height:1.3">Your Ecko Perspective</p>
                    </td>
                  </tr>
                </table>
                <h1 style="margin:0;color:#33185c;font-size:28px;font-weight:700;line-height:1.25;text-align:left">A Mixed Marketing Picture</h1>
                <p style="margin:14px 0 0;color:#544b5a;font-size:15px;line-height:1.65;text-align:left">Hi ${escapeHtml(firstName)}, here&rsquo;s your full Marketing Pulse evaluation.</p>
                <p style="margin:14px 0 0;color:#544b5a;font-size:15px;line-height:1.65;text-align:left">${escapeHtml(perspective)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 40px">${cards.join("")}${perspectiveCardHtml()}${reminderCardHtml()}${strategyBlockHtml(strategyUrl)}${shareBlockHtml(evaluationUrl)}${footerHtml(businessName, industry)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildResultsEmailText({
  firstName,
  businessName,
  industry,
  evaluated,
  evaluationUrl = DEFAULT_EVALUATION_URL,
  strategyUrl = DEFAULT_STRATEGY_URL,
}: ResultsEmailInput) {
  const perspective = getPerspective(countLevels(evaluated));
  const sectionLines = evaluated.flatMap(({ name, snapshots, level }) => {
    const snapshot = snapshots[level];
    return [
      `${name} — ${snapshot.label}`,
      `What we're seeing: ${snapshot.seeing}`,
      `Why it matters: ${snapshot.matters}`,
      "",
    ];
  });

  return [
    `Hi ${firstName},`,
    "",
    perspective,
    "",
    ...sectionLines,
    "Want to Talk It Through Instead?",
    "Sometimes the hard part isn't seeing the gap—it's figuring out where to start, how the pieces should work together, or how to actually get it done while running a business. That's where Ecko can be your marketing sidekick. Let's spark some ideas.",
    `Book A Strategy Spark Sesh: ${strategyUrl}`,
    "",
    "Pass the Pulse Along",
    SHARE_COPY,
    evaluationUrl,
    "",
    "Your marketing has a pulse. Now let's help it get stronger.",
    "Evolve. Elevate. Then Echo!",
    businessName ? `Prepared for ${businessName} · ${industry ?? ""}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildResultsEmailFromResponses(
  responses: Responses,
  details: Omit<ResultsEmailInput, "evaluated">,
) {
  const evaluated = evaluateSections(responses);
  return {
    evaluated,
    html: buildResultsEmailHtml({ ...details, evaluated }),
    text: buildResultsEmailText({ ...details, evaluated }),
  };
}

export function createSampleResultsEmailInput(): ResultsEmailInput {
  const evaluated = evaluateSections(sampleEmailResponses);
  return {
    firstName: "Alex",
    businessName: "Northline Studio",
    industry: "Professional Services",
    evaluated,
  };
}
