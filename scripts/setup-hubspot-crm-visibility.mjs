/**
 * Makes Marketing Pulse data easy to find in HubSpot:
 * - Groups all MP properties under "Marketing Pulse"
 * - Ensures list folder exists
 * - Prints direct CRM links
 *
 * Usage: HUBSPOT_ACCESS_TOKEN=pat-xxx node scripts/setup-hubspot-crm-visibility.mjs
 */

const API = "https://api.hubapi.com";
const PORTAL_ID = "244987820";
const FOLDER_NAME = "Marketing Pulse";
const GROUP_NAME = "marketing_pulse";
const GROUP_LABEL = "Marketing Pulse";

function resolveToken() {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    throw new Error("Set HUBSPOT_ACCESS_TOKEN");
  }
  return process.env.HUBSPOT_ACCESS_TOKEN;
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

async function ensurePropertyGroup(token) {
  const existing = await request(token, "GET", "/crm/v3/properties/contacts/groups");
  const found = existing.data?.results?.find((group) => group.name === GROUP_NAME);
  if (found) {
    console.log(`• property group exists: ${GROUP_LABEL}`);
    return;
  }
  const created = await request(token, "POST", "/crm/v3/properties/contacts/groups", {
    name: GROUP_NAME,
    label: GROUP_LABEL,
    displayOrder: 0,
  });
  if (created.ok) console.log(`✔ created property group: ${GROUP_LABEL}`);
  else console.error("✖ property group:", created.data?.message ?? created.data);
}

async function moveMarketingPulseProperties(token) {
  const props = await request(token, "GET", "/crm/v3/properties/contacts?limit=200");
  const mpProps = (props.data?.results ?? []).filter((property) =>
    property.name?.startsWith("mp_"),
  );
  let moved = 0;
  for (const property of mpProps) {
    if (property.groupName === GROUP_NAME) continue;
    const result = await request(token, "PATCH", `/crm/v3/properties/contacts/${property.name}`, {
      groupName: GROUP_NAME,
    });
    if (result.ok) {
      moved += 1;
      console.log(`✔ grouped ${property.name}`);
    } else {
      console.error(`✖ ${property.name}:`, result.data?.message ?? result.data);
    }
  }
  console.log(`\nProperties grouped under "${GROUP_LABEL}": ${moved}`);
}

async function ensureListFolder(token) {
  const folders = await request(token, "GET", "/crm/v3/lists/folders");
  const childNodes = folders.data?.folder?.childNodes ?? [];
  const found = childNodes.find((node) => node.name === FOLDER_NAME);
  if (found?.id) {
    console.log(`• list folder exists: ${FOLDER_NAME} (id=${found.id})`);
    return found.id;
  }
  const created = await request(token, "POST", "/crm/v3/lists/folders", {
    name: FOLDER_NAME,
  });
  const id = created.data?.folder?.id;
  if (created.ok && id) console.log(`✔ created list folder: ${FOLDER_NAME} (id=${id})`);
  else console.error("✖ list folder:", created.data?.message ?? created.data);
  return id;
}

async function main() {
  const token = resolveToken();
  console.log("Setting up HubSpot CRM visibility…\n");

  await ensurePropertyGroup(token);
  await moveMarketingPulseProperties(token);
  await ensureListFolder(token);

  console.log(`
Open these bookmarks in HubSpot:

All form submissions (list):
  https://app.hubspot.com/contacts/${PORTAL_ID}/objectLists/17/filters

Marketing Pulse lists folder:
  https://app.hubspot.com/contacts/${PORTAL_ID}/lists

Pulse CRM dashboard (in-app table):
  https://post-evaluation-form-v2.vercel.app/pulse-crm

Record customization (pin Marketing Pulse card on contact records):
  https://app.hubspot.com/settings/${PORTAL_ID}/objects/0-1/record-customization

Property settings (all MP fields grouped):
  https://app.hubspot.com/property-settings/${PORTAL_ID}/properties?type=0-1&group=${GROUP_NAME}
`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
