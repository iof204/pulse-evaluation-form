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
import {
  detailedIndustryLens,
  detailedResultCopy,
  detailedSectionReminder,
} from "./detailedResultsData";
export type ResultsEmailInput = {
  firstName: string;
  businessName?: string;
  industry?: string;
  evaluated: EvaluatedSection[];
  evaluationUrl?: string;
  strategyUrl?: string;
  marketingConsent?: boolean;
  tapInUrl?: string;
  logoUrl?: string;
  strategyPortraitUrl?: string;
};

export const DEFAULT_EVALUATION_URL = "https://post-evaluation-form-v2.vercel.app/v2";
export const DEFAULT_STRATEGY_URL = "https://post-evaluation-form-v2.vercel.app/api/strategy-click";
export const SHARE_COPY =
  "Take the Ecko Marketing Pulse Evaluation—a quick check-in to see what's working, what's building momentum, and what could use a little love.";

export const EMAIL_LOGO_URL =
  "https://post-evaluation-form-v2.vercel.app/images/ecko-marketing-logo-white.png";

const EMAIL_HEADER_BACKGROUND_URL =
  "https://d14tal8bchn59o.cloudfront.net/7gvsByA2FkjMhlZ01HMeNk7Hl4qZ75zsA-rtRvozMXw/w:1920/plain/https://02f0a56ef46d93f03c90-22ac5f107621879d5667e0d7ed595bdb.ssl.cf2.rackcdn.com/sites/127849/photos/24256411/ECKO_MKTG_Background_no_logo__original.png";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] ?? character);

function emailHeaderHtml(logoUrl: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;border:0">
    <tr>
      <td bgcolor="#24102f" background="${EMAIL_HEADER_BACKGROUND_URL}" style="background-color:#24102f;background-image:url('${EMAIL_HEADER_BACKGROUND_URL}');background-position:center;background-repeat:no-repeat;background-size:cover;padding:14px 0;overflow:hidden">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="27%" valign="middle" style="width:27%;vertical-align:middle">
              &nbsp;
            </td>
            <td valign="middle" align="center" style="vertical-align:middle;text-align:center;white-space:nowrap">
              <img
                src="${logoUrl}"
                width="190"
                alt="Ecko Marketing"
                style="display:inline-block;width:190px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none"
              />
            </td>
            <td width="27%" valign="middle" align="right" style="width:27%;vertical-align:middle;text-align:right">
              &nbsp;
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function iconTheme(accentColor: string) {
  if (accentColor === "#c39f5b") return { background: "#f8efd8", color: "#c39f5b" };
  if (accentColor === "#9297a0") return { background: "#eef0f3", color: "#9297a0" };
  return { background: "#eee8f2", color: "#7c4d9e" };
}

function detailRowHtml({
  icon,
  title,
  body,
  accentColor,
  first = false,
}: {
  icon: EmailIconName;
  title: string;
  body: string;
  accentColor: string;
  first?: boolean;
}) {
  const theme = iconTheme(accentColor);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${first ? "" : "border-top:1px solid #eeeaf0"}">
    <tr>
      <td width="48" valign="top" style="width:48px;padding:16px 0;vertical-align:top">
        ${emailIconCircle(icon, theme.background, theme.color, 36)}
      </td>
      <td valign="top" style="padding:16px 0;vertical-align:top">
        <p style="margin:0;color:#33185c;font-size:14px;font-weight:700;line-height:1.4">${title}</p>
        <p style="margin:5px 0 0;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(body)}</p>
      </td>
    </tr>
  </table>`;
}

function sectionDetailHtml(section: EvaluatedSection, accentColor: string) {
  const detail = detailedResultCopy[section.key][section.level];
  const label = section.snapshots[section.level].label;
  const theme = iconTheme(accentColor);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border:1px solid #e3e0e5;border-radius:12px;background:#ffffff;box-shadow:0 12px 28px rgba(34,18,51,.1)">
    <tr>
      <td style="padding:20px 20px 16px;border-bottom:1px solid #eeeaf0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="52" valign="top" style="width:52px;padding-top:2px;vertical-align:top">
              ${sectionEmailIcon(section.key, theme.background, theme.color)}
            </td>
            <td valign="top" style="vertical-align:top">
              <h4 style="margin:0;color:#33185c;font-size:20px;font-weight:600;line-height:1.3">${escapeHtml(section.name)}</h4>
              <p style="margin:5px 0 0;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(detailedSectionReminder[section.key])}</p>
            </td>
            <td valign="top" style="width:1%;padding-left:12px;vertical-align:top;white-space:nowrap">
              <span style="display:inline-block;padding:7px 10px;border-radius:8px;background:${theme.background};color:${theme.color};font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">${escapeHtml(label)}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:18px 24px 24px">
        ${detailRowHtml({ icon: "eye", title: "What This Tells Us", body: detail.seeing, accentColor, first: true })}
        ${detailRowHtml({ icon: "chart-line", title: "Why This Matters", body: detail.matters, accentColor })}
        ${detailRowHtml({ icon: "star", title: "Something to Think About", body: detail.reflection, accentColor })}
        ${detailRowHtml({ icon: "binoculars", title: "Industry Lens", body: detailedIndustryLens[section.key], accentColor })}
              ${detail.toolTip ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;border:1px solid ${accentColor};border-radius:12px;background:${theme.background};box-shadow:0 10px 24px rgba(34,18,51,.1)">
                <tr>
                  <td width="52" valign="top" style="width:52px;padding:18px 0 18px 16px;vertical-align:top">
                    ${emailIconCircle("star", "#ffffff", theme.color, 36)}
                  </td>
                  <td valign="top" style="padding:18px 18px 18px 8px;vertical-align:top">
                    <p style="margin:0;color:#33185c;font-size:14px;font-weight:700;line-height:1.4">Ecko Tool Tip</p>
                    <p style="margin:3px 0 0;color:${accentColor};font-size:12px;font-weight:600;line-height:1.5">Strategy first. Tools second.</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:9px"><tr><td valign="top" style="padding-right:7px;color:${accentColor};font-family:Georgia,'Times New Roman',serif;font-size:25px;line-height:1">&ldquo;</td><td style="color:#544b5a;font-size:13px;line-height:1.65">${escapeHtml(detail.toolTip)}</td></tr></table>
                  </td>
                </tr>
              </table>` : ""}
      </td>
    </tr>
  </table>`;
}

function categoryCardHtml({
  title,
  summary,
  badge,
  accentColor,
  headerIcon,
  headerIconBackground,
  headerIconColor,
  sections,
  emptyMessage,
}: {
  title: string;
  summary: string;
  badge: string;
  accentColor: string;
  headerIcon: EmailIconName;
  headerIconBackground: string;
  headerIconColor: string;
  sections: EvaluatedSection[];
  emptyMessage: string;
}) {
  const combinedTitleHtml =
    title === badge
      ? escapeHtml(title)
      : `${escapeHtml(title)} <span style="padding:0 7px;color:#b7afb9;font-weight:400">|</span> ${escapeHtml(badge)}`;
  const sectionHtml = sections.length
    ? sections.map((section) => sectionDetailHtml(section, accentColor)).join("")
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border:1px solid #e3e0e5;border-radius:12px;background:#ffffff"><tr><td style="padding:20px 24px;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(emptyMessage)}</td></tr></table>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px">
    <tr>
      <td style="padding:0 28px;text-align:center">
        <div style="text-align:center">
          ${emailIconCircle(headerIcon, headerIconBackground, headerIconColor, 64, undefined, true)}
        </div>
        <h3 style="margin:14px 0 0;color:${accentColor};font-family:Poppins,'DM Sans',Arial,Helvetica,sans-serif;font-size:26px;font-weight:600;line-height:1.25;text-align:center">${combinedTitleHtml}</h3>
        <p style="margin:10px auto 0;max-width:520px;color:#544b5a;font-size:15px;line-height:1.65;text-align:center">${escapeHtml(summary)}</p>
      </td>
    </tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td height="10" style="height:10px;line-height:10px;font-size:0">&nbsp;</td></tr></table>
  ${sectionHtml}`;
}

function pulseAtGlanceHtml(counts: ReturnType<typeof countLevels>) {
  const items = [
    { label: "Strong Foundation", description: "Solid strengths to build on.", count: counts.strong, icon: "thumbs-up" as const, background: "#f8efd8", color: "#c39f5b" },
    { label: "Building Momentum", description: "Progress with room to grow.", count: counts.building, icon: "chart-line" as const, background: "#eef0f3", color: "#9297a0" },
    { label: "Needs a Little Love", description: "Areas where focused support can help.", count: counts["needs-love"], icon: "retention" as const, background: "#eee8f2", color: "#7c4d9e" },
  ];

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border:1px solid #e3e0e5;border-radius:12px;background:#ffffff;box-shadow:0 14px 36px rgba(34,18,51,.12)">
    <tr>
      <td style="padding:26px 18px 22px;text-align:center">
        <h2 style="margin:0;color:#33185c;font-family:Poppins,'DM Sans',Arial,Helvetica,sans-serif;font-size:20px;font-weight:600;line-height:1.3">Your Marketing Pulse at a Glance</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px">
          <tr>
            ${items.map((item, index) => `<td width="33.33%" valign="top" style="width:33.33%;padding:0 10px;vertical-align:top;text-align:center;${index ? "border-left:1px solid #eeeaf0" : ""}">
              <div style="text-align:center">${emailIconCircle(item.icon, item.background, item.color, 56)}</div>
              <p style="margin:10px 0 0;color:#33185c;font-size:14px;font-weight:700;line-height:1.35">${item.label}</p>
              <p style="margin:7px 0 0;color:#6f6575;font-size:12px;line-height:1.5">${item.description}</p>
              <p style="margin:12px 0 0;color:${item.color};font-size:28px;font-weight:700;line-height:1">${item.count}</p>
            </td>`).join("")}
          </tr>
        </table>
        <p style="max-width:540px;margin:34px auto 0;color:#544b5a;font-size:14px;line-height:1.65">Every business is a work in progress. These results simply highlight where you&rsquo;re shining, where momentum is building, and where a little extra attention could make the biggest difference.</p>
      </td>
    </tr>
  </table>`;
}

function perspectiveCardHtml(evaluated: EvaluatedSection[]) {
  const perspective = getPerspective(countLevels(evaluated));
  const needsLove = evaluated.filter((section) => section.level === "needs-love");
  const building = evaluated.filter((section) => section.level === "building");
  const focusSections = (needsLove.length ? needsLove : building).slice(0, 2);
  const focusHtml = focusSections.length
    ? `<p style="margin:20px 0 8px;color:#3b5f8f;font-size:13px;font-weight:700;letter-spacing:.04em;line-height:1.4;text-transform:uppercase">Areas Worth a Closer Look</p>
      ${focusSections.map((section) => `<p style="margin:12px 0 0;color:#33185c;font-size:14px;font-weight:700;line-height:1.45">${escapeHtml(section.name)}</p>
      <p style="margin:4px 0 0;color:#544b5a;font-size:14px;line-height:1.65">This is one of the areas your results suggest may be worth a closer look as you think about where to focus your marketing attention next.</p>`).join("")}`
    : "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border:1px solid #e3e0e5;border-radius:12px;background:#ffffff;box-shadow:0 14px 36px rgba(34,18,51,.12)">
    <tr>
      <td style="padding:24px 24px 20px">
        ${iconSectionRowHtml({
          icon: "eye",
          background: "#e6eef6",
          color: "#3b5f8f",
          title: "Your Ecko Perspective",
          titleColor: "#3b5f8f",
          bodyHtml: `<p style="margin:14px 0 0;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(perspective)}</p>
          ${focusHtml}
          <p style="margin:20px 0 0;color:#33185c;font-size:14px;font-weight:700;line-height:1.65">The goal is not to add more marketing. It&rsquo;s to make the marketing that matters easier to manage.</p>`,
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
          bodyHtml: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:14px"><tr><td valign="top" style="padding-right:8px;color:#7c4d9e;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1">&ldquo;</td><td style="color:#544b5a;font-size:14px;line-height:1.65">Your Marketing Pulse is a snapshot of where your marketing stands today, not a finish line. Keep evolving, elevate what&rsquo;s working, adjust what isn&rsquo;t, and let the strongest parts echo.</td></tr></table>`,
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

function tapInBlockHtml(tapInUrl: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border:1px solid #e3e0e5;border-radius:12px;background:#ffffff;box-shadow:0 14px 36px rgba(34,18,51,.12)">
    <tr>
      <td style="padding:24px 24px 20px">
        <h2 style="margin:0;color:#33185c;font-size:20px;font-weight:600;line-height:1.3">Want to stay tapped in?</h2>
        <p style="margin:14px 0 0;color:#544b5a;font-size:14px;line-height:1.65">Tap in to what&rsquo;s moving in marketing &mdash; from practical ideas and trends we&rsquo;re watching to takeaways from Marketing Real Talk by Ecko, Ecko updates, things worth questioning, and the occasional thing we think deserves a spot on your radar.</p>
        <div style="margin-top:20px;text-align:center">
          <a href="${tapInUrl}" style="display:inline-block;padding:12px 34px;border-radius:16px;background:#7c4d9e;box-shadow:0 4px 12px rgba(0,0,0,.24);color:#ffffff;font-size:15px;font-weight:500;text-decoration:none">Tap In</a>
        </div>
      </td>
    </tr>
  </table>`;
}

function strategyBlockHtml(strategyUrl: string, portraitUrl: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:42px;background:#ffffff;box-shadow:0 14px 36px rgba(34,18,51,.16)">
    <tr>
      <td class="strategy-copy" width="50%" valign="middle" style="width:50%;vertical-align:middle;text-align:left">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:30px 30px 30px 26px">
              ${emailIconCircle("phone", "#eee8f2", "#7c4d9e", 56)}
              <h2 style="margin:18px 0 0;color:#33185c;font-size:20px;font-weight:600;line-height:1.35">Want to Talk It Through Instead?</h2>
              <p style="margin:14px 0 0;color:#544b5a;font-size:14px;line-height:1.65">Sometimes the hard part isn&rsquo;t seeing the gap&mdash;it&rsquo;s figuring out where to start, how the pieces should work together, or how to actually get it done while running a business. That&rsquo;s where Ecko can be your marketing sidekick. Let&rsquo;s spark some ideas.</p>
              <div style="margin-top:22px;text-align:left">
                <a href="${strategyUrl}" style="display:inline-block;padding:12px 20px;border-radius:16px;background:#7c4d9e;box-shadow:0 4px 12px rgba(0,0,0,.24);color:#ffffff;font-size:15px;font-weight:500;text-decoration:none">Book A Strategy Spark Sesh</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
      <td class="strategy-image" width="50%" valign="middle" background="${portraitUrl}" style="width:50%;vertical-align:middle;overflow:hidden;background-color:#321c58;background-image:url('${portraitUrl}');background-position:center;background-repeat:no-repeat;background-size:cover">
        <img src="${portraitUrl}" width="340" height="440" alt="Ecko Marketing strategist" style="display:block;width:100%;max-width:none;height:100%;min-height:100%;object-fit:cover;object-position:center;border:0;outline:none;text-decoration:none" />
      </td>
    </tr>
  </table>`;
}

function shareBlockHtml(evaluationUrl: string) {
  const encodedEvaluationUrl = encodeURIComponent(evaluationUrl);
  const encodedShareCopy = encodeURIComponent(SHARE_COPY);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px">
    <tr>
      <td style="padding:0 8px 6px;text-align:center">
        <h2 style="margin:0;color:#33185c;font-size:20px;font-weight:600;line-height:1.3">Pass the Pulse Along</h2>
        <p style="max-width:480px;margin:7px auto 18px;color:#544b5a;font-size:14px;line-height:1.65">Know someone who could use a clearer read on their marketing? Share the Marketing Pulse Evaluation and help them find their rhythm.</p>
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
  marketingConsent = false,
  tapInUrl,
  logoUrl = EMAIL_LOGO_URL,
  strategyPortraitUrl = "https://post-evaluation-form-v2.vercel.app/images/strategy-spark-email.webp",
}: ResultsEmailInput) {
  const strongSections = evaluated.filter((section) => section.level === "strong");
  const focusSections = evaluated.filter((section) => section.level === "needs-love");
  const buildingSections = evaluated.filter((section) => section.level === "building");
  const counts = countLevels(evaluated);
  const tapInHtml = !marketingConsent && tapInUrl ? tapInBlockHtml(tapInUrl) : "";

  const cards = [
    categoryCardHtml({
      title: "What's Clicking",
      summary: "These are the areas where your marketing appears to have a strong foundation already. Keep building on what's working.",
      badge: "Strong Foundation",
      accentColor: "#c39f5b",
      headerIcon: "thumbs-up",
      headerIconBackground: "#f8efd8",
      headerIconColor: "#c39f5b",
      sections: strongSections,
      emptyMessage: "No areas landed here this time.",
    }),
    categoryCardHtml({
      title: "Building Momentum",
      summary: "These areas have good pieces in place, with opportunities to create more clarity, consistency, or connection.",
      badge: "Building Momentum",
      accentColor: "#9297a0",
      headerIcon: "chart-line",
      headerIconBackground: "#eef0f3",
      headerIconColor: "#9297a0",
      sections: buildingSections,
      emptyMessage: "No areas landed here this time.",
    }),
    categoryCardHtml({
      title: "Where to Focus Next",
      summary: "These areas could use a little extra attention. Small improvements here can create a big impact on your results.",
      badge: "Needs a Little Love",
      accentColor: "#7c4d9e",
      headerIcon: "target-dart",
      headerIconBackground: "#eee8f2",
      headerIconColor: "#7c4d9e",
      sections: focusSections,
      emptyMessage:
        "Nothing here is waving a red flag, but these areas may have the most room to become clearer, more intentional, or easier to manage.",
    }),
  ];

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your Full Marketing Pulse Evaluation</title>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Poppins:wght@400;500;600;700&amp;display=swap');
      @media only screen and (max-width: 560px) {
        .strategy-copy, .strategy-image { display:block !important; width:100% !important; }
        .strategy-image img { max-width:100% !important; height:auto !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#FBF7F3">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7F3;margin:0;padding:0;font-family:'DM Sans',Arial,Helvetica,sans-serif">
      <tr>
        <td align="center" style="padding:0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;background:#FBF7F3">
            <tr>
              <td style="padding:0">${emailHeaderHtml(logoUrl)}</td>
            </tr>
            <tr>
              <td align="left" style="padding:56px 16px 8px;text-align:left">
                <h1 style="margin:0;color:#2c1235;font-family:Poppins,'DM Sans',Arial,Helvetica,sans-serif;font-size:34px;font-weight:600;line-height:1.15;text-align:center">Your Full Marketing Pulse</h1>
                <p style="max-width:560px;margin:16px auto 0;color:#544b5a;font-size:16px;line-height:1.6;text-align:center">A deeper look at what your answers may be telling you, why it matters, and where there may be room to strengthen your marketing.</p>
                <p style="margin:18px 0 38px;text-align:center"><span style="display:inline-block;padding-bottom:7px;border-bottom:2px solid #7c4d9e;color:#7c4d9e;font-family:'Segoe Script','Brush Script MT','Snell Roundhand',cursive;font-size:24px;font-weight:600;line-height:1.2">Evolve. Elevate. Then Echo.</span></p>
                <h2 style="margin:0;color:#2c1235;font-family:Poppins,'DM Sans',Arial,Helvetica,sans-serif;font-size:24px;font-weight:600;line-height:1.35">Hi ${escapeHtml(firstName)},</h2>
                <p style="margin:16px 0 0;color:#544b5a;font-size:16px;line-height:1.65;text-align:left">Your results aren&rsquo;t a grade, and there isn&rsquo;t one perfect marketing formula. This deeper look is designed to help you better understand the patterns behind your answers, why they may matter, and where there may be opportunities to strengthen your marketing.</p>
                <p style="margin:16px 0 0;color:#544b5a;font-size:16px;line-height:1.65;text-align:left">Think of it as a clearer view of where your marketing stands today, not a prescription for what you &ldquo;should&rdquo; be doing.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 16px 40px">${pulseAtGlanceHtml(counts)}${cards.join("")}${perspectiveCardHtml(evaluated)}${reminderCardHtml()}${tapInHtml}${strategyBlockHtml(strategyUrl, strategyPortraitUrl)}${shareBlockHtml(evaluationUrl)}${footerHtml(businessName, industry)}</td>
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
  marketingConsent = false,
  tapInUrl,
}: ResultsEmailInput) {
  const counts = countLevels(evaluated);
  const perspective = getPerspective(counts);
  const needsLove = evaluated.filter((section) => section.level === "needs-love");
  const building = evaluated.filter((section) => section.level === "building");
  const focusSections = (needsLove.length ? needsLove : building).slice(0, 2);
  const sectionLines = evaluated.flatMap(({ key, name, snapshots, level }) => {
    const snapshot = snapshots[level];
    const detail = detailedResultCopy[key][level];
    return [
      `${name} — ${snapshot.label}`,
      detailedSectionReminder[key],
      `What This Tells Us: ${detail.seeing}`,
      `Why This Matters: ${detail.matters}`,
      `Something to Think About: ${detail.reflection}`,
      `Industry Lens: ${detailedIndustryLens[key]}`,
      detail.toolTip ? `Ecko Tool Tip — Strategy first. Tools second.: ${detail.toolTip}` : "",
      "",
    ].filter(Boolean);
  });

  return [
    `Hi ${firstName},`,
    "",
    "YOUR MARKETING PULSE AT A GLANCE",
    `Strong Foundation: ${counts.strong} of 7`,
    `Building Momentum: ${counts.building} of 7`,
    `Needs a Little Love: ${counts["needs-love"]} of 7`,
    "",
    ...sectionLines,
    "Your Ecko Perspective",
    perspective,
    focusSections.length ? "Areas Worth a Closer Look" : "",
    ...focusSections.flatMap((section) => [section.name, "This area may be worth a closer look as you think about where to focus your marketing attention next."]),
    "The goal is not to add more marketing. It's to make the marketing that matters easier to manage.",
    "",
    "Evolve. Elevate. Then Echo.",
    "",
    "Want to Talk It Through Instead?",
    "Sometimes the hard part isn't seeing the gap—it's figuring out where to start, how the pieces should work together, or how to actually get it done while running a business. That's where Ecko can be your marketing sidekick. Let's spark some ideas.",
    `Book A Strategy Spark Sesh: ${strategyUrl}`,
    "",
    !marketingConsent && tapInUrl ? "Want to stay tapped in?" : "",
    !marketingConsent && tapInUrl ? "Tap into Ecko's Marketing Lens for helpful marketing insights, trends, and Marketing Real Talk takeaways, straight to your inbox." : "",
    !marketingConsent && tapInUrl ? `Tap In: ${tapInUrl}` : "",
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
    tapInUrl: "/tap-in",
    strategyPortraitUrl: "/images/strategy-spark-email.webp",
  };
}
