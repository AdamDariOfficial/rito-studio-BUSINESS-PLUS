import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  cutoffIso,
  parseProductionRetentionConfig,
  retentionCountSql,
  retentionDeleteSql,
} from "./retention-core.mjs";

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

const args = parseArgs(process.argv.slice(2));
const configPath = path.resolve(args.get("config") || ".output/server/wrangler.production.json");
const mode = args.get("mode") || "dry-run";

if (mode !== "dry-run" && mode !== "execute") {
  fail("--mode must be dry-run or execute.");
}
if (!fs.existsSync(configPath)) {
  fail(`Production config not found: ${configPath}`);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const policy = parseProductionRetentionConfig(config);
const cutoff = cutoffIso(new Date(), policy.retentionDays);
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

function runSql(sql) {
  const result = spawnSync(
    npx,
    [
      "--yes",
      "wrangler@4.114.0",
      "d1",
      "execute",
      policy.databaseName,
      "--remote",
      "--config",
      configPath,
      "--command",
      sql,
      "--json",
    ],
    { encoding: "utf8", windowsHide: true },
  );

  if (result.error) fail(`Wrangler did not start: ${result.error.message}`);
  if (result.status !== 0) {
    fail(`Wrangler D1 command failed with exit ${result.status ?? "unknown"}.`);
  }
  return JSON.parse(result.stdout);
}

function firstTotal(payload) {
  const entries = Array.isArray(payload) ? payload : [payload];
  for (const entry of entries) {
    if (Array.isArray(entry?.results) && entry.results.length > 0 && "total" in entry.results[0]) {
      return Number(entry.results[0].total);
    }
  }
  fail("D1 count query returned an unexpected shape.");
}

const before = firstTotal(runSql(retentionCountSql(cutoff)));

console.log("RITO PRODUCTION RETENTION");
console.log(`Database:       ${policy.databaseName}`);
console.log(`Retention days: ${policy.retentionDays}`);
console.log(`Cutoff:         ${cutoff}`);
console.log(`Expired rows:   ${before}`);

if (mode === "dry-run") {
  console.log("Mode: DRY-RUN - no rows deleted.");
  process.exit(0);
}

const expectedConfirm = `PURGE:${policy.databaseName}:${policy.retentionDays}`;
if (args.get("confirm") !== expectedConfirm) {
  fail(`Execution requires --confirm "${expectedConfirm}".`);
}

runSql(retentionDeleteSql(cutoff));
const after = firstTotal(runSql(retentionCountSql(cutoff)));
if (after !== 0) {
  fail(`Retention verification failed: ${after} expired rows remain.`);
}

console.log(`Deleted rows:    ${before}`);
console.log("Mode: EXECUTE - retention purge verified.");
