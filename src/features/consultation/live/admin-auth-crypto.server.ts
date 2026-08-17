import { scryptSync } from "node:crypto";

const encoder = new TextEncoder();

export const ADMIN_PASSWORD_SCHEME = "scrypt-n16384-r8-p5-hmac-sha256-pepper-v2";
export const ADMIN_PASSWORD_SCRYPT_N = 16_384;
export const ADMIN_PASSWORD_SCRYPT_R = 8;
export const ADMIN_PASSWORD_SCRYPT_P = 5;
export const ADMIN_PASSWORD_SCRYPT_MAXMEM_BYTES = 32 * 1024 * 1024;
export const ADMIN_PASSWORD_WORK_FACTOR =
  ADMIN_PASSWORD_SCRYPT_N * ADMIN_PASSWORD_SCRYPT_R * ADMIN_PASSWORD_SCRYPT_P;
export const ADMIN_PASSWORD_SALT_BYTES = 16;
export const ADMIN_SESSION_TOKEN_BYTES = 32;
export const ADMIN_CSRF_CONTEXT = "rito-admin-csrf-v1";

export type AdminPasswordVerificationOutcome =
  | "match"
  | "mismatch"
  | "invalid_record"
  | "crypto_error";

export type AdminPasswordVerificationResult = {
  outcome: AdminPasswordVerificationOutcome;
  cryptoErrorName?: string;
};

export type AdminPasswordVerificationInput = {
  scheme: unknown;
  passwordWorkFactor: unknown;
  salt: unknown;
  passwordHash: unknown;
};

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) {
    throw new Error("Encoded value is not base64url.");
  }
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const decoded = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (base64UrlEncode(decoded) !== value) throw new Error("Encoded value is not canonical.");
  return decoded;
}

function randomBytes(length: number) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

async function importHmacSecret(secret: string) {
  if (secret.length < 32) throw new Error("Admin auth secret is too short.");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"],
  );
}

function derivePasswordBits(password: string, salt: Uint8Array) {
  return new Uint8Array(
    scryptSync(encoder.encode(password), salt, 32, {
      N: ADMIN_PASSWORD_SCRYPT_N,
      r: ADMIN_PASSWORD_SCRYPT_R,
      p: ADMIN_PASSWORD_SCRYPT_P,
      maxmem: ADMIN_PASSWORD_SCRYPT_MAXMEM_BYTES,
    }),
  );
}

export async function createAdminPasswordRecord(password: string, pepper: string) {
  const salt = randomBytes(ADMIN_PASSWORD_SALT_BYTES);
  const passwordHash = await hashAdminPassword(password, salt, pepper);
  return {
    scheme: ADMIN_PASSWORD_SCHEME,
    passwordWorkFactor: ADMIN_PASSWORD_WORK_FACTOR,
    salt: base64UrlEncode(salt),
    passwordHash,
  } as const;
}

export async function hashAdminPassword(password: string, salt: Uint8Array, pepper: string) {
  const derived = derivePasswordBits(password, salt);
  const pepperKey = await importHmacSecret(pepper);
  const tag = await crypto.subtle.sign({ name: "HMAC" }, pepperKey, derived);
  return base64UrlEncode(new Uint8Array(tag));
}

export async function verifyAdminPassword(
  password: string,
  input: AdminPasswordVerificationInput,
  pepper: string,
) {
  return (await verifyAdminPasswordOutcome(password, input, pepper)).outcome === "match";
}

export async function verifyAdminPasswordOutcome(
  password: string,
  input: AdminPasswordVerificationInput,
  pepper: string,
): Promise<AdminPasswordVerificationResult> {
  if (
    input.scheme !== ADMIN_PASSWORD_SCHEME ||
    typeof input.passwordWorkFactor !== "number" ||
    !Number.isInteger(input.passwordWorkFactor) ||
    input.passwordWorkFactor !== ADMIN_PASSWORD_WORK_FACTOR ||
    typeof input.salt !== "string" ||
    typeof input.passwordHash !== "string"
  ) {
    return { outcome: "invalid_record" };
  }

  let salt: Uint8Array;
  let expectedTag: Uint8Array;
  try {
    salt = base64UrlDecode(input.salt);
    expectedTag = base64UrlDecode(input.passwordHash);
  } catch {
    return { outcome: "invalid_record" };
  }

  if (salt.byteLength !== ADMIN_PASSWORD_SALT_BYTES || expectedTag.byteLength !== 32) {
    return { outcome: "invalid_record" };
  }

  try {
    const derived = derivePasswordBits(password, salt);
    if (derived.byteLength !== 32) throw new Error("Unexpected scrypt output length.");
    const pepperKey = await importHmacSecret(pepper);
    const candidateTag = new Uint8Array(
      await crypto.subtle.sign({ name: "HMAC" }, pepperKey, derived),
    );
    if (candidateTag.byteLength !== 32) throw new Error("Unexpected HMAC tag length.");
    const matches = crypto.subtle.timingSafeEqual(candidateTag, expectedTag);
    return { outcome: matches ? "match" : "mismatch" };
  } catch (error) {
    return { outcome: "crypto_error", cryptoErrorName: safeCryptoErrorName(error) };
  }
}

function safeCryptoErrorName(error: unknown) {
  const name = error instanceof Error ? error.name : "UnknownError";
  return /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(name) ? name : "UnknownError";
}

export async function fingerprintAdminAuthSecret(secret: string) {
  const digest = new Uint8Array(
    await crypto.subtle.digest({ name: "SHA-256" }, encoder.encode(secret)),
  );
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

export function createOpaqueAdminSessionToken() {
  return base64UrlEncode(randomBytes(ADMIN_SESSION_TOKEN_BYTES));
}

export async function hashOpaqueToken(token: string) {
  const digest = await crypto.subtle.digest({ name: "SHA-256" }, encoder.encode(token));
  return base64UrlEncode(new Uint8Array(digest));
}

export async function createSessionCsrfToken(sessionToken: string, secret: string) {
  const key = await importHmacSecret(secret);
  const signature = await crypto.subtle.sign(
    { name: "HMAC" },
    key,
    encoder.encode(`${ADMIN_CSRF_CONTEXT}:${sessionToken}`),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

export async function verifySessionCsrfToken(
  sessionToken: string,
  candidate: string,
  secret: string,
) {
  try {
    const candidateTag = base64UrlDecode(candidate);
    if (candidateTag.byteLength !== 32) return false;
    const key = await importHmacSecret(secret);
    const expectedTag = new Uint8Array(
      await crypto.subtle.sign(
        { name: "HMAC" },
        key,
        encoder.encode(`${ADMIN_CSRF_CONTEXT}:${sessionToken}`),
      ),
    );
    if (expectedTag.byteLength !== 32) return false;
    return crypto.subtle.timingSafeEqual(expectedTag, candidateTag);
  } catch {
    return false;
  }
}
