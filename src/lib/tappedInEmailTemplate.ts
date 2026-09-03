import { emailIconCircle } from "./emailIcons";
import {
  EMAIL_LOGO_URL,
  DEFAULT_STRATEGY_URL,
  emailHeaderHtml,
  footerHtml,
  shareBlockHtml,
  strategyBlockHtml,
} from "./resultsEmailTemplate";

export type TappedInEmailInput = {
  firstName?: string;
  businessName?: string;
  industry?: string;
  logoUrl?: string;
  strategyUrl?: string;
  strategyPortraitUrl?: string;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] ?? character);

export function buildTappedInEmailHtml({
  firstName,
  businessName,
  industry,
  logoUrl = EMAIL_LOGO_URL,
  strategyUrl = DEFAULT_STRATEGY_URL,
  strategyPortraitUrl = "https://post-evaluation-form-v2.vercel.app/images/strategy-spark-email.webp",
}: TappedInEmailInput = {}) {
  const greeting = firstName ? `, ${escapeHtml(firstName)}` : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>You&rsquo;re Tapped In</title>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Poppins:wght@400;500;600;700&amp;display=swap');
      .strategy-image img { width:100% !important; max-width:100% !important; height:auto !important; }
      @media only screen and (max-width: 560px) {
        .strategy-copy, .strategy-image { display:block !important; width:100% !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#FBF7F3">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7F3;margin:0;padding:0;font-family:'DM Sans',Arial,Helvetica,sans-serif">
      <tr>
        <td align="center" style="padding:0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;background:#FBF7F3">
            <tr><td style="padding:0">${emailHeaderHtml(logoUrl)}</td></tr>
            <tr>
              <td style="padding:56px 16px 8px;text-align:center">
                ${emailIconCircle("envelope", "#eee8f2", "#633485", 64)}
                <h1 style="margin:18px 0 0;color:#2c1235;font-family:Poppins,'DM Sans',Arial,Helvetica,sans-serif;font-size:34px;font-weight:600;line-height:1.15">You&rsquo;re tapped in${greeting}.</h1>
                <p style="max-width:520px;margin:18px auto 0;color:#544b5a;font-size:16px;line-height:1.65">Watch for occasional emails from Ecko&rsquo;s Marketing Lens.</p>
                <p style="max-width:540px;margin:16px auto 0;color:#544b5a;font-size:15px;line-height:1.65">We&rsquo;ll share practical ideas, trends we&rsquo;re watching, Marketing Real Talk takeaways, Ecko updates, and the occasional thing we think deserves a spot on your radar.</p>
                <p style="margin:24px 0 0"><span style="display:inline-block;padding-bottom:7px;border-bottom:2px solid #633485;color:#633485;font-family:'Segoe Script','Brush Script MT','Snell Roundhand',cursive;font-size:24px;font-weight:600;line-height:1.2">Evolve. Elevate. Then Echo.</span></p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 16px 40px">${strategyBlockHtml(strategyUrl, strategyPortraitUrl)}${shareBlockHtml("https://post-evaluation-form-v2.vercel.app/v2")}${footerHtml(businessName, industry)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildTappedInEmailText(firstName?: string, strategyUrl = DEFAULT_STRATEGY_URL) {
  return [
    `You're tapped in${firstName ? `, ${firstName}` : ""}.`,
    "",
    "Watch for occasional emails from Ecko's Marketing Lens.",
    "",
    "We'll share practical ideas, trends we're watching, Marketing Real Talk takeaways, Ecko updates, and the occasional thing we think deserves a spot on your radar.",
    "",
    "Want to Talk It Through Instead?",
    `Book A Strategy Spark Sesh: ${strategyUrl}`,
    "",
    "Evolve. Elevate. Then Echo.",
  ].join("\n");
}
