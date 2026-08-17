import type { AdminAuth, AdminIdentity } from "./contracts";
import { getConsultationCloudflareEnv, requireLiveBinding } from "./cloudflare-env.server";
import {
  ADMIN_PASSWORD_SCHEME,
  ADMIN_PASSWORD_WORK_FACTOR,
  createOpaqueAdminSessionToken,
  createSessionCsrfToken,
  fingerprintAdminAuthSecret,
  hashOpaqueToken,
  verifyAdminPasswordOutcome,
  verifySessionCsrfToken,
  type AdminPasswordVerificationResult,
} from "./admin-auth-crypto.server";
import {
  d1AdminAuthRepository,
  type AdminSessionWithUser,
} from "./d1-admin-auth-repository.server";

export const ADMIN_SESSION_COOKIE = "__Host-rito_admin_session";
const SESSION_ABSOLUTE_MS = 12 * 60 * 60 * 1000;
const SESSION_IDLE_MS = 2 * 60 * 60 * 1000;
const SESSION_TOUCH_MS = 15 * 60 * 1000;
const GENERIC_LOGIN_ERROR = "Email o password non corretti.";
const DUMMY_PASSWORD_RECORD = {
  scheme: ADMIN_PASSWORD_SCHEME,
  passwordWorkFactor: ADMIN_PASSWORD_WORK_FACTOR,
  salt: "AAAAAAAAAAAAAAAAAAAAAA",
  passwordHash: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
} as const;

export class AdminLoginRejectedError extends Error {
  constructor() {
    super(GENERIC_LOGIN_ERROR);
    this.name = "AdminLoginRejectedError";
  }
}

export class AdminLoginRateLimitedError extends Error {
  constructor() {
    super("Accesso temporaneamente limitato. Riprova tra poco.");
    this.name = "AdminLoginRateLimitedError";
  }
}

function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  for (const part of cookie.split(/;\s*/)) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    if (part.slice(0, separator) === name) return part.slice(separator + 1);
  }
  return null;
}

function requireAuthSecret(name: "ADMIN_AUTH_PEPPER" | "ADMIN_AUTH_CSRF_SECRET") {
  const value = getConsultationCloudflareEnv()[name]?.trim();
  if (!value || value.length < 32) throw new Error(`${name} non configurato correttamente.`);
  return value;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseTimestamp(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

function isSessionValid(session: AdminSessionWithUser, now: number) {
  if (session.revoked_at || session.user_status !== "active") return false;
  if (parseTimestamp(session.expires_at) <= now) return false;
  if (parseTimestamp(session.last_seen_at) + SESSION_IDLE_MS <= now) return false;
  return true;
}

async function rateLimitKey(prefix: string, value: string) {
  return `${prefix}:${(await hashOpaqueToken(value)).slice(0, 32)}`;
}

async function requireLoginRateLimit(request: Request, emailNormalized: string) {
  const limiter = requireLiveBinding("ADMIN_LOGIN_RATE_LIMITER");
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const [ipResult, accountResult] = await Promise.all([
    limiter.limit({ key: await rateLimitKey("admin-login-ip", ip) }),
    limiter.limit({ key: await rateLimitKey("admin-login-account", emailNormalized) }),
  ]);
  if (!ipResult.success || !accountResult.success) throw new AdminLoginRateLimitedError();
}

async function dummyPasswordCheck(password: string, pepper: string) {
  return verifyAdminPasswordOutcome(password, DUMMY_PASSWORD_RECORD, pepper);
}

function authDiagnosticsEnabled() {
  const environment = getConsultationCloudflareEnv().LIVE_BACKEND_ENV?.trim().toLowerCase();
  return environment === "staging" || environment === "development";
}

async function logPasswordVerification(
  user: Awaited<ReturnType<typeof d1AdminAuthRepository.findUserByNormalizedEmail>>,
  verification: AdminPasswordVerificationResult,
  pepper: string,
) {
  if (!authDiagnosticsEnabled()) return;

  let pepperFingerprint: string | undefined;
  try {
    pepperFingerprint = await fingerprintAdminAuthSecret(pepper);
  } catch {
    // Diagnostics must never change the authentication result.
  }

  console.info({
    event: "rito.admin_auth.verification",
    userFound: Boolean(user),
    userActive: user?.status === "active",
    schemeSupported: user?.password_scheme === ADMIN_PASSWORD_SCHEME,
    workFactorRuntimeType: typeof user?.password_work_factor,
    workFactorSupported:
      typeof user?.password_work_factor === "number" &&
      Number.isInteger(user.password_work_factor) &&
      user.password_work_factor === ADMIN_PASSWORD_WORK_FACTOR,
    encodedSaltLength: typeof user?.password_salt === "string" ? user.password_salt.length : null,
    encodedHashLength: typeof user?.password_hash === "string" ? user.password_hash.length : null,
    verificationOutcome: verification.outcome,
    ...(verification.cryptoErrorName ? { cryptoErrorName: verification.cryptoErrorName } : {}),
    ...(pepperFingerprint ? { pepperFingerprint } : {}),
  });
}

async function readSession(request: Request) {
  const token = getCookie(request, ADMIN_SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await hashOpaqueToken(token);
  const session = await d1AdminAuthRepository.findSessionByTokenHash(tokenHash);
  if (!session) return null;

  const now = Date.now();
  if (!isSessionValid(session, now)) {
    await d1AdminAuthRepository.revokeSessionById(session.id, new Date(now).toISOString());
    return null;
  }

  let effectiveSession = session;
  if (parseTimestamp(session.last_seen_at) + SESSION_TOUCH_MS <= now) {
    const touchedAt = new Date(now).toISOString();
    await d1AdminAuthRepository.touchSession(session.id, touchedAt);
    effectiveSession = { ...session, last_seen_at: touchedAt };
  }

  return { token, tokenHash, session: effectiveSession };
}

export function serializeAdminSessionCookie(token: string) {
  return `${ADMIN_SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_ABSOLUTE_MS / 1000)}`;
}

export function serializeClearedAdminSessionCookie() {
  return `${ADMIN_SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export async function loginAdmin(request: Request, email: string, password: string) {
  const emailNormalized = normalizeEmail(email);
  await requireLoginRateLimit(request, emailNormalized);

  const pepper = requireAuthSecret("ADMIN_AUTH_PEPPER");
  const user = await d1AdminAuthRepository.findUserByNormalizedEmail(emailNormalized);
  let verification = user
    ? await verifyAdminPasswordOutcome(
        password,
        {
          scheme: user.password_scheme,
          passwordWorkFactor: user.password_work_factor,
          salt: user.password_salt,
          passwordHash: user.password_hash,
        },
        pepper,
      )
    : await dummyPasswordCheck(password, pepper);

  if (user && verification.outcome === "invalid_record") {
    const dummyVerification = await dummyPasswordCheck(password, pepper);
    if (dummyVerification.outcome === "crypto_error") verification = dummyVerification;
  }

  await logPasswordVerification(user, verification, pepper);

  if (!user || user.status !== "active" || verification.outcome !== "match") {
    throw new AdminLoginRejectedError();
  }

  const existingToken = getCookie(request, ADMIN_SESSION_COOKIE);
  if (existingToken) {
    await d1AdminAuthRepository.revokeSessionByTokenHash(
      await hashOpaqueToken(existingToken),
      new Date().toISOString(),
    );
  }

  const token = createOpaqueAdminSessionToken();
  const tokenHash = await hashOpaqueToken(token);
  const now = new Date();
  const nowIso = now.toISOString();
  await d1AdminAuthRepository.deleteExpiredSessions(nowIso);
  const expiresAt = new Date(now.getTime() + SESSION_ABSOLUTE_MS).toISOString();
  await d1AdminAuthRepository.createSession({
    id: crypto.randomUUID(),
    user_id: user.id,
    token_hash: tokenHash,
    created_at: nowIso,
    last_seen_at: nowIso,
    expires_at: expiresAt,
    revoked_at: null,
  });
  await d1AdminAuthRepository.markLogin(user.id, nowIso);

  return {
    token,
    identity: { subject: user.id, email: user.email } satisfies AdminIdentity,
    csrfToken: await createSessionCsrfToken(token, requireAuthSecret("ADMIN_AUTH_CSRF_SECRET")),
    expiresAt,
  };
}

export async function getAdminSessionDetails(request: Request) {
  const resolved = await readSession(request);
  if (!resolved) return null;
  const absoluteExpiry = parseTimestamp(resolved.session.expires_at);
  const idleExpiry = parseTimestamp(resolved.session.last_seen_at) + SESSION_IDLE_MS;
  const authorizedUntil = new Date(Math.min(absoluteExpiry, idleExpiry)).toISOString();
  return {
    sessionId: resolved.session.id,
    identity: {
      subject: resolved.session.user_id,
      email: resolved.session.email,
    } satisfies AdminIdentity,
    csrfToken: await createSessionCsrfToken(
      resolved.token,
      requireAuthSecret("ADMIN_AUTH_CSRF_SECRET"),
    ),
    expiresAt: authorizedUntil,
  };
}

export async function requireAdminCsrf(request: Request, csrfToken: string) {
  const resolved = await readSession(request);
  if (!resolved) throw new Error("Accesso admin non autorizzato.");
  const valid = await verifySessionCsrfToken(
    resolved.token,
    csrfToken,
    requireAuthSecret("ADMIN_AUTH_CSRF_SECRET"),
  );
  if (!valid) throw new Error("Richiesta admin non autorizzata.");
  return {
    subject: resolved.session.user_id,
    email: resolved.session.email,
  } satisfies AdminIdentity;
}

export async function logoutAdmin(request: Request, csrfToken: string) {
  const resolved = await readSession(request);
  if (!resolved) return;
  const valid = await verifySessionCsrfToken(
    resolved.token,
    csrfToken,
    requireAuthSecret("ADMIN_AUTH_CSRF_SECRET"),
  );
  if (!valid) throw new Error("Richiesta admin non autorizzata.");
  await d1AdminAuthRepository.revokeSessionById(resolved.session.id, new Date().toISOString());
}

export function requireAdminWebSocketOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) throw new Error("Origin WebSocket mancante.");
  if (new URL(origin).origin !== new URL(request.url).origin) {
    throw new Error("Origin WebSocket non autorizzata.");
  }
}

export const nativeAdminAuth: AdminAuth = {
  async getIdentity(request) {
    return (await getAdminSessionDetails(request))?.identity ?? null;
  },
  async requireIdentity(request) {
    const identity = await this.getIdentity(request);
    if (!identity) throw new Error("Accesso admin non autorizzato.");
    return identity;
  },
};
