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
    const evaluationUrl = "https://post-evaluation-form-v2.vercel.app/v2";
    const strategyUrl = "tel:+17023774261";
    const shareCopy = "Take the Ecko Marketing Pulse Evaluation—a quick check-in to see what's working, what's building momentum, and what could use a little love.";
    const encodedEvaluationUrl = encodeURIComponent(evaluationUrl);
    const encodedShareCopy = encodeURIComponent(shareCopy);
    const sectionsHtml = evaluated.map(({ name, reminder, snapshots, level }) => {
      const snapshot = snapshots[level];
      return `<section style="margin-top:28px;border:1px solid #e3e0e5;border-radius:12px;background:#fff;box-shadow:0 14px 36px rgba(34,18,51,.12);overflow:hidden">
        <div style="padding:20px 24px 17px;border-bottom:1px solid #eeeaf0">
          <h2 style="margin:0;color:#33185c;font-size:20px;font-weight:600;line-height:1.3">${escapeHtml(name)}</h2>
          <p style="margin:7px 0 0;color:#7c4d9e;font-size:13px;font-weight:600;line-height:1.5">${escapeHtml(snapshot.label)}</p>
        </div>
        <div style="padding:22px 28px 26px">
          <p style="margin:0 0 19px;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(reminder)}</p>
          <h3 style="margin:0 0 6px;color:#7c4d9e;font-size:14px;font-weight:700;line-height:1.4">What we’re seeing</h3>
          <p style="margin:0;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(snapshot.seeing)}</p>
          <h3 style="margin:20px 0 6px;color:#7c4d9e;font-size:14px;font-weight:700;line-height:1.4">Why it matters</h3>
          <p style="margin:0;color:#544b5a;font-size:14px;line-height:1.65">${escapeHtml(snapshot.matters)}</p>
        </div>
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
      }), "Know something needs attention, but not sure what to do next?", "Sometimes the hard part isn’t seeing the gap—it’s figuring out where to start, how the pieces should work together, or how to actually get it done while running a business. That’s where Ecko can be your marketing sidekick. Let’s spark some ideas.", "Book A Strategy Spark Sesh: +1 702-377-4261", "", "Pass the Pulse Along", "Know someone who could use a clearer read on their marketing? Share the Marketing Pulse Evaluation and help them find their rhythm.", evaluationUrl, "", "Your marketing has a pulse. Now let’s help it get stronger.", "Evolve. Elevate. Then Echo!"].join("\n"),
      html: `<div style="margin:0;background:#f7f4f9;padding:32px 16px;font-family:Arial,sans-serif"><main style="max-width:680px;margin:0 auto">
        <section style="padding:32px;border-radius:16px;background:#321c58;color:#fff">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Marketing Pulse Evaluation</p>
          <h1 style="margin:10px 0 0;font-size:30px;line-height:1.25">Hi ${escapeHtml(firstName)}, here’s your full pulse check.</h1>
          <p style="margin:16px 0 0;color:rgba(255,255,255,.82);font-size:15px;line-height:1.7">${escapeHtml(perspective)}</p>
        </section>${sectionsHtml}
        <section style="margin-top:42px;padding:32px 28px;background:#321c58;color:#fff;text-align:left">
          <h2 style="margin:0;color:#fff;font-size:20px;font-weight:600;line-height:1.35">Know something needs attention, but not sure what to do next?</h2>
          <p style="margin:14px 0 0;color:rgba(255,255,255,.78);font-size:14px;line-height:1.65">Sometimes the hard part isn’t seeing the gap—it’s figuring out where to start, how the pieces should work together, or how to actually get it done while running a business. That’s where Ecko can be your marketing sidekick. Let’s spark some ideas.</p>
          <div style="margin-top:24px;text-align:center"><a href="${strategyUrl}" style="display:inline-block;padding:13px 24px;border-radius:16px;background:#7c4d9e;box-shadow:0 4px 12px rgba(0,0,0,.3);color:#fff;font-size:16px;font-weight:400;text-decoration:none">Book A Strategy Spark Sesh</a></div>
        </section>
        <section style="margin-top:36px;padding:28px 8px 6px;text-align:left">
          <h2 style="margin:0;color:#33185c;font-size:20px;font-weight:600;line-height:1.3">Pass the Pulse Along</h2>
          <p style="max-width:480px;margin:7px 0 18px;color:#544b5a;font-size:14px;line-height:1.65">Know someone who could use a clearer read on their marketing? Share the Marketing Pulse Evaluation and help them find their rhythm.</p>
          <a href="mailto:?subject=${encodeURIComponent("Take the Ecko Marketing Pulse Evaluation")}&amp;body=${encodedShareCopy}%0A%0A${encodedEvaluationUrl}" title="Share by email" aria-label="Share by email" style="display:inline-block;width:38px;height:38px;margin:0 8px 8px 0;border:1px solid #ddd4e3;border-radius:50%;background:#fff;color:#633485;font-size:18px;font-weight:600;line-height:38px;text-align:center;text-decoration:none">&#9993;</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedEvaluationUrl}" title="Share on Facebook" aria-label="Share on Facebook" style="display:inline-block;width:38px;height:38px;margin:0 8px 8px 0;border:1px solid #ddd4e3;border-radius:50%;background:#fff;color:#633485;font-family:Arial,sans-serif;font-size:18px;font-weight:700;line-height:38px;text-align:center;text-decoration:none">f</a>
          <a href="https://x.com/intent/post?url=${encodedEvaluationUrl}&amp;text=${encodedShareCopy}" title="Share on X" aria-label="Share on X" style="display:inline-block;width:38px;height:38px;margin:0 8px 8px 0;border:1px solid #ddd4e3;border-radius:50%;background:#fff;color:#633485;font-family:Arial,sans-serif;font-size:17px;font-weight:600;line-height:38px;text-align:center;text-decoration:none">&#120143;</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedEvaluationUrl}" title="Share on LinkedIn" aria-label="Share on LinkedIn" style="display:inline-block;width:38px;height:38px;margin:0 0 8px;border:1px solid #ddd4e3;border-radius:50%;background:#fff;color:#633485;font-family:Arial,sans-serif;font-size:14px;font-weight:700;line-height:38px;text-align:center;text-decoration:none">in</a>
        </section>
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
