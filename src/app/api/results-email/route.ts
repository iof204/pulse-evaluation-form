import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { evaluationQuestions } from "../../questionnaireData";
import { perspectiveCopy, resultSections, type ResultLevel } from "../../resultsData";

type Responses = Record<number, string[]>;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] ?? character);

function evaluate(responses: Responses) {
  return resultSections.map((section) => {
    const score = section.questionIds.reduce((total, questionId) => {
      const question = evaluationQuestions.find(({ id }) => id === questionId);
      const answerId = responses[questionId]?.[0];
      return total + (question?.answers.find(({ id }) => id === answerId)?.score ?? 0);
    }, 0);
    const level: ResultLevel = score >= 7 ? "strong" : score >= 5 ? "building" : "needs-love";
    return { ...section, level };
  });
}

function getPerspective(levels: ResultLevel[]) {
  const counts = levels.reduce<Record<ResultLevel, number>>(
    (totals, level) => ({ ...totals, [level]: totals[level] + 1 }),
    { strong: 0, building: 0, "needs-love": 0 },
  );
  if (counts.strong === 7) return perspectiveCopy["all-strong"];
  if (counts.strong >= 5 && counts["needs-love"] === 0) return perspectiveCopy["strong-overall"];
  if (counts.strong >= 4 && counts["needs-love"] <= 2) return perspectiveCopy["strong-with-gaps"];
  if (counts.building >= 4 && counts["needs-love"] <= 2) return perspectiveCopy.building;
  if (counts["needs-love"] >= 4) return perspectiveCopy["several-needs-love"];
  return perspectiveCopy.mixed;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      firstName?: string;
      email?: string;
      businessName?: string;
      industry?: string;
      marketingConsent?: boolean;
      responses?: Responses;
    };
    const firstName = body.firstName?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const businessName = body.businessName?.trim() ?? "";
    const industry = body.industry?.trim() ?? "";
    if (!firstName || !industry || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const sender = process.env.GMAIL_SMTP_USER;
    const password = process.env.GMAIL_SMTP_APP_PASSWORD;
    if (!sender || !password) {
      return NextResponse.json({ error: "Email delivery is not configured." }, { status: 500 });
    }

    const evaluated = evaluate(body.responses ?? {});
    const perspective = getPerspective(evaluated.map(({ level }) => level));
    const sectionsHtml = evaluated.map(({ name, reminder, snapshots, level }) => {
      const snapshot = snapshots[level];
      return `<section style="margin-top:28px;padding:24px;border:1px solid #e7e1eb;border-radius:14px;background:#fff">
        <p style="margin:0;color:#7c4d9e;font-size:12px;font-weight:700">${escapeHtml(snapshot.label)}</p>
        <h2 style="margin:6px 0 0;color:#321c58;font-size:22px">${escapeHtml(name)}</h2>
        <p style="margin:7px 0 0;color:#766d7d;font-size:13px;line-height:1.6">${escapeHtml(reminder)}</p>
        <h3 style="margin:20px 0 6px;color:#7c4d9e;font-size:14px">What we’re seeing</h3>
        <p style="margin:0;color:#514759;font-size:14px;line-height:1.7">${escapeHtml(snapshot.seeing)}</p>
        <h3 style="margin:20px 0 6px;color:#7c4d9e;font-size:14px">Why it matters</h3>
        <p style="margin:0;color:#514759;font-size:14px;line-height:1.7">${escapeHtml(snapshot.matters)}</p>
      </section>`;
    }).join("");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: sender, pass: password },
    });
    await transporter.sendMail({
      from: `Ecko Marketing Pulse <${sender}>`,
      to: email,
      replyTo: sender,
      subject: "Your Full Marketing Pulse Evaluation",
      text: [`Hi ${firstName},`, "", perspective, "", ...evaluated.flatMap(({ name, snapshots, level }) => {
        const snapshot = snapshots[level];
        return [`${name} — ${snapshot.label}`, `What we're seeing: ${snapshot.seeing}`, `Why it matters: ${snapshot.matters}`, ""];
      }), "Your marketing has a pulse. Now let’s help it get stronger.", "Evolve. Elevate. Then Echo!"].join("\n"),
      html: `<div style="margin:0;background:#f7f4f9;padding:32px 16px;font-family:Arial,sans-serif"><main style="max-width:680px;margin:0 auto">
        <section style="padding:32px;border-radius:16px;background:#321c58;color:#fff">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Marketing Pulse Evaluation</p>
          <h1 style="margin:10px 0 0;font-size:30px;line-height:1.25">Hi ${escapeHtml(firstName)}, here’s your full pulse check.</h1>
          <p style="margin:16px 0 0;color:rgba(255,255,255,.82);font-size:15px;line-height:1.7">${escapeHtml(perspective)}</p>
        </section>${sectionsHtml}
        <footer style="padding:32px 8px;text-align:center;color:#321c58"><strong>Your marketing has a pulse. Now let’s help it get stronger.</strong><p style="margin:6px 0 0;color:#7c4d9e">Evolve. Elevate. Then Echo!</p>${businessName ? `<p style="margin:18px 0 0;color:#817889;font-size:12px">Prepared for ${escapeHtml(businessName)} · ${escapeHtml(industry)}</p>` : ""}</footer>
      </main></div>`,
      headers: { "X-Ecko-Marketing-Consent": body.marketingConsent ? "yes" : "no" },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to send Marketing Pulse results", error);
    return NextResponse.json({ error: "We couldn’t email your results. Please try again." }, { status: 500 });
  }
}
