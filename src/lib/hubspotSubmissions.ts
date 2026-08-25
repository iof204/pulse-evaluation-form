const MP_PROPERTIES = [
  "firstname",
  "email",
  "company",
  "createdate",
  "lastmodifieddate",
  "hs_marketable_status",
  "mp_industry",
  "mp_business_type",
  "mp_business_stage",
  "mp_primary_goal",
  "mp_channels_used",
  "mp_discovery_sources",
  "mp_brand_score",
  "mp_brand_result",
  "mp_audience_score",
  "mp_audience_result",
  "mp_goals_score",
  "mp_goals_result",
  "mp_journey_score",
  "mp_journey_result",
  "mp_planning_score",
  "mp_planning_result",
  "mp_mix_score",
  "mp_mix_result",
  "mp_retention_score",
  "mp_retention_result",
  "mp_ecko_perspective",
  "mp_priority_area_1",
  "mp_priority_area_2",
  "mp_hardest_challenge",
  "mp_detailed_results_requested",
  "mp_evaluation_completed_date",
  "mp_detailed_results_sent_date",
  "mp_marketing_consent",
  "mp_consent_source",
  "mp_consent_timestamp",
  "mp_consent_copy_version",
  "mp_strategy_spark_sesh_clicked",
] as const;

export type PulseSubmission = {
  id: string;
  hubspotUrl: string;
  firstName: string;
  email: string;
  company: string;
  industry: string;
  businessType: string;
  businessStage: string;
  primaryGoal: string;
  perspective: string;
  priority1: string;
  priority2: string;
  marketingConsent: boolean;
  consentSource: string;
  hardestChallenge: string;
  strategyClicked: boolean;
  submittedAt: string;
  scores: Array<{ label: string; score: string; result: string }>;
};

const PORTAL_ID = "244987820";

const resultLabels: Record<string, string> = {
  strong: "Strong Foundation",
  building: "Building Momentum",
  "needs-love": "Needs a Little Love",
};

const perspectiveLabels: Record<string, string> = {
  "all-strong": "All Strong",
  "strong-overall": "Strong Overall",
  "strong-with-gaps": "Strong with Gaps",
  building: "Building",
  mixed: "Mixed",
  "several-needs-love": "Several Needs Love",
};

const sectionLabels: Record<string, string> = {
  brand: "Brand",
  audience: "Audience",
  goals: "Goals",
  journey: "Journey",
  planning: "Planning",
  mix: "Mix",
  retention: "Retention",
};

function formatValue(value: string | null | undefined) {
  if (!value) return "—";
  return value
    .split(/[;_]/g)
    .map((part) =>
      part
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    )
    .join(", ");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function toSubmission(contact: {
  id: string;
  properties: Record<string, string | null | undefined>;
}): PulseSubmission {
  const props = contact.properties;
  const scores = [
    { key: "brand", label: "Brand" },
    { key: "audience", label: "Audience" },
    { key: "goals", label: "Goals" },
    { key: "journey", label: "Journey" },
    { key: "planning", label: "Planning" },
    { key: "mix", label: "Mix" },
    { key: "retention", label: "Retention" },
  ].map(({ key, label }) => ({
    label,
    score: props[`mp_${key}_score`] ?? "—",
    result: resultLabels[props[`mp_${key}_result`] ?? ""] ?? formatValue(props[`mp_${key}_result`]),
  }));

  return {
    id: contact.id,
    hubspotUrl: `https://app-na2.hubspot.com/contacts/${PORTAL_ID}/record/0-1/${contact.id}`,
    firstName: props.firstname ?? "—",
    email: props.email ?? "—",
    company: props.company ?? "—",
    industry: props.mp_industry ?? "—",
    businessType: formatValue(props.mp_business_type),
    businessStage: formatValue(props.mp_business_stage),
    primaryGoal: formatValue(props.mp_primary_goal),
    perspective:
      perspectiveLabels[props.mp_ecko_perspective ?? ""] ??
      formatValue(props.mp_ecko_perspective),
    priority1: sectionLabels[props.mp_priority_area_1 ?? ""] ?? formatValue(props.mp_priority_area_1),
    priority2: sectionLabels[props.mp_priority_area_2 ?? ""] ?? formatValue(props.mp_priority_area_2),
    marketingConsent: props.mp_marketing_consent === "true",
    consentSource: formatValue(props.mp_consent_source),
    hardestChallenge: props.mp_hardest_challenge ?? "—",
    strategyClicked: props.mp_strategy_spark_sesh_clicked === "true",
    submittedAt: formatDate(props.mp_detailed_results_sent_date ?? props.createdate),
    scores,
  };
}

export async function fetchPulseSubmissions() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    throw new Error("HUBSPOT_ACCESS_TOKEN is not configured.");
  }

  const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "mp_detailed_results_requested",
              operator: "EQ",
              value: "true",
            },
          ],
        },
      ],
      properties: [...MP_PROPERTIES],
      sorts: [{ propertyName: "mp_detailed_results_sent_date", direction: "DESCENDING" }],
      limit: 100,
    }),
  });

  const data = (await response.json()) as {
    results?: Array<{ id: string; properties: Record<string, string> }>;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to load HubSpot submissions.");
  }

  return (data.results ?? []).map(toSubmission);
}
