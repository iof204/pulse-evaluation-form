import {
  countLevels,
  evaluateSections,
  getPerspectiveKey,
  selectPriorityAreas,
  type EvaluatedSection,
  type Responses,
} from "./evaluateResults";
import type { ResultSectionKey } from "../app/resultsData";

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

function priorityAreas(evaluated: EvaluatedSection[], responses: Responses) {
  const ranked = selectPriorityAreas(evaluated, responses);
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
  hardestChallenge?: string;
  responses: Responses;
  evaluated?: EvaluatedSection[];
  consentSource?: MarketingConsentSource;
};

export function buildMarketingPulseContactProperties(
  input: HubSpotPulseSyncInput,
  options?: {
    consentSource?: MarketingConsentSource;
    includeConsentFields?: boolean;
  },
) {
  const evaluated = input.evaluated ?? evaluateSections(input.responses);
  const counts = countLevels(evaluated);
  const perspectiveKey = getPerspectiveKey(counts);
  const { priority1, priority2 } = priorityAreas(evaluated, input.responses);
  const now = toHubSpotDatetime();
  const consentSource = options?.consentSource ?? input.consentSource;
  const includeConsentFields = options?.includeConsentFields ?? input.marketingConsent;

  const properties: Record<string, string> = {
    firstname: input.firstName,
    email: input.email,
    company: input.businessName || "",
    mp_industry: input.industry,
    mp_detailed_results_requested: "true",
    mp_evaluation_completed_date: now,
    mp_detailed_results_sent_date: now,
    mp_ecko_perspective: perspectiveKey,
    hs_marketable_status: input.marketingConsent
      ? "MARKETING_CONTACT"
      : "NON_MARKETING_CONTACT",
  };

  if (includeConsentFields) {
    properties.mp_marketing_consent = input.marketingConsent ? "true" : "false";
  }

  if (input.businessName) properties.company = input.businessName;

  const hardestChallenge = input.hardestChallenge?.trim();
  if (hardestChallenge) properties.mp_hardest_challenge = hardestChallenge;

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

async function findContactByEmail(email: string) {
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
      properties: ["email", "mp_marketing_consent"],
      limit: 1,
    }),
  });

  const result = (search?.results as Array<{ id?: string; properties?: Record<string, string> }> | undefined)?.[0];
  return result?.id
    ? { id: result.id, properties: result.properties ?? {} }
    : null;
}

async function upsertContactProperties(
  email: string,
  properties: Record<string, string>,
) {
  const existing = await findContactByEmail(email);

  if (existing?.id) {
    await hubspotFetch(`/crm/v3/objects/contacts/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    return { id: existing.id, action: "updated" as const, existing };
  }

  const created = await hubspotFetch("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
  return {
    id: String(created?.id ?? ""),
    action: "created" as const,
    existing: null,
  };
}

async function getLensSubscriptionStatus(email: string) {
  const subscriptionId = process.env.HUBSPOT_MARKETING_LENS_SUBSCRIPTION_ID;
  if (!subscriptionId) return null;

  const data = await hubspotFetch(
    `/communication-preferences/v4/statuses/${encodeURIComponent(email)}?channel=EMAIL`,
  );
  const statuses =
    (data?.results as Array<{ subscriptionId?: number; statusState?: string }> | undefined) ??
    (data?.statuses as Array<{ subscriptionId?: number; statusState?: string }> | undefined) ??
    [];

  return statuses.find(
    (status) => String(status.subscriptionId) === String(subscriptionId),
  )?.statusState;
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

  const existing = await findContactByEmail(input.email);
  const isNewContact = !existing;
  const consentSource = input.marketingConsent
    ? (input.consentSource ?? "results_form")
    : undefined;

  const properties = buildMarketingPulseContactProperties(input, {
    consentSource,
    includeConsentFields: input.marketingConsent || isNewContact,
  });

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

  const currentStatus = await getLensSubscriptionStatus(input.email);
  if (currentStatus === "UNSUBSCRIBED") {
    // Explicit TAP IN form resubscription is allowed by the guide.
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

export async function recordStrategySparkSeshClick(email: string) {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    return { skipped: true as const };
  }

  const properties: Record<string, string> = {
    email,
    mp_strategy_spark_sesh_clicked: "true",
    mp_strategy_spark_sesh_clicked_date: toHubSpotDatetime(),
  };

  const result = await upsertContactProperties(email, properties);
  return { skipped: false as const, ...result };
}
