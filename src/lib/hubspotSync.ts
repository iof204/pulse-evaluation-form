import {
  countLevels,
  evaluateSections,
  type EvaluatedSection,
  type Responses,
} from "./evaluateResults";
import type { ResultLevel, ResultSectionKey } from "../app/resultsData";
import { perspectiveCopy } from "../app/resultsData";

export const HUBSPOT_CONSENT_COPY_VERSION = "ecko-lens-v1-2026-08";

export type MarketingConsentSource = "results_form" | "email_opt_in";

const sectionToPlanningKey: Record<ResultSectionKey, string> = {
  brand: "brand",
  audience: "audience",
  goals: "goals",
  journey: "journey",
  campaign: "planning",
  mix: "mix",
  retention: "retention",
};

type PerspectiveKey = keyof typeof perspectiveCopy;

function perspectiveKeyFromCounts(counts: Record<ResultLevel, number>): PerspectiveKey {
  if (counts.strong === 7) return "all-strong";
  if (counts.strong >= 5 && counts["needs-love"] === 0) return "strong-overall";
  if (counts.strong >= 4 && counts["needs-love"] <= 2) return "strong-with-gaps";
  if (counts.building >= 4 && counts["needs-love"] <= 2) return "building";
  if (counts["needs-love"] >= 4) return "several-needs-love";
  return "mixed";
}

function priorityAreas(evaluated: EvaluatedSection[]) {
  const ranked = [...evaluated].sort((a, b) => {
    const rank = (level: ResultLevel) =>
      level === "needs-love" ? 0 : level === "building" ? 1 : 2;
    const byLevel = rank(a.level) - rank(b.level);
    return byLevel !== 0 ? byLevel : a.score - b.score;
  });
  return {
    priority1: ranked[0]?.key,
    priority2: ranked[1]?.key,
  };
}

function checkboxValue(values: string[] | undefined) {
  return values?.length ? values.join(";") : undefined;
}

function toHubSpotDatetime(date = new Date()) {
  return String(date.getTime());
}

export type HubSpotPulseSyncInput = {
  firstName: string;
  email: string;
  businessName?: string;
  industry: string;
  marketingConsent: boolean;
  responses: Responses;
  evaluated?: EvaluatedSection[];
  consentSource?: MarketingConsentSource;
};

export function buildMarketingPulseContactProperties(
  input: HubSpotPulseSyncInput,
  options?: { consentSource?: MarketingConsentSource },
) {
  const evaluated = input.evaluated ?? evaluateSections(input.responses);
  const counts = countLevels(evaluated);
  const perspectiveKey = perspectiveKeyFromCounts(counts);
  const { priority1, priority2 } = priorityAreas(evaluated);
  const now = toHubSpotDatetime();
  const consentSource = options?.consentSource ?? input.consentSource;

  const properties: Record<string, string> = {
    firstname: input.firstName,
    email: input.email,
    company: input.businessName || "",
    mp_industry: input.industry,
    mp_detailed_results_requested: "true",
    mp_evaluation_completed_date: now,
    mp_detailed_results_sent_date: now,
    mp_marketing_consent: input.marketingConsent ? "true" : "false",
    mp_ecko_perspective: perspectiveKey,
    hs_marketable_status: input.marketingConsent
      ? "MARKETING_CONTACT"
      : "NON_MARKETING_CONTACT",
  };

  if (input.businessName) properties.company = input.businessName;

  const primaryGoal = checkboxValue(input.responses[1]);
  if (primaryGoal) properties.mp_primary_goal = primaryGoal;

  const businessType = input.responses[2]?.[0];
  if (businessType) properties.mp_business_type = businessType;

  const businessStage = input.responses[3]?.[0];
  if (businessStage) properties.mp_business_stage = businessStage;

  const discovery = checkboxValue(input.responses[14]);
  if (discovery) properties.mp_discovery_sources = discovery;

  const channels = checkboxValue(input.responses[15]);
  if (channels) properties.mp_channels_used = channels;

  for (const section of evaluated) {
    const prefix = sectionToPlanningKey[section.key];
    properties[`mp_${prefix}_score`] = String(section.score);
    properties[`mp_${prefix}_result`] = section.level;
  }

  if (priority1) properties.mp_priority_area_1 = priority1;
  if (priority2) properties.mp_priority_area_2 = priority2;

  if (input.marketingConsent && consentSource) {
    properties.mp_consent_source = consentSource;
    properties.mp_consent_timestamp = now;
    properties.mp_consent_copy_version = HUBSPOT_CONSENT_COPY_VERSION;
  }

  return properties;
}

async function hubspotFetch(path: string, init?: RequestInit) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) return null;

  const response = await fetch(`https://api.hubapi.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`HubSpot ${response.status}: ${JSON.stringify(data)}`);
  }
  return data as Record<string, unknown>;
}

async function findContactIdByEmail(email: string) {
  const search = await hubspotFetch("/crm/v3/objects/contacts/search", {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            },
          ],
        },
      ],
      properties: ["email"],
      limit: 1,
    }),
  });

  return (search?.results as Array<{ id?: string }> | undefined)?.[0]?.id;
}

async function upsertContactProperties(
  email: string,
  properties: Record<string, string>,
) {
  const existingId = await findContactIdByEmail(email);

  if (existingId) {
    await hubspotFetch(`/crm/v3/objects/contacts/${existingId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    return { id: existingId, action: "updated" as const };
  }

  const created = await hubspotFetch("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
  return {
    id: String(created?.id ?? ""),
    action: "created" as const,
  };
}

export async function subscribeToMarketingLens(
  email: string,
  source: MarketingConsentSource,
) {
  const subscriptionId = process.env.HUBSPOT_MARKETING_LENS_SUBSCRIPTION_ID;
  if (!subscriptionId) {
    console.warn(
      "HUBSPOT_MARKETING_LENS_SUBSCRIPTION_ID missing; skipping Lens subscription API call.",
    );
    return { skipped: true as const };
  }

  await hubspotFetch(
    `/communication-preferences/v4/statuses/${encodeURIComponent(email)}`,
    {
      method: "POST",
      body: JSON.stringify({
        channel: "EMAIL",
        statusState: "SUBSCRIBED",
        subscriptionId: Number(subscriptionId),
        legalBasis: "CONSENT_WITH_NOTICE",
        legalBasisExplanation:
          source === "results_form"
            ? "Opted in via Marketing Pulse detailed results form."
            : "Opted in via TAP IN email CTA.",
      }),
    },
  );

  return { skipped: false as const };
}

export async function syncMarketingPulseContactToHubSpot(
  input: HubSpotPulseSyncInput,
) {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN missing; skipping HubSpot contact sync.");
    return { skipped: true as const };
  }

  const consentSource = input.marketingConsent
    ? (input.consentSource ?? "results_form")
    : undefined;
  const properties = buildMarketingPulseContactProperties(input, { consentSource });
  const result = await upsertContactProperties(input.email, properties);

  if (input.marketingConsent) {
    try {
      await subscribeToMarketingLens(
        input.email,
        consentSource ?? "results_form",
      );
    } catch (error) {
      console.error("HubSpot Marketing Lens subscription failed", error);
    }
  }

  return { skipped: false as const, ...result };
}

export async function recordMarketingLensOptIn(input: {
  email: string;
  firstName?: string;
}) {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    console.warn("HUBSPOT_ACCESS_TOKEN missing; skipping Marketing Lens opt-in.");
    return { skipped: true as const };
  }

  const now = toHubSpotDatetime();
  const properties: Record<string, string> = {
    email: input.email,
    mp_marketing_consent: "true",
    mp_consent_source: "email_opt_in",
    mp_consent_timestamp: now,
    mp_consent_copy_version: HUBSPOT_CONSENT_COPY_VERSION,
    hs_marketable_status: "MARKETING_CONTACT",
  };

  if (input.firstName) properties.firstname = input.firstName;

  const result = await upsertContactProperties(input.email, properties);

  try {
    await subscribeToMarketingLens(input.email, "email_opt_in");
  } catch (error) {
    console.error("HubSpot Marketing Lens subscription failed", error);
  }

  return { skipped: false as const, ...result };
}
