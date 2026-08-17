import process from "node:process";
import {
  createAdminPasswordRecord,
  fingerprintAdminAuthSecret,
} from "../../src/features/consultation/live/admin-auth-crypto.server.ts";

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function requiredOpaqueEnvironment(name: string) {
  const value = process.env[name];
  if (value === undefined || value.length === 0) throw new Error(`${name} is required.`);
  return value;
}

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

const email = (process.env.RITO_ADMIN_EMAIL?.trim() || "admin@gmail.com").toLowerCase();
const password = requiredOpaqueEnvironment("RITO_ADMIN_PASSWORD");
const pepper = requiredEnvironment("RITO_ADMIN_AUTH_PEPPER");

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
  throw new Error("RITO_ADMIN_EMAIL must be a valid email address up to 160 characters.");
}
if (password.length < 12 || password.length > 128) {
  throw new Error("RITO_ADMIN_PASSWORD must contain 12 to 128 characters.");
}
if (pepper.length < 32) {
  throw new Error("RITO_ADMIN_AUTH_PEPPER must contain at least 32 characters.");
}

const record = await createAdminPasswordRecord(password, pepper);
const pepperFingerprint = await fingerprintAdminAuthSecret(pepper);
const now = new Date().toISOString();
const id = crypto.randomUUID();

process.stderr.write(`RITO admin pepper fingerprint (SHA-256/16 hex): ${pepperFingerprint}\n`);

process.stdout.write(
  `-- Generated RITO native admin record. Contains no plaintext password or pepper.\n`,
);
process.stdout.write(`INSERT INTO admin_users (\n`);
process.stdout.write(`  id, email, email_normalized, password_scheme, password_iterations,\n`);
process.stdout.write(
  `  password_salt, password_hash, status, created_at, updated_at, last_login_at\n`,
);
process.stdout.write(`) VALUES (\n`);
process.stdout.write(
  `  ${sqlString(id)}, ${sqlString(email)}, ${sqlString(email)}, ${sqlString(record.scheme)}, ${record.passwordWorkFactor},\n`,
);
process.stdout.write(
  `  ${sqlString(record.salt)}, ${sqlString(record.passwordHash)}, 'active', ${sqlString(now)}, ${sqlString(now)}, NULL\n`,
);
process.stdout.write(`)\n`);
process.stdout.write(`ON CONFLICT(email_normalized) DO UPDATE SET\n`);
process.stdout.write(`  email = excluded.email,\n`);
process.stdout.write(`  password_scheme = excluded.password_scheme,\n`);
process.stdout.write(`  password_iterations = excluded.password_iterations,\n`);
process.stdout.write(`  password_salt = excluded.password_salt,\n`);
process.stdout.write(`  password_hash = excluded.password_hash,\n`);
process.stdout.write(`  status = 'active',\n`);
process.stdout.write(`  updated_at = excluded.updated_at;\n`);
process.stdout.write(
  `DELETE FROM admin_sessions WHERE user_id = (SELECT id FROM admin_users WHERE email_normalized = ${sqlString(email)});\n`,
);
