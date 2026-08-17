import { requireLiveBinding, type D1DatabaseBinding } from "./cloudflare-env.server";

export type AdminUserRow = {
  id: string;
  email: string;
  email_normalized: string;
  password_scheme: string;
  password_work_factor: number;
  password_salt: string;
  password_hash: string;
  status: "active" | "disabled";
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

export type AdminSessionRow = {
  id: string;
  user_id: string;
  token_hash: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  revoked_at: string | null;
};

export type AdminSessionWithUser = AdminSessionRow & {
  email: string;
  user_status: "active" | "disabled";
};

function database() {
  return requireLiveBinding("CONSULTATION_DB") as D1DatabaseBinding;
}

export const d1AdminAuthRepository = {
  async countUsers() {
    const row = await database()
      .prepare("SELECT COUNT(*) AS count FROM admin_users")
      .first<{ count: number }>();
    return Number(row?.count ?? 0);
  },

  async findUserByNormalizedEmail(emailNormalized: string) {
    return database()
      .prepare(
        `SELECT id, email, email_normalized, password_scheme,
                password_iterations AS password_work_factor,
                password_salt, password_hash, status, created_at, updated_at, last_login_at
         FROM admin_users
         WHERE email_normalized = ?
         LIMIT 1`,
      )
      .bind(emailNormalized)
      .first<AdminUserRow>();
  },

  async markLogin(userId: string, at: string) {
    await database()
      .prepare("UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?")
      .bind(at, at, userId)
      .run();
  },

  async createSession(input: AdminSessionRow) {
    await database()
      .prepare(
        `INSERT INTO admin_sessions (
           id, user_id, token_hash, created_at, last_seen_at, expires_at, revoked_at
         ) VALUES (?, ?, ?, ?, ?, ?, NULL)`,
      )
      .bind(
        input.id,
        input.user_id,
        input.token_hash,
        input.created_at,
        input.last_seen_at,
        input.expires_at,
      )
      .run();
  },

  async findSessionByTokenHash(tokenHash: string) {
    return database()
      .prepare(
        `SELECT s.id, s.user_id, s.token_hash, s.created_at, s.last_seen_at,
                s.expires_at, s.revoked_at, u.email, u.status AS user_status
         FROM admin_sessions s
         JOIN admin_users u ON u.id = s.user_id
         WHERE s.token_hash = ?
         LIMIT 1`,
      )
      .bind(tokenHash)
      .first<AdminSessionWithUser>();
  },

  async touchSession(id: string, at: string) {
    await database()
      .prepare("UPDATE admin_sessions SET last_seen_at = ? WHERE id = ?")
      .bind(at, id)
      .run();
  },

  async revokeSessionByTokenHash(tokenHash: string, at: string) {
    await database()
      .prepare(
        "UPDATE admin_sessions SET revoked_at = COALESCE(revoked_at, ?) WHERE token_hash = ?",
      )
      .bind(at, tokenHash)
      .run();
  },

  async revokeSessionById(id: string, at: string) {
    await database()
      .prepare("UPDATE admin_sessions SET revoked_at = COALESCE(revoked_at, ?) WHERE id = ?")
      .bind(at, id)
      .run();
  },

  async deleteExpiredSessions(before: string) {
    await database()
      .prepare(
        "DELETE FROM admin_sessions WHERE expires_at < ? OR (revoked_at IS NOT NULL AND revoked_at < ?)",
      )
      .bind(before, before)
      .run();
  },
};
