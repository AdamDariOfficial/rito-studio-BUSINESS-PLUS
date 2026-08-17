import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_WORKER_NAME = "rito-studio-business-plus-staging";
const D1_NAME = "rito-studio-business-plus-staging";
const REQUIRED_DO_CLASS = "ConsultationRealtimeHub";

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined || value.startsWith("--")) {
      fail(`Invalid arguments near ${key ?? "<end>"}.`);
    }
    values.set(key.slice(2), value);
  }
  return values;
}

function required(args, name) {
  const value = args.get(name)?.trim();
  if (!value) fail(`Missing required --${name}.`);
  return value;
}

function validateDatabaseId(value) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    fail("--database-id must be a UUID returned by Cloudflare D1 provisioning.");
  }
  return value;
}

function validatePrivacyVersion(value) {
  if (!/^[A-Za-z0-9._:-]{1,80}$/.test(value)) {
    fail("--privacy-version contains unsupported characters.");
  }
  return value;
}

function validateNamespaceId(value, flagName) {
  if (!/^\d+$/.test(value) || BigInt(value) <= 0n) {
    fail(`--${flagName} must be a positive integer string.`);
  }
  return value;
}

function validateHostname(value, flagName) {
  const normalized = value.trim().toLowerCase();
  if (
    normalized.length > 253 ||
    !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(
      normalized,
    )
  ) {
    fail(`--${flagName} must be a valid Cloudflare-managed hostname without scheme or path.`);
  }
  return normalized;
}

function validateWorkerName(value) {
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(value)) {
    fail("--worker-name must be a lowercase Workers-compatible name.");
  }
  return value;
}

function assertGeneratedWorker(config) {
  if (typeof config.main !== "string" || !config.main)
    fail("Generated Wrangler config has no main.");
  if (!config.assets || typeof config.assets !== "object")
    fail("Generated Wrangler config has no assets block.");
  if (
    !Array.isArray(config.compatibility_flags) ||
    !config.compatibility_flags.includes("nodejs_compat")
  ) {
    fail("Generated Worker must preserve the nodejs_compat compatibility flag.");
  }

  const bindings = config.durable_objects?.bindings;
  if (
    !Array.isArray(bindings) ||
    !bindings.some(
      (binding) =>
        binding?.name === "CONSULTATION_REALTIME" && binding?.class_name === REQUIRED_DO_CLASS,
    )
  ) {
    fail("Generated Worker is missing CONSULTATION_REALTIME -> ConsultationRealtimeHub.");
  }
  if (config.exports?.[REQUIRED_DO_CLASS]?.type !== "durable-object") {
    fail("Generated Worker is missing the ConsultationRealtimeHub declarative export.");
  }

  const serialized = JSON.stringify(config);
  for (const forbidden of [
    "SPIKE_DB",
    "SPIKE_REALTIME",
    "LIVE_ADAPTER_SPIKE",
    "RealtimeAdapterSpikeHub",
    "ACCESS_TEAM_DOMAIN",
    "ACCESS_AUD",
  ]) {
    if (serialized.includes(forbidden))
      fail(`Generated Worker contains forbidden legacy marker ${forbidden}.`);
  }
}

const args = parseArgs(process.argv.slice(2));
const databaseId = validateDatabaseId(required(args, "database-id"));
const privacyVersion = validatePrivacyVersion(required(args, "privacy-version"));
const submitRateNamespaceId = validateNamespaceId(
  required(args, "submit-rate-namespace-id"),
  "submit-rate-namespace-id",
);
const loginRateNamespaceId = validateNamespaceId(
  required(args, "login-rate-namespace-id"),
  "login-rate-namespace-id",
);
if (submitRateNamespaceId === loginRateNamespaceId) {
  fail("Submit and admin-login rate limiters must use distinct namespace IDs.");
}
const workerName = validateWorkerName(args.get("worker-name")?.trim() || DEFAULT_WORKER_NAME);
const hostname = validateHostname(required(args, "hostname"), "hostname");
const adminHostname = validateHostname(required(args, "admin-hostname"), "admin-hostname");
if (hostname === adminHostname) fail("--hostname and --admin-hostname must be distinct.");

const repoRoot = process.cwd();
const sourcePath = path.join(repoRoot, ".output", "server", "wrangler.json");
const outputPath = path.join(repoRoot, ".output", "server", "wrangler.staging.json");
if (!fs.existsSync(sourcePath)) fail(`Missing generated Worker config: ${sourcePath}`);

const config = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
assertGeneratedWorker(config);

const staging = structuredClone(config);
staging.name = workerName;
staging.workers_dev = false;
staging.preview_urls = false;
staging.routes = [
  { pattern: hostname, custom_domain: true },
  { pattern: adminHostname, custom_domain: true },
];
staging.vars = {
  ...(staging.vars ?? {}),
  LIVE_BACKEND_ENV: "staging",
  CONSULTATION_PRIVACY_VERSION: privacyVersion,
};
staging.d1_databases = [
  {
    binding: "CONSULTATION_DB",
    database_name: D1_NAME,
    database_id: databaseId,
    migrations_dir: "../../migrations",
  },
];
staging.ratelimits = [
  {
    name: "CONSULTATION_SUBMIT_RATE_LIMITER",
    namespace_id: submitRateNamespaceId,
    simple: { limit: 5, period: 60 },
  },
  {
    name: "ADMIN_LOGIN_RATE_LIMITER",
    namespace_id: loginRateNamespaceId,
    simple: { limit: 5, period: 60 },
  },
];

fs.writeFileSync(outputPath, `${JSON.stringify(staging, null, 2)}\n`, "utf8");

console.log("STAGING CONFIG PREPARED — NO DEPLOY PERFORMED");
console.log(`Input:  ${sourcePath}`);
console.log(`Output: ${outputPath}`);
console.log(`Worker: ${workerName}`);
console.log(`Public: https://${hostname}`);
console.log(`Admin:  https://${adminHostname}/admin/login`);
console.log(`D1:     ${D1_NAME} (${databaseId})`);
console.log(`Submit rate: namespace ${submitRateNamespaceId}, 5 per 60s`);
console.log(`Login rate:  namespace ${loginRateNamespaceId}, 5 per 60s`);
console.log(`Privacy version: ${privacyVersion}`);
console.log("Secrets ADMIN_AUTH_PEPPER and ADMIN_AUTH_CSRF_SECRET must be provisioned separately.");
