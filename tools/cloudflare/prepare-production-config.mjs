import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  buildProductionConfig,
  parseArgs,
  PRODUCTION_ADMIN_HOST,
  PRODUCTION_D1_NAME,
  PRODUCTION_ENTRY_FILENAME,
  PRODUCTION_PUBLIC_HOST,
  PRODUCTION_SECURITY_RESPONSE_FILENAME,
  PRODUCTION_WORKER_NAME,
  required,
  validateDatabaseId,
  validateNamespaceId,
  validatePrivacyVersion,
  validateRetentionDays,
} from "./production-config-core.mjs";

const args = parseArgs(process.argv.slice(2));
const databaseId = validateDatabaseId(required(args, "database-id"));
const privacyVersion = validatePrivacyVersion(required(args, "privacy-version"));
const retentionDays = validateRetentionDays(required(args, "retention-days"));
const submitRateNamespaceId = validateNamespaceId(
  required(args, "submit-rate-namespace-id"),
  "submit-rate-namespace-id",
);
const loginRateNamespaceId = validateNamespaceId(
  required(args, "login-rate-namespace-id"),
  "login-rate-namespace-id",
);

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, ".output", "server");
const sourcePath = path.join(outputRoot, "wrangler.json");
const workerEntryPath = path.join(outputRoot, "index.mjs");
const buildStampPath = path.join(outputRoot, "rito-production-build.json");
const outputPath = path.join(outputRoot, "wrangler.production.json");
const toolingRoot = path.join(repoRoot, "tools", "cloudflare");

function fail(message) {
  throw new Error(message);
}

function sha256(pathname) {
  return createHash("sha256").update(fs.readFileSync(pathname)).digest("hex");
}

for (const pathname of [sourcePath, workerEntryPath, buildStampPath]) {
  if (!fs.existsSync(pathname)) fail(`Missing production build artifact: ${pathname}`);
}

const stamp = JSON.parse(fs.readFileSync(buildStampPath, "utf8"));
if (
  stamp?.schemaVersion !== 1 ||
  stamp?.target !== "cloudflare" ||
  stamp?.environment !== "production" ||
  stamp?.profile !== "live" ||
  stamp?.privacyInputsPresent !== true
) {
  fail("Production config requires a matching stamped live production build.");
}
if (
  stamp.wranglerSha256 !== sha256(sourcePath) ||
  stamp.workerEntrySha256 !== sha256(workerEntryPath)
) {
  fail("Production build stamp is stale. Re-run tools/cloudflare/build-production.mjs.");
}
if (Number(stamp.retentionDays) !== retentionDays) {
  fail("Build-time privacy retention and runtime retention must match.");
}
if (stamp.siteUrl !== `https://${PRODUCTION_PUBLIC_HOST}`) {
  fail("VITE_SITE_URL does not match the approved production public host.");
}

fs.copyFileSync(
  path.join(toolingRoot, "production-worker-entry.template.mjs"),
  path.join(outputRoot, PRODUCTION_ENTRY_FILENAME),
);
fs.copyFileSync(
  path.join(toolingRoot, PRODUCTION_SECURITY_RESPONSE_FILENAME),
  path.join(outputRoot, PRODUCTION_SECURITY_RESPONSE_FILENAME),
);

const generated = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const config = buildProductionConfig(generated, {
  databaseId,
  privacyVersion,
  retentionDays,
  submitRateNamespaceId,
  loginRateNamespaceId,
});
fs.writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");

console.log("RITO PRODUCTION CONFIG PREPARED - NO DEPLOY PERFORMED");
console.log(`Output:      ${outputPath}`);
console.log(`Worker:      ${PRODUCTION_WORKER_NAME}`);
console.log(`Public:      https://${PRODUCTION_PUBLIC_HOST}`);
console.log(`Admin:       https://${PRODUCTION_ADMIN_HOST}/admin/login`);
console.log(`D1:          ${PRODUCTION_D1_NAME} (${databaseId})`);
console.log(`Retention:   ${retentionDays} days`);
console.log(`Submit rate: namespace ${submitRateNamespaceId}, 5 per 60s`);
console.log(`Login rate:  namespace ${loginRateNamespaceId}, 5 per 60s`);
console.log("Required secrets: ADMIN_AUTH_PEPPER, ADMIN_AUTH_CSRF_SECRET");
