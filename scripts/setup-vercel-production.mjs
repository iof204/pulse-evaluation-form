#!/usr/bin/env node
/**
 * Sync production env vars to the linked Vercel project, deploy, and claim
 * https://post-evaluation-form-v2.vercel.app when the stale ifcs project is removed.
 *
 * Usage:
 *   node scripts/setup-vercel-production.mjs
 *   node scripts/setup-vercel-production.mjs --alias-only
 */

import { execSync, spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const PRODUCTION_URL = "https://post-evaluation-form-v2.vercel.app";
const ENV_KEYS = [
  "HUBSPOT_ACCESS_TOKEN",
  "HUBSPOT_MARKETING_LENS_SUBSCRIPTION_ID",
  "GMAIL_SMTP_USER",
  "GMAIL_SMTP_APP_PASSWORD",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_APP_VERSION",
];

function run(command, options = {}) {
  return execSync(command, {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    ...options,
  }).trim();
}

function parseEnvFile(path) {
  const values = {};
  if (!existsSync(path)) return values;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }

  return values;
}

function upsertEnv(name, value, environments = ["production", "preview", "development"]) {
  for (const environment of environments) {
    const update = spawnSync("sh", ["-c", `printf '%s' "${value.replace(/"/g, '\\"')}" | vercel env update ${name} ${environment}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (update.status === 0 && /Updated|overwritten/i.test(update.stdout || "")) {
      console.log(`  ${name} -> ${environment}`);
      continue;
    }

    const add = spawnSync("sh", ["-c", `printf '%s' "${value.replace(/"/g, '\\"')}" | vercel env add ${name} ${environment}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (add.status !== 0) {
      throw new Error(add.stderr || add.stdout || update.stderr || update.stdout || `Failed to set ${name} for ${environment}`);
    }
    console.log(`  ${name} -> ${environment}`);
  }
}

function checkDomainAvailability() {
  try {
    const headers = run('curl -sI "https://post-evaluation-form-v2.vercel.app/?question=1"');
    const location = headers.match(/^location:\s*(.+)$/im)?.[1]?.trim() ?? "";
    const videoLength = run(
      'curl -sI "https://post-evaluation-form-v2.vercel.app/videos/question-01.mp4"',
    ).match(/^content-length:\s*(\d+)/im)?.[1];
    return { location, videoLength: videoLength ? Number(videoLength) : 0 };
  } catch {
    return { location: "", videoLength: 0 };
  }
}

async function main() {
  const aliasOnly = process.argv.includes("--alias-only");
  const root = resolve(import.meta.dirname, "..");
  process.chdir(root);

  const envPath = resolve(root, ".env.local");
  const env = parseEnvFile(envPath);
  env.NEXT_PUBLIC_APP_URL = PRODUCTION_URL;
  env.NEXT_PUBLIC_APP_VERSION = env.NEXT_PUBLIC_APP_VERSION || "v2";

  if (!aliasOnly) {
    console.log("Syncing Vercel environment variables...");
    for (const key of ENV_KEYS) {
      if (!env[key]) {
        console.warn(`  Skipping ${key} (missing in .env.local)`);
        continue;
      }
      upsertEnv(key, env[key]);
    }

    console.log("\nDeploying production build...");
    const deployOutput = run("vercel --prod --yes");
    const deploymentUrl =
      deployOutput.match(/https:\/\/[^\s]+vercel\.app/)?.[0] ??
      run("vercel ls post-evaluation-form-v2 --prod").split("\n")[1]?.trim();
    if (!deploymentUrl) {
      throw new Error("Could not determine deployment URL after deploy.");
    }
    console.log(`  Deployment: ${deploymentUrl}`);
  }

  const { location, videoLength } = checkDomainAvailability();
  const stalePasswordGate = location.includes("/access");
  const staleVideo = videoLength > 0 && videoLength < 100_000;

  if (stalePasswordGate || staleVideo) {
    console.log("\npost-evaluation-form-v2.vercel.app is still owned by the old Ecko/ifcs project.");
    console.log("Do this once in the ifcs Vercel dashboard:");
    console.log("  1. Delete project: post-evaluation-form-v2");
    console.log("  2. Rename project: post-evaluation-form -> post-evaluation-form-v2");
    console.log("  3. Remove SITE_PASSWORD / SITE_ACCESS_SECRET env vars if present");
    console.log("  4. Copy env vars from this script output, then redeploy");
    console.log("\nOr sign in to the ifcs team in the CLI and rerun this script:");
  console.log("  vercel login");
  console.log("  vercel teams switch ifcs");
  console.log("  node scripts/setup-vercel-production.mjs");
    process.exitCode = 2;
    return;
  }

  const deploymentUrl = run("vercel ls post-evaluation-form-v2 --prod").match(/https:\/\/\S+/)?.[0];
  if (!deploymentUrl) {
    throw new Error("Could not find latest production deployment.");
  }

  console.log("\nClaiming production alias...");
  try {
    run(`vercel alias set ${deploymentUrl} post-evaluation-form-v2.vercel.app`);
    console.log(`  Aliased ${PRODUCTION_URL}`);
  } catch (error) {
  console.error(error.message || error);
    process.exitCode = 1;
    return;
  }

  const finalVideoLength = checkDomainAvailability().videoLength;
  console.log(`\nProduction ready at ${PRODUCTION_URL}`);
  console.log(`  Video size: ${finalVideoLength} bytes`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
