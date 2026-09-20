import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function hasLine(text, line) {
  return text.split(/\r?\n/).some((entry) => entry.trim() === line);
}

const packageJson = readJson("package.json");
assert.equal(packageJson.private, true);
assert.equal(packageJson.type, "module");
assert.equal(packageJson.scripts?.typecheck, "tsc --noEmit");
assert.equal(packageJson.scripts?.lint, "eslint .");
assert.equal(
  packageJson.scripts?.test,
  "node --experimental-strip-types tools/live-backend/test-native-admin-auth.ts",
);
assert.equal(
  packageJson.scripts?.["test:security"],
  "node --experimental-strip-types tools/security/test-security-remediation.ts",
);
assert.equal(packageJson.scripts?.build, "vite build");
for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
  assert.equal(
    /\b(wrangler\s+deploy|wrangler\s+d1|drizzle-kit\s+(push|migrate)|prisma\s+migrate)\b/i.test(
      command,
    ),
    false,
    `package script ${name} must not perform deploy or migration`,
  );
}

const tsconfig = read("tsconfig.json");
assert.ok(/"strict"\s*:\s*true/.test(tsconfig));
assert.ok(/"noEmit"\s*:\s*true/.test(tsconfig));
assert.ok(/"moduleResolution"\s*:\s*"Bundler"/.test(tsconfig));

const viteConfig = read("vite.config.ts");
assert.ok(viteConfig.includes('external: ["cloudflare:workers"]'));
assert.ok(/server:\s*\{\s*entry:\s*"server"\s*\}/m.test(viteConfig));

const wranglerConfig = read("wrangler.jsonc");
assert.ok(
  wranglerConfig.includes("SOURCE BUILD CONFIG ONLY — DO NOT DEPLOY THIS UNPROVISIONED FILE."),
);
assert.ok(
  wranglerConfig.includes('"name": "rito-studio-business-plus-unprovisioned-do-not-deploy"'),
);
assert.ok(wranglerConfig.includes('"compatibility_flags": ["nodejs_compat"]'));
assert.ok(wranglerConfig.includes('"LIVE_BACKEND_ENV": "unprovisioned"'));
assert.ok(wranglerConfig.includes('"name": "CONSULTATION_REALTIME"'));
assert.ok(wranglerConfig.includes('"class_name": "ConsultationRealtimeHub"'));
assert.equal(
  /"routes?"\s*:/m.test(wranglerConfig),
  false,
  "source Wrangler config must not bind routes",
);

const gitignore = read(".gitignore");
assert.ok(hasLine(gitignore, ".tretnix/"), ".tretnix/ must be ignored at repository root");

const gitattributes = read(".gitattributes");
assert.ok(hasLine(gitattributes, "* text=auto eol=lf"));

const manifest = readJson("tretnix.project.json");
assert.equal(manifest.schema_version, 1);
assert.equal(manifest.project?.id, "rito-studio-business-plus");
assert.equal(manifest.project?.family, "beauty-wellness");
assert.equal(manifest.project?.plan, "BUSINESS PLUS");
assert.equal(manifest.project?.repository, "AdamDariOfficial/rito-studio-BUSINESS-PLUS");
assert.equal(manifest.project?.default_branch, "main");

const expectedClasses = [
  "docs_only",
  "frontend",
  "backend",
  "security_or_data",
  "release_or_infra",
];
assert.deepEqual(
  [...manifest.validation.supported_task_classes].sort(),
  [...expectedClasses].sort(),
);

const expectedFloors = {
  docs_only: ["static", "whitespace"],
  frontend: ["typecheck", "lint", "test", "build"],
  backend: ["typecheck", "lint", "test", "security"],
  security_or_data: ["static", "test", "security", "whitespace"],
  release_or_infra: ["static", "test", "config", "whitespace"],
};
for (const taskClass of expectedClasses) {
  assert.deepEqual(
    [...manifest.validation.required_capabilities[taskClass]].sort(),
    [...expectedFloors[taskClass]].sort(),
    `capability floor drift for ${taskClass}`,
  );
}

const expectedValidators = [
  "static-config-contract",
  "typecheck",
  "lint",
  "native-auth-test",
  "security-test",
  "build",
  "git-diff-check",
];
assert.deepEqual(
  manifest.validation.validators.map((entry) => entry.id),
  expectedValidators,
);

assert.ok(manifest.validation.security_sensitive_prefixes.includes("tretnix.project.json"));
assert.ok(manifest.validation.security_sensitive_prefixes.includes("tools/development-os/"));
assert.ok(manifest.validation.release_or_infra_prefixes.includes(".gitignore"));
assert.ok(manifest.validation.release_or_infra_prefixes.includes(".gitattributes"));
assert.ok(manifest.validation.release_or_infra_prefixes.includes("tools/development-os/"));
assert.ok(manifest.validation.frontend_prefixes.includes("public/"));
assert.ok(manifest.validation.backend_prefixes.includes("src/types/"));

assert.equal(manifest.gates?.browser, true);
assert.equal(manifest.gates?.backend, true);
assert.equal(manifest.gates?.staging, true);
assert.equal(manifest.gates?.production, false);

const requiredForbidden = [
  "stage",
  "commit",
  "push",
  "pull_request",
  "merge",
  "deploy",
  "publish",
  "migration",
  "dns",
  "infrastructure_mutation",
  "provisioning",
  "secret_mutation",
  "production_write",
];
for (const action of requiredForbidden) {
  assert.ok(
    manifest.forbidden_automatic_actions.includes(action),
    `missing forbidden action ${action}`,
  );
}

for (const requiredPath of [
  "tools/live-backend/test-native-admin-auth.ts",
  "tools/security/test-security-remediation.ts",
]) {
  assert.ok(fs.statSync(path.join(repoRoot, requiredPath)).isFile(), `missing ${requiredPath}`);
}

console.log("RITO Development OS static/config contract: PASS");
