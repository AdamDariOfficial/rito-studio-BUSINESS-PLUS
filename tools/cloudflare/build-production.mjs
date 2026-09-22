import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, ".output", "server");
const wranglerPath = path.join(outputRoot, "wrangler.json");
const workerEntryPath = path.join(outputRoot, "index.mjs");
const stampPath = path.join(outputRoot, "rito-production-build.json");

function fail(message) {
  throw new Error(message);
}

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) fail(`${name} is required for a production live build.`);
  return value;
}

function sha256(pathname) {
  return createHash("sha256").update(fs.readFileSync(pathname)).digest("hex");
}

const siteUrl = requiredEnvironment("VITE_SITE_URL");
if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(siteUrl)) {
  fail("VITE_SITE_URL must be an HTTPS origin without a path.");
}

for (const name of [
  "VITE_PRIVACY_CONTROLLER_NAME",
  "VITE_PRIVACY_CONTROLLER_CONTACT",
  "VITE_PRIVACY_LAWFUL_BASIS",
  "VITE_PRIVACY_RECIPIENTS",
  "VITE_PRIVACY_LAST_UPDATED",
]) {
  requiredEnvironment(name);
}

const retentionRaw = requiredEnvironment("VITE_PRIVACY_RETENTION_DAYS");
if (!/^\d+$/.test(retentionRaw)) {
  fail("VITE_PRIVACY_RETENTION_DAYS must be an integer.");
}
const retentionDays = Number(retentionRaw);
if (!Number.isSafeInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) {
  fail("VITE_PRIVACY_RETENTION_DAYS must be between 1 and 3650.");
}

if (fs.existsSync(stampPath)) fs.rmSync(stampPath);

const command = process.platform === "win32" ? "bun.exe" : "bun";
const result = spawnSync(command, ["run", "build"], {
  cwd: repoRoot,
  env: {
    ...process.env,
    VITE_CONSULTATION_PROFILE: "live",
    VITE_CONSULTATION_HANDOFF: "inbox",
  },
  encoding: "utf8",
  stdio: "inherit",
  windowsHide: true,
});

if (result.error) fail(`Unable to start production build: ${result.error.message}`);
if (result.status !== 0) {
  fail(`Production build failed with exit ${result.status ?? "unknown"}.`);
}

for (const pathname of [wranglerPath, workerEntryPath]) {
  if (!fs.existsSync(pathname)) fail(`Production build did not produce ${pathname}.`);
}

const generated = JSON.parse(fs.readFileSync(wranglerPath, "utf8"));
if (typeof generated.main !== "string" || !generated.main) {
  fail("Generated Wrangler config has no main entry.");
}
if (!generated.assets || typeof generated.assets !== "object") {
  fail("Generated Wrangler config has no assets block.");
}
if (
  !Array.isArray(generated.compatibility_flags) ||
  !generated.compatibility_flags.includes("nodejs_compat")
) {
  fail("Generated Worker must preserve nodejs_compat.");
}

const stamp = {
  schemaVersion: 1,
  target: "cloudflare",
  environment: "production",
  profile: "live",
  generatedAt: new Date().toISOString(),
  wranglerSha256: sha256(wranglerPath),
  workerEntrySha256: sha256(workerEntryPath),
  siteUrl,
  retentionDays,
  privacyInputsPresent: true,
};

fs.writeFileSync(stampPath, `${JSON.stringify(stamp, null, 2)}\n`, "utf8");

console.log("RITO PRODUCTION BUILD PREPARED - NO DEPLOY PERFORMED");
console.log(`Wrangler SHA-256: ${stamp.wranglerSha256}`);
console.log(`Worker SHA-256:   ${stamp.workerEntrySha256}`);
console.log(`Stamp:            ${stampPath}`);
