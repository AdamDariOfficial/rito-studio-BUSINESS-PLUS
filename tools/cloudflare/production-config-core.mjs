export const PRODUCTION_WORKER_NAME = "rito-studio-business-plus-production";
export const PRODUCTION_D1_NAME = "rito-studio-business-plus-production";
export const PRODUCTION_PUBLIC_HOST = "rito-studio-business-plus.tretnix.com";
export const PRODUCTION_ADMIN_HOST = "admin.rito-studio-business-plus.tretnix.com";
export const PRODUCTION_ENTRY_FILENAME = "production-worker-entry.mjs";
export const PRODUCTION_SECURITY_RESPONSE_FILENAME = "production-security-response.mjs";

const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function fail(message) {
  throw new Error(message);
}

export function parseArgs(argv) {
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

export function required(args, name) {
  const value = args.get(name)?.trim();
  if (!value) fail(`Missing required --${name}.`);
  return value;
}

export function validateDatabaseId(value) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    fail("--database-id must be a UUID returned by Cloudflare D1 provisioning.");
  }
  return value;
}

export function validateNamespaceId(value, flagName) {
  if (!/^\d+$/.test(value) || BigInt(value) <= 0n) {
    fail(`--${flagName} must be a positive integer string.`);
  }
  return value;
}

export function validatePrivacyVersion(value) {
  if (!/^[A-Za-z0-9._:-]{1,80}$/.test(value)) {
    fail("--privacy-version contains unsupported characters.");
  }
  return value;
}

export function validateRetentionDays(value) {
  if (!/^\d+$/.test(value)) fail("--retention-days must be an integer.");
  const days = Number(value);
  if (!Number.isSafeInteger(days) || days < 1 || days > 3650) {
    fail("--retention-days must be between 1 and 3650.");
  }
  return days;
}

export function validateHostname(value, flagName) {
  const normalized = value.trim().toLowerCase();
  if (!HOSTNAME_PATTERN.test(normalized)) {
    fail(`--${flagName} must be a valid hostname.`);
  }
  return normalized;
}

export function assertGeneratedWorker(config) {
  if (typeof config.main !== "string" || !config.main) {
    fail("Generated Wrangler config has no main.");
  }
  if (!config.assets || typeof config.assets !== "object" || config.assets.binding !== "ASSETS") {
    fail("Generated Worker must expose the ASSETS binding.");
  }
  if (
    !Array.isArray(config.compatibility_flags) ||
    !config.compatibility_flags.includes("nodejs_compat")
  ) {
    fail("Generated Worker must preserve nodejs_compat.");
  }

  const bindings = config.durable_objects?.bindings;
  if (
    !Array.isArray(bindings) ||
    !bindings.some(
      (binding) =>
        binding?.name === "CONSULTATION_REALTIME" &&
        binding?.class_name === "ConsultationRealtimeHub",
    )
  ) {
    fail("Generated Worker is missing CONSULTATION_REALTIME -> ConsultationRealtimeHub.");
  }

  if (config.exports?.ConsultationRealtimeHub?.type !== "durable-object") {
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
    if (serialized.includes(forbidden)) {
      fail(`Generated Worker contains forbidden legacy marker ${forbidden}.`);
    }
  }
}

export function buildProductionConfig(generated, input) {
  assertGeneratedWorker(generated);

  const databaseId = validateDatabaseId(input.databaseId);
  const privacyVersion = validatePrivacyVersion(input.privacyVersion);
  const retentionDays = validateRetentionDays(String(input.retentionDays));
  const submitRateNamespaceId = validateNamespaceId(
    input.submitRateNamespaceId,
    "submit-rate-namespace-id",
  );
  const loginRateNamespaceId = validateNamespaceId(
    input.loginRateNamespaceId,
    "login-rate-namespace-id",
  );

  if (submitRateNamespaceId === loginRateNamespaceId) {
    fail("Submit and admin-login rate limiters must use distinct namespace IDs.");
  }

  const publicHost = validateHostname(PRODUCTION_PUBLIC_HOST, "hostname");
  const adminHost = validateHostname(PRODUCTION_ADMIN_HOST, "admin-hostname");

  const config = structuredClone(generated);
  config.name = PRODUCTION_WORKER_NAME;
  config.main = PRODUCTION_ENTRY_FILENAME;
  config.workers_dev = false;
  config.preview_urls = false;
  delete config.route;
  delete config.routes;
  config.routes = [
    { pattern: publicHost, custom_domain: true },
    { pattern: adminHost, custom_domain: true },
  ];
  config.assets = {
    ...config.assets,
    run_worker_first: true,
  };
  config.vars = {
    ...(config.vars ?? {}),
    LIVE_BACKEND_ENV: "production",
    CONSULTATION_PRIVACY_VERSION: privacyVersion,
    CONSULTATION_RETENTION_DAYS: String(retentionDays),
  };
  config.d1_databases = [
    {
      binding: "CONSULTATION_DB",
      database_name: PRODUCTION_D1_NAME,
      database_id: databaseId,
      migrations_dir: "../../migrations",
    },
  ];
  config.secrets = {
    required: ["ADMIN_AUTH_PEPPER", "ADMIN_AUTH_CSRF_SECRET"],
  };
  config.ratelimits = [
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

  return config;
}
