import assert from "node:assert/strict";
import { createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { adminLoginSchema } from "../../src/features/consultation/admin-auth.schemas.ts";
import {
  ADMIN_CSRF_CONTEXT,
  ADMIN_PASSWORD_SCHEME,
  ADMIN_PASSWORD_SCRYPT_MAXMEM_BYTES,
  ADMIN_PASSWORD_SCRYPT_N,
  ADMIN_PASSWORD_SCRYPT_P,
  ADMIN_PASSWORD_SCRYPT_R,
  ADMIN_PASSWORD_WORK_FACTOR,
  createAdminPasswordRecord,
  createOpaqueAdminSessionToken,
  createSessionCsrfToken,
  fingerprintAdminAuthSecret,
  hashAdminPassword,
  hashOpaqueToken,
  verifyAdminPassword,
  verifyAdminPasswordOutcome,
  verifySessionCsrfToken,
} from "../../src/features/consultation/live/admin-auth-crypto.server.ts";

const pepper = "test-pepper-value-that-is-longer-than-thirty-two-characters";
const csrfSecret = "test-csrf-secret-that-is-longer-than-thirty-two-characters";
const password = "Correct-Horse-Battery-Staple-2026";
const whitespacePassword = "  Exact Password 2026  ";

const subtle = crypto.subtle;
const originalTimingSafeEqual = subtle.timingSafeEqual?.bind(subtle);
let timingSafeEqualCalls = 0;
Object.defineProperty(subtle, "timingSafeEqual", {
  configurable: true,
  value(first: ArrayBuffer | ArrayBufferView, second: ArrayBuffer | ArrayBufferView) {
    timingSafeEqualCalls += 1;
    if (originalTimingSafeEqual) return originalTimingSafeEqual(first, second);
    return timingSafeEqual(Buffer.from(first), Buffer.from(second));
  },
});

const first = await createAdminPasswordRecord(password, pepper);
const second = await createAdminPasswordRecord(password, pepper);

assert.equal(first.scheme, ADMIN_PASSWORD_SCHEME);
assert.equal(first.passwordWorkFactor, ADMIN_PASSWORD_WORK_FACTOR);
assert.equal(await verifyAdminPassword(password, first, pepper), true);
assert.equal(await verifyAdminPassword("wrong password", first, pepper), false);
assert.equal(await verifyAdminPassword(password, first, `${pepper}-wrong`), false);
assert.notEqual(first.salt, second.salt, "password salts must be unique");
assert.notEqual(first.passwordHash, second.passwordHash, "salted password hashes must differ");

const fixedSalt = Buffer.from("000102030405060708090a0b0c0d0e0f", "hex");
const oracleDerived = scryptSync(Buffer.from(whitespacePassword, "utf8"), fixedSalt, 32, {
  N: ADMIN_PASSWORD_SCRYPT_N,
  r: ADMIN_PASSWORD_SCRYPT_R,
  p: ADMIN_PASSWORD_SCRYPT_P,
  maxmem: ADMIN_PASSWORD_SCRYPT_MAXMEM_BYTES,
});
const oracleTag = createHmac("sha256", pepper).update(oracleDerived).digest("base64url");
assert.equal(
  oracleTag,
  "AlLg_e9Tj_2WaY1uQyZG4EtCuUSSrJhT4TR7Lqxdsnc",
  "fixed Node crypto known-answer changed",
);
assert.equal(
  await hashAdminPassword(whitespacePassword, fixedSalt, pepper),
  oracleTag,
  "runtime scrypt/HMAC output must remain byte-compatible with the fixed Node oracle",
);

const knownAnswerRecord = {
  scheme: ADMIN_PASSWORD_SCHEME,
  passwordWorkFactor: ADMIN_PASSWORD_WORK_FACTOR,
  salt: fixedSalt.toString("base64url"),
  passwordHash: oracleTag,
};
assert.equal(
  (await verifyAdminPasswordOutcome(whitespacePassword, knownAnswerRecord, pepper)).outcome,
  "match",
  "production verifier must match the fixed Node crypto oracle",
);
assert.equal(
  (await verifyAdminPasswordOutcome("Exact Password 2026", knownAnswerRecord, pepper)).outcome,
  "mismatch",
  "a password with the same trimmed core must not authenticate",
);
assert.equal(
  (await verifyAdminPasswordOutcome("wrong password", knownAnswerRecord, pepper)).outcome,
  "mismatch",
);
const cryptoErrorResult = await verifyAdminPasswordOutcome(
  whitespacePassword,
  knownAnswerRecord,
  "short",
);
assert.equal(cryptoErrorResult.outcome, "crypto_error");
assert.equal(cryptoErrorResult.cryptoErrorName, "Error");

assert.equal(
  (
    await verifyAdminPasswordOutcome(
      whitespacePassword,
      { ...knownAnswerRecord, passwordHash: "not*base64url" },
      pepper,
    )
  ).outcome,
  "invalid_record",
);
assert.equal(
  (
    await verifyAdminPasswordOutcome(
      whitespacePassword,
      { ...knownAnswerRecord, salt: Buffer.alloc(15).toString("base64url") },
      pepper,
    )
  ).outcome,
  "invalid_record",
);
assert.equal(
  (
    await verifyAdminPasswordOutcome(
      whitespacePassword,
      { ...knownAnswerRecord, passwordHash: Buffer.alloc(31).toString("base64url") },
      pepper,
    )
  ).outcome,
  "invalid_record",
);
assert.equal(
  (
    await verifyAdminPasswordOutcome(
      whitespacePassword,
      { ...knownAnswerRecord, scheme: "unsupported" },
      pepper,
    )
  ).outcome,
  "invalid_record",
);
assert.equal(
  (
    await verifyAdminPasswordOutcome(
      whitespacePassword,
      { ...knownAnswerRecord, passwordWorkFactor: String(ADMIN_PASSWORD_WORK_FACTOR) },
      pepper,
    )
  ).outcome,
  "invalid_record",
  "D1 work-factor values must not be coerced speculatively",
);
assert.equal(
  (
    await verifyAdminPasswordOutcome(
      whitespacePassword,
      { ...knownAnswerRecord, passwordWorkFactor: ADMIN_PASSWORD_WORK_FACTOR - 1 },
      pepper,
    )
  ).outcome,
  "invalid_record",
);
assert.equal(
  (
    await verifyAdminPasswordOutcome(
      whitespacePassword,
      {
        ...knownAnswerRecord,
        scheme: "pbkdf2-sha256-hmac-pepper-v1",
        passwordWorkFactor: 600_000,
      },
      pepper,
    )
  ).outcome,
  "invalid_record",
  "legacy PBKDF2 records must not be reinterpreted with a lower work factor",
);

const parsedLogin = adminLoginSchema.parse({
  email: "  ADMIN@GMAIL.COM  ",
  password: whitespacePassword,
});
assert.equal(parsedLogin.email, "ADMIN@GMAIL.COM", "email policy still trims transport input");
assert.equal(parsedLogin.password, whitespacePassword, "server-function schema preserves password");

assert.equal(
  await fingerprintAdminAuthSecret(pepper),
  "1305246013cbb9f7",
  "pepper fingerprint must be the first 16 lowercase SHA-256 hex characters",
);

const tokenA = createOpaqueAdminSessionToken();
const tokenB = createOpaqueAdminSessionToken();
assert.notEqual(tokenA, tokenB, "session tokens must be random");
assert.ok(tokenA.length >= 40, "session token must retain at least 256 bits of random input");
assert.equal(
  await hashOpaqueToken(tokenA),
  createHash("sha256").update(tokenA).digest("base64url"),
  "session token hashing must match the independent Node crypto oracle",
);
assert.notEqual(await hashOpaqueToken(tokenA), tokenA, "D1 stores only a token hash");

const csrf = await createSessionCsrfToken(tokenA, csrfSecret);
assert.equal(
  csrf,
  createHmac("sha256", csrfSecret).update(`${ADMIN_CSRF_CONTEXT}:${tokenA}`).digest("base64url"),
  "CSRF signing must match the independent Node crypto oracle",
);
assert.equal(await verifySessionCsrfToken(tokenA, csrf, csrfSecret), true);
assert.equal(await verifySessionCsrfToken(tokenB, csrf, csrfSecret), false);
assert.equal(await verifySessionCsrfToken(tokenA, csrf, `${csrfSecret}-wrong`), false);
assert.equal(await verifySessionCsrfToken(tokenA, "invalid*base64url", csrfSecret), false);
assert.equal(
  await verifySessionCsrfToken(tokenA, Buffer.alloc(31).toString("base64url"), csrfSecret),
  false,
);

const cryptoSource = fs.readFileSync(
  new URL("../../src/features/consultation/live/admin-auth-crypto.server.ts", import.meta.url),
  "utf8",
);
assert.equal(
  cryptoSource.includes("crypto.subtle.verify"),
  false,
  "password and CSRF HMAC boundaries must not use subtle.verify",
);
assert.equal(
  (cryptoSource.match(/crypto\.subtle\.timingSafeEqual\(/g) ?? []).length,
  2,
  "password and CSRF HMAC boundaries must both use timingSafeEqual",
);
assert.equal(
  (cryptoSource.match(/crypto\.subtle\.sign\(/g) ?? []).length,
  4,
  "password creation/verification and CSRF creation/verification must use HMAC sign",
);
assert.ok(cryptoSource.includes('from "node:crypto"'));
assert.ok(cryptoSource.includes("scryptSync("));
assert.ok(cryptoSource.includes("ADMIN_PASSWORD_SCRYPT_N = 16_384"));
assert.ok(cryptoSource.includes("ADMIN_PASSWORD_SCRYPT_R = 8"));
assert.ok(cryptoSource.includes("ADMIN_PASSWORD_SCRYPT_P = 5"));
assert.ok(cryptoSource.includes("ADMIN_PASSWORD_SCRYPT_MAXMEM_BYTES = 32 * 1024 * 1024"));
assert.ok(cryptoSource.includes("ADMIN_PASSWORD_WORK_FACTOR ="));
assert.ok(cryptoSource.includes("encoder.encode(password)"));
assert.equal(ADMIN_PASSWORD_WORK_FACTOR, 655_360);
assert.ok(
  ADMIN_PASSWORD_WORK_FACTOR <= 2 ** 20,
  "versioned scrypt cost must remain within the workerd 2^20 limit",
);
assert.equal(cryptoSource.includes("crypto.subtle.deriveBits"), false);
assert.equal(cryptoSource.includes('{ name: "PBKDF2" }'), false);
assert.equal(/pbkdf2/i.test(cryptoSource), false, "runtime auth must contain no PBKDF2 path");
assert.ok(cryptoSource.includes('hash: { name: "SHA-256" }'));
assert.ok(cryptoSource.includes('["sign"]'));
assert.equal(cryptoSource.includes('hash: "SHA-256"'), false);
assert.equal(cryptoSource.includes('["sign", "verify"]'), false);
assert.ok(
  timingSafeEqualCalls >= 8,
  "focused password and CSRF cases must exercise timingSafeEqual at runtime",
);

const sourceWranglerConfig = fs.readFileSync(
  new URL("../../wrangler.jsonc", import.meta.url),
  "utf8",
);
assert.ok(
  sourceWranglerConfig.includes('"compatibility_flags": ["nodejs_compat"]'),
  "source Wrangler config must enable nodejs_compat",
);
const stagingGeneratorSource = fs.readFileSync(
  new URL("../cloudflare/prepare-staging-config.mjs", import.meta.url),
  "utf8",
);
assert.ok(
  stagingGeneratorSource.includes('config.compatibility_flags.includes("nodejs_compat")'),
  "staging config preparation must reject a generated Worker without nodejs_compat",
);
const packageJson = JSON.parse(
  fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
assert.equal(packageJson.dependencies?.["node:crypto"], undefined);
assert.equal(packageJson.devDependencies?.["node:crypto"], undefined);

const nativeAuthSource = fs.readFileSync(
  new URL("../../src/features/consultation/live/native-admin-auth.server.ts", import.meta.url),
  "utf8",
);
for (const requiredCookieAttribute of [
  "__Host-rito_admin_session",
  "HttpOnly",
  "Secure",
  "SameSite=Strict",
  "Path=/",
]) {
  assert.ok(
    nativeAuthSource.includes(requiredCookieAttribute),
    `missing cookie property ${requiredCookieAttribute}`,
  );
}
assert.equal(nativeAuthSource.includes("Domain="), false, "__Host- cookie must not define Domain");
assert.ok(
  nativeAuthSource.includes('event: "rito.admin_auth.verification"'),
  "staging diagnostics event must remain stable",
);
assert.ok(nativeAuthSource.includes('environment === "staging"'));
assert.ok(nativeAuthSource.includes('environment === "development"'));
assert.ok(nativeAuthSource.includes('verification.outcome !== "match"'));
assert.ok(nativeAuthSource.includes("throw new AdminLoginRejectedError()"));
assert.ok(nativeAuthSource.includes("passwordWorkFactor: ADMIN_PASSWORD_WORK_FACTOR"));
assert.ok(nativeAuthSource.includes("workFactorRuntimeType"));
assert.ok(nativeAuthSource.includes("workFactorSupported"));
assert.equal(nativeAuthSource.includes("iterationsRuntimeType"), false);
assert.equal(nativeAuthSource.includes("iterationsSupported"), false);
const dummyRecordBlock = nativeAuthSource.match(
  /const DUMMY_PASSWORD_RECORD = \{([\s\S]*?)\n\}/,
)?.[1];
assert.ok(dummyRecordBlock, "dummy password record missing");
assert.ok(dummyRecordBlock.includes("scheme: ADMIN_PASSWORD_SCHEME"));
assert.ok(dummyRecordBlock.includes("passwordWorkFactor: ADMIN_PASSWORD_WORK_FACTOR"));
const diagnosticsBlock = nativeAuthSource.match(/console\.info\(\{([\s\S]*?)\n {2}\}\);/)?.[1];
assert.ok(diagnosticsBlock, "structured diagnostics block missing");
for (const forbiddenLogField of [
  "password:",
  "email:",
  "salt:",
  "hash:",
  "pepper:",
  "token:",
  "cookie:",
  "authorization:",
  "requestBody:",
]) {
  assert.equal(
    diagnosticsBlock.toLowerCase().includes(forbiddenLogField.toLowerCase()),
    false,
    `unsafe AdminAuth diagnostics field ${forbiddenLogField}`,
  );
}

const loginFunctionSource = fs.readFileSync(
  new URL("../../src/features/consultation/consultation.functions.ts", import.meta.url),
  "utf8",
);
assert.ok(loginFunctionSource.includes(".validator(adminLoginSchema)"));
assert.ok(loginFunctionSource.includes("data.email, data.password"));
assert.ok(loginFunctionSource.includes("error instanceof AdminLoginRejectedError"));
assert.ok(loginFunctionSource.includes('reason: "invalid"'));

const loginRouteSource = fs.readFileSync(
  new URL("../../src/routes/admin_.login.tsx", import.meta.url),
  "utf8",
);
assert.ok(loginRouteSource.includes("data: { email, password }"));

const generatorSource = fs.readFileSync(
  new URL("../admin/generate-admin-user-sql.ts", import.meta.url),
  "utf8",
);
assert.ok(generatorSource.includes('requiredOpaqueEnvironment("RITO_ADMIN_PASSWORD")'));
assert.equal(
  generatorSource.includes('requiredEnvironment("RITO_ADMIN_PASSWORD")'),
  false,
  "provisioning must not trim the password",
);
assert.equal(/pbkdf2/i.test(generatorSource), false);

const generatedWhitespacePassword = "  Provisioned Exact Password 2026  ";
const generatorResult = spawnSync(
  process.execPath,
  [
    "--experimental-strip-types",
    fileURLToPath(new URL("../admin/generate-admin-user-sql.ts", import.meta.url)),
  ],
  {
    encoding: "utf8",
    env: {
      ...process.env,
      RITO_ADMIN_EMAIL: "admin@gmail.com",
      RITO_ADMIN_PASSWORD: generatedWhitespacePassword,
      RITO_ADMIN_AUTH_PEPPER: pepper,
    },
  },
);
assert.equal(generatorResult.status, 0, generatorResult.stderr);
assert.match(
  generatorResult.stderr,
  /^RITO admin pepper fingerprint \(SHA-256\/16 hex\): 1305246013cbb9f7\r?\n$/,
);
assert.equal(generatorResult.stdout.includes(generatedWhitespacePassword), false);
assert.equal(generatorResult.stdout.includes(pepper), false);
const generatedRecordMatch = generatorResult.stdout.match(
  /'([A-Za-z0-9_-]{22})', '([A-Za-z0-9_-]{43})', 'active'/,
);
assert.ok(generatedRecordMatch, "generated SQL must contain canonical salt/hash fields");
assert.ok(generatorResult.stdout.includes(`'${ADMIN_PASSWORD_SCHEME}', 655360`));
assert.ok(generatorResult.stdout.includes("DELETE FROM admin_sessions"));
const generatedRecord = {
  scheme: ADMIN_PASSWORD_SCHEME,
  passwordWorkFactor: ADMIN_PASSWORD_WORK_FACTOR,
  salt: generatedRecordMatch[1],
  passwordHash: generatedRecordMatch[2],
};
assert.equal(
  (await verifyAdminPasswordOutcome(generatedWhitespacePassword, generatedRecord, pepper)).outcome,
  "match",
);
assert.equal(
  (await verifyAdminPasswordOutcome(generatedWhitespacePassword.trim(), generatedRecord, pepper))
    .outcome,
  "mismatch",
  "provisioning must preserve leading/trailing password whitespace",
);

const repositorySource = fs.readFileSync(
  new URL(
    "../../src/features/consultation/live/d1-admin-auth-repository.server.ts",
    import.meta.url,
  ),
  "utf8",
);
assert.ok(repositorySource.includes("password_work_factor: number"));
assert.ok(repositorySource.includes("password_salt, password_hash"));
assert.ok(repositorySource.includes("password_iterations AS password_work_factor"));
assert.equal(repositorySource.includes("password_iterations: number"), false);
assert.equal(repositorySource.includes("Number(user.password_work_factor)"), false);

const reprovisionSource = fs.readFileSync(
  new URL("../admin/reprovision-staging-admin.ps1", import.meta.url),
  "utf8",
);
for (const requiredProcedureControl of [
  'Read-Host "New staging admin password" -AsSecureString',
  "RandomNumberGenerator]::Create()",
  "$random.GetBytes($bytes)",
  "$random.Dispose()",
  "EnvironmentVariables",
  'Arguments = "--experimental-strip-types $GeneratorRelativePath"',
  "Write-Utf8NoBom $paths.AdminSql $SqlText",
  "Write-Utf8NoBom $paths.Secrets $secretJson",
  '"--secrets-file", $Paths.Secrets',
  "DELETE FROM admin_sessions",
  "scrypt-n16384-r8-p5-hmac-sha256-pepper-v2",
  "$ExpectedWorkFactor = 655360",
  '$ExpectedWorkerName = "rito-studio-business-plus-staging"',
  '$ExpectedDatabaseName = "rito-studio-business-plus-staging"',
  '$ExpectedDatabaseId = "31659140-3e05-41bb-be23-1d85ab669cb2"',
  '$ExpectedAdminHost = "admin.rito-studio-business-plus-staging.tretnix.com"',
  '$ExpectedOrigin = "https://github.com/AdamDariOfficial/rito-studio-BUSINESS-PLUS.git"',
  '$ExpectedBranch = "feat/rito-business-plus-complete"',
  '$ExpectedHead = "eba1a2a91fd3a531b4a4667d038b631758d0a664"',
  '$WranglerConfigArgument = ".\\.output\\server\\wrangler.staging.json"',
  "Generated config is not the exact isolated RITO staging target.",
  "-ResumeMaterialDirectory",
  "LocalValidation",
  "ExpectedResumePepperFingerprint",
  "function Invoke-NativeCommand",
  "& $Executable @CommandArguments 2>&1",
  "Push-Location -LiteralPath $WorkingDirectory",
  '"--command", (Get-VerificationSqlCommand $Paths)',
  "Test-NativeCommandBoundary",
  'Invoke-NativeCommand $NpxCommand @("--version") $RepoRoot',
  "Native .cmd argument boundaries were altered.",
  "Standard error was captured and suppressed to protect credential material.",
  '"prepared", "d1_updated", "d1_verified", "deployed"',
  "adminSqlSha256",
  "secretsFileSha256",
  "verificationSqlSha256",
  "Generated SQL is outside the exact allowlisted two-statement contract.",
  "exactly one real login",
]) {
  assert.ok(
    reprovisionSource.includes(requiredProcedureControl),
    `staging reprovision procedure missing ${requiredProcedureControl}`,
  );
}
assert.ok(reprovisionSource.includes("Remove-Item -LiteralPath $safeDirectory -Recurse -Force"));
assert.ok(
  reprovisionSource.indexOf('Invoke-Wrangler "Deploy"') <
    reprovisionSource.lastIndexOf("Remove-Item -LiteralPath"),
);
assert.equal(reprovisionSource.includes("ADMIN_AUTH_CSRF_SECRET ="), false);
assert.equal(reprovisionSource.includes("[string]$DatabaseName"), false);
assert.equal(reprovisionSource.includes("[string]$ConfigPath"), false);
assert.equal(reprovisionSource.includes("Start-Process"), false);
assert.equal(reprovisionSource.includes("Invoke-Expression"), false);
const readD1ArgumentsBlock = reprovisionSource.match(
  /if \(\$Operation -ceq "ReadD1"\) \{([\s\S]*?)\n[ ]{2}\}/,
)?.[1];
assert.ok(readD1ArgumentsBlock, "ReadD1 argument allowlist block missing");
assert.ok(readD1ArgumentsBlock.includes('"--command"'));
assert.equal(readD1ArgumentsBlock.includes('"--file"'), false);
assert.ok(readD1ArgumentsBlock.includes('"--json"'));
const wranglerInvocationBlock = reprovisionSource.match(
  /function Invoke-Wrangler\(([\s\S]*?)\n\}/,
)?.[1];
assert.ok(wranglerInvocationBlock, "Wrangler invocation wrapper missing");
assert.ok(wranglerInvocationBlock.includes("Invoke-NativeCommand"));
assert.equal(wranglerInvocationBlock.includes("ProcessStartInfo"), false);
for (const powerShell7Only of [
  "RandomNumberGenerator]::Fill",
  "RandomNumberGenerator]::GetBytes(",
  "SHA256]::HashData",
  "Convert]::ToHexString",
  ".ArgumentList",
  ".Environment[",
  "ConvertFrom-Json -AsHashtable",
  "ForEach-Object -Parallel",
  "$IsWindows",
  "$PSStyle",
  "??",
  "&&",
  "||",
]) {
  assert.equal(
    reprovisionSource.includes(powerShell7Only),
    false,
    `staging reprovision procedure contains PowerShell 7/.NET Core-only construct ${powerShell7Only}`,
  );
}
assert.equal(/function\s+git\b/i.test(reprovisionSource), false);
assert.equal(/\$args\b/i.test(reprovisionSource), false);

console.log("RITO native AdminAuth cryptography/session boundary: PASS");
