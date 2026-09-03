import { buildTapInUrl } from "../../lib/appUrl";
import {
  buildResultsEmailHtml,
  createSampleResultsEmailInput,
} from "../../lib/resultsEmailTemplate";

export default function EmailPreviewPage() {
  const html = buildResultsEmailHtml({
    ...createSampleResultsEmailInput(),
    logoUrl: "/images/ecko-marketing-logo-white.png",
    tapInUrl: buildTapInUrl(
      "alex@example.com",
      "Alex",
      "Northline Studio",
      "Professional Services",
    ),
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "24px 16px 48px",
        background: "#FBF7F3",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 16,
            padding: "14px 18px",
            borderRadius: 12,
            background: "#ffffff",
            border: "1px solid #eeeaf0",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#7c4d9e",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Dev Preview
          </p>
          <h1
            style={{
              margin: "6px 0 0",
              color: "#33185c",
              fontSize: 22,
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            Marketing Pulse Email Preview
          </h1>
          <p style={{ margin: "8px 0 0", color: "#544b5a", fontSize: 14, lineHeight: 1.6 }}>
            This page renders the exact HTML sent by the results email API using sample
            evaluation data.
          </p>
        </div>

        <div
          style={{
            overflow: "hidden",
            border: "1px solid #eeeaf0",
            borderRadius: 12,
            background: "#ffffff",
          }}
        >
          <iframe
            title="Marketing Pulse email preview"
            srcDoc={html}
            style={{
              display: "block",
              width: "100%",
              minHeight: 3200,
              border: 0,
              background: "#FBF7F3",
            }}
          />
        </div>
      </div>
    </main>
  );
}
