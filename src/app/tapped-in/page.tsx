import { buildTappedInEmailHtml } from "../../lib/tappedInEmailTemplate";

export default function TappedInPage() {
  const html = buildTappedInEmailHtml({
    businessName: "Northline Studio",
    industry: "Professional Services",
    strategyPortraitUrl: "/images/strategy-spark-email.webp",
    assetBaseUrl: "/images/email-system",
  });

  return (
    <main style={{ minHeight: "100vh", margin: 0, padding: "24px 16px 48px", background: "#FBF7F3", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <iframe
          title="You're tapped in confirmation email"
          srcDoc={html}
          style={{ display: "block", width: "100%", minHeight: 1150, border: 0, background: "#FBF7F3" }}
        />
      </div>
    </main>
  );
}
