import assert from "node:assert/strict";
import {
  buildProductionConfig,
  PRODUCTION_ADMIN_HOST,
  PRODUCTION_D1_NAME,
  PRODUCTION_PUBLIC_HOST,
  PRODUCTION_WORKER_NAME,
} from "../cloudflare/production-config-core.mjs";
import {
  cutoffIso,
  parseProductionRetentionConfig,
  retentionCountSql,
  retentionDeleteSql,
} from "./retention-core.mjs";

const generated = {
  main: "index.mjs",
  compatibility_flags: ["nodejs_compat"],
  assets: { binding: "ASSETS", directory: "../public" },
  durable_objects: {
    bindings: [{ name: "CONSULTATION_REALTIME", class_name: "ConsultationRealtimeHub" }],
  },
  exports: { ConsultationRealtimeHub: { type: "durable-object", storage: "sqlite" } },
};

const production = buildProductionConfig(generated, {
  databaseId: "11111111-1111-4111-8111-111111111111",
  privacyVersion: "2026-09-23-test",
  retentionDays: 90,
  submitRateNamespaceId: "910001",
  loginRateNamespaceId: "910002",
});

assert.equal(production.name, PRODUCTION_WORKER_NAME);
assert.equal(production.workers_dev, false);
assert.equal(production.preview_urls, false);
assert.equal(production.routes[0].pattern, PRODUCTION_PUBLIC_HOST);
assert.equal(production.routes[1].pattern, PRODUCTION_ADMIN_HOST);
assert.equal(production.assets.run_worker_first, true);
assert.equal(production.vars.LIVE_BACKEND_ENV, "production");
assert.equal(production.vars.CONSULTATION_RETENTION_DAYS, "90");
assert.equal(production.d1_databases[0].database_name, PRODUCTION_D1_NAME);
assert.equal(production.ratelimits[0].namespace_id, "910001");
assert.equal(production.ratelimits[1].namespace_id, "910002");
assert.deepEqual(production.secrets.required, ["ADMIN_AUTH_PEPPER", "ADMIN_AUTH_CSRF_SECRET"]);

assert.throws(
  () =>
    buildProductionConfig(generated, {
      databaseId: "11111111-1111-4111-8111-111111111111",
      privacyVersion: "2026-09-23-test",
      retentionDays: 90,
      submitRateNamespaceId: "7",
      loginRateNamespaceId: "7",
    }),
  /distinct namespace/,
);

const policy = parseProductionRetentionConfig(production);
assert.equal(policy.databaseName, PRODUCTION_D1_NAME);
assert.equal(policy.retentionDays, 90);

const cutoff = cutoffIso(new Date("2026-09-23T00:00:00.000Z"), 90);
assert.equal(cutoff, "2026-06-25T00:00:00.000Z");
assert.match(retentionCountSql(cutoff), /^SELECT COUNT\(\*\)/);
assert.match(retentionDeleteSql(cutoff), /^DELETE FROM consultation_requests/);

assert.throws(
  () =>
    parseProductionRetentionConfig({
      ...production,
      vars: { ...production.vars, LIVE_BACKEND_ENV: "staging" },
    }),
  /production/,
);

console.log("RITO production readiness contracts: PASS");
