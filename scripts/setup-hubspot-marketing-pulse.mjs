/**
 * Creates Marketing Pulse contact properties (and prints list/subscription checklist).
 *
 * Usage:
 *   HUBSPOT_ACCESS_TOKEN=pat-xxx node scripts/setup-hubspot-marketing-pulse.mjs
 *
 * Or with CLI auth (requires CRM scopes on the personal access key):
 *   node scripts/setup-hubspot-marketing-pulse.mjs --use-cli
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const API = "https://api.hubapi.com";
const CONSENT_COPY_VERSION = "ecko-lens-v1-2026-08";

const resultOptions = [
  { label: "Strong Foundation", value: "strong" },
  { label: "Building Momentum", value: "building" },
  { label: "Needs a Little Love", value: "needs-love" },
];

const sectionNames = [
  { label: "Brand & Messaging", value: "brand" },
  { label: "Audience Understanding", value: "audience" },
  { label: "Goals & Purpose", value: "goals" },
  { label: "Customer Experience & Journey", value: "journey" },
  { label: "Campaign Planning & Visibility", value: "campaign" },
  { label: "Marketing Mix & Measurement", value: "mix" },
  { label: "Customer Action & Retention", value: "retention" },
];

const perspectiveOptions = [
  { label: "All Strong", value: "all-strong" },
  { label: "Strong Overall", value: "strong-overall" },
  { label: "Strong with Gaps", value: "strong-with-gaps" },
  { label: "Building", value: "building" },
  { label: "Mixed", value: "mixed" },
  { label: "Several Needs Love", value: "several-needs-love" },
];

const primaryGoalOptions = [
  { label: "Build awareness", value: "awareness" },
  { label: "Generate leads or inquiries", value: "leads" },
  { label: "Increase sales/bookings", value: "sales" },
  { label: "Launch something new", value: "launch" },
  { label: "Improve retention", value: "retention" },
  { label: "Strengthen foundation", value: "foundation" },
  { label: "Become more consistent", value: "consistency" },
  { label: "Unsure of priorities", value: "priorities" },
];

const businessTypeOptions = [
  { label: "Service-based", value: "service" },
  { label: "Product-based", value: "product" },
  { label: "In-person experience", value: "in-person" },
  { label: "E-commerce / online", value: "ecommerce" },
  { label: "Professional practice", value: "professional" },
  { label: "Nonprofit / community", value: "nonprofit" },
  { label: "B2B", value: "b2b" },
  { label: "Mixed", value: "mixed" },
  { label: "Other", value: "other" },
];

const businessStageOptions = [
  { label: "Pre-launch", value: "prelaunch" },
  { label: "Recently launched", value: "new" },
  { label: "Growing", value: "growing" },
  { label: "Established", value: "established" },
  { label: "Rebranding", value: "rebranding" },
  { label: "Expanding", value: "expanding" },
  { label: "Unsure", value: "unsure" },
];

const industryOptions = [
  { label: "Professional Services", value: "Professional Services" },
  { label: "Retail or E-commerce", value: "Retail or E-commerce" },
  { label: "Hospitality or Food Service", value: "Hospitality or Food Service" },
  { label: "Health or Wellness", value: "Health or Wellness" },
  { label: "Real Estate or Construction", value: "Real Estate or Construction" },
  { label: "Nonprofit or Community", value: "Nonprofit or Community" },
  { label: "Technology or B2B", value: "Technology or B2B" },
  { label: "Other", value: "Other" },
];

const discoveryOptions = [
  { label: "Referrals / word of mouth", value: "referrals" },
  { label: "Social media", value: "social" },
  { label: "Search engines", value: "search" },
  { label: "Digital advertising", value: "digital-ads" },
  { label: "Email marketing", value: "email" },
  { label: "Print advertising", value: "print" },
  { label: "Direct mail", value: "mail" },
  { label: "Outdoor / billboards", value: "outdoor" },
  { label: "Broadcast / streaming", value: "broadcast" },
  { label: "Events / activations", value: "events" },
  { label: "Sponsorships / partnerships", value: "partners" },
  { label: "Networking", value: "networking" },
  { label: "PR / media", value: "pr" },
  { label: "Walk-in / in-store", value: "walk-in" },
  { label: "Unsure", value: "unsure" },
  { label: "Something else", value: "other" },
];

const channelOptions = [
  { label: "Social media", value: "social" },
  { label: "Email marketing", value: "email" },
  { label: "SEO / search", value: "search" },
  { label: "Digital advertising", value: "digital-ads" },
  { label: "Print advertising", value: "print" },
  { label: "Direct mail", value: "mail" },
  { label: "Outdoor / billboards", value: "outdoor" },
  { label: "Broadcast / streaming", value: "broadcast" },
  { label: "Events / activations", value: "events" },
  { label: "Sponsorships / partnerships", value: "partners" },
  { label: "Networking", value: "networking" },
  { label: "Referral / loyalty programs", value: "loyalty" },
  { label: "PR / media", value: "pr" },
  { label: "In-store signage", value: "store" },
  { label: "Mostly word of mouth", value: "word-of-mouth" },
  { label: "Not consistently marketing", value: "inactive" },
  { label: "Something else", value: "other" },
];

const consentSourceOptions = [
  { label: "Results form", value: "results_form" },
  { label: "Email opt-in", value: "email_opt_in" },
  { label: "Other", value: "other" },
];

function enumOptions(options) {
  return options.map((option, index) => ({
    label: option.label,
    value: option.value,
    displayOrder: index,
    hidden: false,
  }));
}

function scoreResultPair(prefix, label) {
  return [
    {
      name: `mp_${prefix}_score`,
      label: `MP - ${label} Score`,
      type: "number",
      fieldType: "number",
      groupName: "contactinformation",
      description: `Marketing Pulse ${label} section score`,
    },
    {
      name: `mp_${prefix}_result`,
      label: `MP - ${label} Result`,
      type: "enumeration",
      fieldType: "select",
      groupName: "contactinformation",
      description: `Marketing Pulse ${label} result label`,
      options: enumOptions(resultOptions),
    },
  ];
}

function booleanProperty(name, label, description) {
  return {
    name,
    label,
    type: "bool",
    fieldType: "booleancheckbox",
    groupName: "contactinformation",
    description,
    options: [
      { label: "Yes", value: "true", displayOrder: 0, hidden: false },
      { label: "No", value: "false", displayOrder: 1, hidden: false },
    ],
  };
}

const properties = [
  {
    name: "mp_primary_goal",
    label: "MP - Primary Goal",
    type: "enumeration",
    fieldType: "checkbox",
    groupName: "contactinformation",
    description: "Q1 marketing goals (multi-select)",
    options: enumOptions(primaryGoalOptions),
  },
  {
    name: "mp_business_type",
    label: "MP - Business Type",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    description: "Q2 business type",
    options: enumOptions(businessTypeOptions),
  },
  {
    name: "mp_business_stage",
    label: "MP - Business Stage",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    description: "Q3 business stage",
    options: enumOptions(businessStageOptions),
  },
  {
    name: "mp_industry",
    label: "MP - Industry",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    description: "Industry from detailed-results form",
    options: enumOptions(industryOptions),
  },
  {
    name: "mp_channels_used",
    label: "MP - Channels Used",
    type: "enumeration",
    fieldType: "checkbox",
    groupName: "contactinformation",
    description: "Q15 current marketing channels",
    options: enumOptions(channelOptions),
  },
  {
    name: "mp_discovery_sources",
    label: "MP - Discovery Sources",
    type: "enumeration",
    fieldType: "checkbox",
    groupName: "contactinformation",
    description: "Q14 how customers find the business",
    options: enumOptions(discoveryOptions),
  },
  ...scoreResultPair("brand", "Brand"),
  ...scoreResultPair("audience", "Audience"),
  ...scoreResultPair("goals", "Goals"),
  ...scoreResultPair("journey", "Journey"),
  ...scoreResultPair("planning", "Planning"),
  ...scoreResultPair("mix", "Mix"),
  ...scoreResultPair("retention", "Retention"),
  {
    name: "mp_ecko_perspective",
    label: "MP - Ecko Perspective",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    description: "Overall Marketing Pulse perspective category",
    options: enumOptions(perspectiveOptions),
  },
  {
    name: "mp_priority_area_1",
    label: "MP - Priority Area 1",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    description: "Top calculated priority area",
    options: enumOptions(sectionNames),
  },
  {
    name: "mp_priority_area_2",
    label: "MP - Priority Area 2",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    description: "Second calculated priority area",
    options: enumOptions(sectionNames),
  },
  {
    name: "mp_hardest_challenge",
    label: "MP - Hardest Marketing Challenge",
    type: "string",
    fieldType: "textarea",
    groupName: "contactinformation",
    description: "Optional open response",
  },
  booleanProperty(
    "mp_detailed_results_requested",
    "MP - Detailed Results Requested",
    "Contact requested detailed results by email",
  ),
  {
    name: "mp_evaluation_completed_date",
    label: "MP - Evaluation Completed Date",
    type: "datetime",
    fieldType: "date",
    groupName: "contactinformation",
    description: "When the evaluation was completed",
  },
  {
    name: "mp_detailed_results_sent_date",
    label: "MP - Detailed Results Sent Date",
    type: "datetime",
    fieldType: "date",
    groupName: "contactinformation",
    description: "When detailed results email was sent",
  },
  booleanProperty(
    "mp_marketing_consent",
    "MP - Marketing Consent",
    "Opted into Ecko's Marketing Lens",
  ),
  {
    name: "mp_consent_source",
    label: "MP - Consent Source",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    description: "Where marketing consent was captured",
    options: enumOptions(consentSourceOptions),
  },
  {
    name: "mp_consent_timestamp",
    label: "MP - Consent Timestamp",
    type: "datetime",
    fieldType: "date",
    groupName: "contactinformation",
    description: "When marketing consent was given",
  },
  {
    name: "mp_consent_copy_version",
    label: "MP - Consent Copy Version",
    type: "string",
    fieldType: "text",
    groupName: "contactinformation",
    description: `Consent language version identifier (current: ${CONSENT_COPY_VERSION})`,
  },
  booleanProperty(
    "mp_strategy_spark_sesh_clicked",
    "MP - Strategy Spark Sesh Clicked",
    "Contact clicked Book A Strategy Spark Sesh",
  ),
  {
    name: "mp_strategy_spark_sesh_clicked_date",
    label: "MP - Strategy Spark Sesh Clicked Date",
    type: "datetime",
    fieldType: "date",
    groupName: "contactinformation",
    description: "When the Strategy Spark Sesh CTA was clicked",
  },
];

function resolveToken() {
  if (process.env.HUBSPOT_ACCESS_TOKEN) return process.env.HUBSPOT_ACCESS_TOKEN;
  if (!process.argv.includes("--use-cli")) {
    throw new Error(
      "Set HUBSPOT_ACCESS_TOKEN or pass --use-cli (CLI key must include CRM scopes).",
    );
  }
  const raw = readFileSync(join(homedir(), ".hscli/config.yml"), "utf8");
  const match = raw.match(/accessToken:\s*>-\s*\n\s*([^\n]+)/);
  const token = match?.[1]?.trim();
  if (!token) throw new Error("No CLI access token found. Run hs account auth.");
  return token;
}

async function request(token, method, path, body) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: response.ok, status: response.status, data };
}

function boolFilter(property, value, operator = "IS_EQUAL_TO", includeEmpty = false) {
  return {
    filterType: "PROPERTY",
    property,
    operation: {
      operationType: "BOOL",
      operator,
      value,
      includeObjectsWithNoValueSet: includeEmpty,
    },
  };
}

function knownPropertyFilter(property) {
  return {
    filterType: "PROPERTY",
    property,
    operation: {
      operationType: "ALL_PROPERTY",
      operator: "IS_KNOWN",
      includeObjectsWithNoValueSet: false,
    },
  };
}

const marketingLists = [
  {
    name: "Ecko's Marketing Lens - Subscribed",
    processingType: "DYNAMIC",
    filterBranch: {
      filterBranchType: "OR",
      filters: [],
      filterBranches: [
        {
          filterBranchType: "AND",
          filters: [boolFilter("mp_marketing_consent", true)],
          filterBranches: [],
        },
      ],
    },
  },
  {
    name: "Evaluation Completed - No Marketing Consent",
    processingType: "DYNAMIC",
    filterBranch: {
      filterBranchType: "OR",
      filters: [],
      filterBranches: [
        {
          filterBranchType: "AND",
          filters: [
            knownPropertyFilter("mp_evaluation_completed_date"),
            boolFilter("mp_marketing_consent", true, "IS_NOT_EQUAL_TO", true),
          ],
          filterBranches: [],
        },
      ],
    },
  },
  {
    name: "Detailed Results Requested",
    processingType: "DYNAMIC",
    filterBranch: {
      filterBranchType: "OR",
      filters: [],
      filterBranches: [
        {
          filterBranchType: "AND",
          filters: [boolFilter("mp_detailed_results_requested", true)],
          filterBranches: [],
        },
      ],
    },
  },
  {
    name: "High-Intent Evaluation Leads",
    processingType: "DYNAMIC",
    filterBranch: {
      filterBranchType: "OR",
      filters: [],
      filterBranches: [
        {
          filterBranchType: "AND",
          filters: [
            boolFilter("mp_detailed_results_requested", true),
            boolFilter("mp_strategy_spark_sesh_clicked", true),
          ],
          filterBranches: [],
        },
      ],
    },
  },
];

async function findListByName(token, name) {
  const search = await request(token, "POST", "/crm/v3/lists/search", {
    query: name,
    count: 20,
  });
  if (!search.ok) return null;
  const lists = search.data?.lists ?? [];
  return lists.find((list) => list.name === name) ?? null;
}

async function createMarketingLists(token) {
  console.log("\nCreating Marketing Pulse active lists…\n");
  let created = 0;
  let existing = 0;
  let failed = 0;

  for (const list of marketingLists) {
    const found = await findListByName(token, list.name);
    if (found) {
      existing += 1;
      console.log(`• exists  ${list.name} (id=${found.listId ?? found.id})`);
      continue;
    }

    const result = await request(token, "POST", "/crm/v3/lists/", {
      name: list.name,
      objectTypeId: "0-1",
      processingType: list.processingType,
      filterBranch: list.filterBranch,
    });

    if (result.ok) {
      created += 1;
      const id = result.data?.list?.listId ?? result.data?.listId ?? result.data?.id;
      console.log(`✔ created ${list.name} (id=${id})`);
      continue;
    }

    if (result.status === 409) {
      existing += 1;
      console.log(`• exists  ${list.name}`);
      continue;
    }

    failed += 1;
    console.error(
      `✖ ${list.name}: ${result.status}`,
      result.data?.message ?? JSON.stringify(result.data).slice(0, 200),
    );
  }

  console.log(`\nLists: created=${created} existing=${existing} failed=${failed}`);
  if (failed > 0) {
    console.log(
      "Lists require crm.lists.read + crm.lists.write on the Service Key. Add those scopes and re-run.",
    );
  }
}

async function findMarketingLensSubscription(token) {
  const definitions = await request(token, "GET", "/communication-preferences/v4/definitions");
  if (!definitions.ok) return null;
  const subs = definitions.data?.subscriptionDefinitions ?? definitions.data?.results ?? [];
  return subs.find((item) => /marketing lens/i.test(item?.name ?? item?.label ?? "")) ?? null;
}

async function main() {
  const token = resolveToken();
  console.log(`Creating ${properties.length} Marketing Pulse contact properties…\n`);

  let created = 0;
  let existing = 0;
  let failed = 0;

  for (const property of properties) {
    const result = await request(token, "POST", "/crm/v3/properties/contacts", property);
    if (result.ok) {
      created += 1;
      console.log(`✔ created ${property.name}`);
      continue;
    }
    if (result.status === 409 || result.data?.category === "OBJECT_ALREADY_EXISTS") {
      existing += 1;
      console.log(`• exists  ${property.name}`);
      continue;
    }
    failed += 1;
    console.error(`✖ ${property.name}: ${result.status}`, result.data?.message ?? result.data);
  }

  console.log(`\nProperties: created=${created} existing=${existing} failed=${failed}`);
  console.log(`Consent copy version constant: ${CONSENT_COPY_VERSION}`);

  const lens = await findMarketingLensSubscription(token);
  if (lens) {
    console.log(`\n✔ Ecko's Marketing Lens subscription id: ${lens.id}`);
    console.log(`  Add to .env.local: HUBSPOT_MARKETING_LENS_SUBSCRIPTION_ID=${lens.id}`);
  } else {
    console.log(
      "\n• Create subscription type in HubSpot UI: Settings → Marketing → Email → Subscription types",
    );
    console.log('  Name: "Ecko\'s Marketing Lens"');
    console.log(
      "  Description: Occasional marketing emails from Ecko — trends, ideas, Marketing Real Talk takeaways, and updates.",
    );
  }

  await createMarketingLists(token);

  console.log(`
Add to .env.local:
  HUBSPOT_ACCESS_TOKEN=<service-key-or-private-app-token>
  HUBSPOT_MARKETING_LENS_SUBSCRIPTION_ID=<id from above>
  NEXT_PUBLIC_APP_URL=https://post-evaluation-form-v2-pi.vercel.app

HubSpot UI checklist (cannot be automated via API):
1) Settings → Marketing → Email → Subscription types
   Create: "Ecko's Marketing Lens" (if not created yet)
2) Settings → Privacy & Consent → enable subscription / legal-basis tools
3) Workflow (Settings → Automation → Workflows):
   Trigger: contact property mp_detailed_results_requested = true
   Action: send results email (already handled by app API)
   Branch: if mp_marketing_consent = true → enroll in Lens nurture sequence
4) Service Key scopes (add if lists failed):
   crm.objects.contacts.read/write, crm.schemas.contacts.read/write,
   communication_preferences.read_write, crm.lists.read, crm.lists.write
`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
