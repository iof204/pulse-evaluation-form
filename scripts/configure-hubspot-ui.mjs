/**
 * Configures HubSpot UI for Marketing Pulse visibility.
 * Requires you to be logged into HubSpot in Chrome.
 *
 * Usage: node scripts/configure-hubspot-ui.mjs
 */

import { chromium } from "playwright-core";
import { homedir } from "node:os";
import { join } from "node:path";

const PORTAL = "244987820";
const RECORD_URL = `https://app.hubspot.com/settings/${PORTAL}/objects/0-1/record-customization`;
const CONTACTS_URL = `https://app.hubspot.com/contacts/${PORTAL}/objects/0-1/views/all/list`;

const CARD_PROPERTIES = [
  "MP - Industry",
  "MP - Business Type",
  "MP - Business Stage",
  "MP - Primary Goal",
  "MP - Ecko Perspective",
  "MP - Marketing Consent",
  "MP - Brand Result",
  "MP - Audience Result",
  "MP - Priority Area 1",
  "MP - Priority Area 2",
  "MP - Detailed Results Requested",
];

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isLoginPage(page) {
  const url = page.url();
  const title = await page.title();
  return /login|sign in/i.test(url) || /login|sign in/i.test(title);
}

async function clickIfVisible(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible({ timeout: 1500 }).catch(() => false)) {
      await locator.click();
      return true;
    }
  }
  return false;
}

async function configureRecordCard(page) {
  console.log("\n=== Contact record: Marketing Pulse card ===");
  await page.goto(RECORD_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await wait(4000);
  if (await isLoginPage(page)) throw new Error("Not logged into HubSpot. Log in, then re-run.");

  await clickIfVisible(page, [
    'button:has-text("Customize")',
    'button:has-text("Edit")',
    '[data-test-id="customize-record"]',
  ]);
  await wait(2000);

  await clickIfVisible(page, [
    'button:has-text("Add card")',
    'button:has-text("Add cards")',
    'button:has-text("+")',
  ]);
  await wait(1500);

  await clickIfVisible(page, [
    'button:has-text("Property list")',
    'div:has-text("Property list")',
    '[role="menuitem"]:has-text("Property list")',
  ]);
  await wait(2000);

  const search = page.locator('input[placeholder*="Search"], input[type="search"]').first();
  if (await search.isVisible({ timeout: 3000 }).catch(() => false)) {
    for (const label of CARD_PROPERTIES) {
      await search.fill("");
      await search.fill(label);
      await wait(500);
      const option = page.locator(`label:has-text("${label}"), [role="checkbox"]:near(:text("${label}"))`).first();
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        await option.click({ force: true }).catch(() => {});
      } else {
        const row = page.getByText(label, { exact: false }).first();
        if (await row.isVisible({ timeout: 1500 }).catch(() => false)) {
          await row.click({ force: true }).catch(() => {});
        }
      }
    }
  }

  await clickIfVisible(page, [
    'button:has-text("Save")',
    'button:has-text("Apply")',
    'button:has-text("Done")',
  ]);
  await wait(2000);

  await clickIfVisible(page, [
    'button:has-text("Set as default")',
    'button:has-text("Save and set default")',
    'button:has-text("Save for everyone")',
  ]);
  console.log("Record customization attempted. Verify the Marketing Pulse card on a contact.");
}

async function configureContactsView(page) {
  console.log("\n=== Contacts index: Marketing Pulse view ===");
  await page.goto(CONTACTS_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await wait(4000);
  if (await isLoginPage(page)) throw new Error("Not logged into HubSpot. Log in, then re-run.");

  await clickIfVisible(page, [
    'button:has-text("Add view")',
    'button:has-text("+ Add view")',
    '[data-test-id="add-view"]',
  ]);
  await wait(1500);

  await clickIfVisible(page, [
    'button:has-text("Create new view")',
    '[role="menuitem"]:has-text("Create new view")',
  ]);
  await wait(2000);

  const nameInput = page.locator('input[placeholder*="name"], input[name="name"]').first();
  if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameInput.fill("Marketing Pulse Submissions");
  }

  await clickIfVisible(page, [
    'button:has-text("Everyone")',
    'label:has-text("Everyone")',
  ]);

  await clickIfVisible(page, [
    'button:has-text("Confirm")',
    'button:has-text("Create")',
    'button:has-text("Save")',
  ]);
  await wait(2000);

  await clickIfVisible(page, [
    'button:has-text("Add filter")',
    'button:has-text("Filters")',
    '[data-test-id="add-filter"]',
  ]);
  await wait(1500);

  const filterSearch = page.locator('input[placeholder*="Search"], input[type="search"]').first();
  if (await filterSearch.isVisible({ timeout: 3000 }).catch(() => false)) {
    await filterSearch.fill("MP - Detailed Results Requested");
    await wait(800);
    await page.getByText("MP - Detailed Results Requested", { exact: false }).first().click({ force: true }).catch(() => {});
    await wait(800);
    await clickIfVisible(page, [
      'button:has-text("is equal to")',
      '[role="option"]:has-text("is equal to")',
    ]);
    await clickIfVisible(page, [
      'button:has-text("Yes")',
      '[role="option"]:has-text("Yes")',
      'label:has-text("Yes")',
    ]);
  }

  await clickIfVisible(page, [
    'button[aria-label*="Save"]',
    'button:has-text("Save view")',
    'button:has-text("Save")',
  ]);
  console.log("Contacts view attempted. Pin 'Marketing Pulse Submissions' as your leftmost tab.");
}

async function main() {
  const userDataDir = join(homedir(), ".hubspot-playwright-profile");
  console.log("Launching Chrome for HubSpot UI setup…");
  console.log("If prompted, log into HubSpot in the browser window.");

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1440, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = context.pages()[0] ?? (await context.newPage());

  try {
    await configureRecordCard(page);
    await configureContactsView(page);
    console.log("\nDone. Check a contact record and CRM → Contacts for the new view.");
    await wait(5000);
  } catch (error) {
    console.error("\nAutomation could not finish automatically:", error.message);
    console.log(`
Manual setup (2 minutes):

1) Contact record card
   ${RECORD_URL}
   Add card → Property list → name it "Marketing Pulse"
   Add MP properties → Save → Set as default for everyone

2) Contacts view
   ${CONTACTS_URL}
   + Add view → Create new view → "Marketing Pulse Submissions"
   Filter: MP - Detailed Results Requested = Yes
   Save, then drag that tab to the far left
`);
    await wait(15000);
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
