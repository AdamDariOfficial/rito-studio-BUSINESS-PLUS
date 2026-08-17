import { DurableObject } from "cloudflare:workers";
import { consultationRealtimeEventSchema } from "./src/features/consultation/realtime";
import type { D1DatabaseBinding } from "./src/features/consultation/live/cloudflare-env.server";

type ConsultationRealtimeEnv = {
  CONSULTATION_DB?: D1DatabaseBinding;
};

type ConsultationSocketAttachment = {
  connectedAt: number;
  expiresAt: number;
  sessionId: string;
};

type ConsultationSocket = WebSocket & {
  serializeAttachment?: (value: unknown) => void;
  deserializeAttachment?: () => unknown;
};

function readSocketAttachment(socket: ConsultationSocket): ConsultationSocketAttachment | null {
  const value = socket.deserializeAttachment?.();
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<ConsultationSocketAttachment>;
  return typeof candidate.connectedAt === "number" &&
    typeof candidate.expiresAt === "number" &&
    typeof candidate.sessionId === "string" &&
    candidate.sessionId.length > 0
    ? {
        connectedAt: candidate.connectedAt,
        expiresAt: candidate.expiresAt,
        sessionId: candidate.sessionId,
      }
    : null;
}

function readAuthorizedSessionId(request: Request) {
  const sessionId = request.headers.get("x-rito-admin-session-id")?.trim();
  if (!sessionId || sessionId.length > 160) throw new Error("Sessione admin non valida.");
  return sessionId;
}

function readAuthorizedSessionExpiry(request: Request) {
  const expiresAt = Date.parse(request.headers.get("x-rito-admin-session-expires-at") ?? "");
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw new Error("Sessione admin non valida.");
  }
  return expiresAt;
}

export class ConsultationRealtimeHub extends DurableObject<ConsultationRealtimeEnv> {
  private async isSessionDeliverable(sessionId: string) {
    const db = this.env.CONSULTATION_DB;
    if (!db) return false;
    const row = await db
      .prepare(
        `SELECT s.revoked_at AS revoked_at, u.status AS user_status
         FROM admin_sessions s
         JOIN admin_users u ON u.id = s.user_id
         WHERE s.id = ?
         LIMIT 1`,
      )
      .bind(sessionId)
      .first<{ revoked_at: string | null; user_status: "active" | "disabled" }>();
    return Boolean(row && !row.revoked_at && row.user_status === "active");
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/publish") {
      const event = consultationRealtimeEventSchema.parse(await request.json());
      const payload = JSON.stringify(event);
      const now = Date.now();
      for (const rawSocket of this.ctx.getWebSockets()) {
        const socket = rawSocket as ConsultationSocket;
        const attachment = readSocketAttachment(socket);
        if (!attachment || attachment.expiresAt <= now) {
          socket.close(4401, "Session expired");
          continue;
        }
        if (!(await this.isSessionDeliverable(attachment.sessionId))) {
          socket.close(4401, "Session revoked");
          continue;
        }
        try {
          socket.send(payload);
        } catch {
          // Disconnected sockets disappear from getWebSockets() once the runtime observes closure.
        }
      }
      return new Response(null, { status: 204 });
    }

    const upgrade = request.headers.get("upgrade");
    if (request.method !== "GET" || upgrade?.toLowerCase() !== "websocket") {
      return new Response("WebSocket upgrade required", { status: 426 });
    }

    let expiresAt: number;
    let sessionId: string;
    try {
      sessionId = readAuthorizedSessionId(request);
      expiresAt = readAuthorizedSessionExpiry(request);
    } catch {
      return new Response("Forbidden", { status: 403 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1] as ConsultationSocket;

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment?.({ connectedAt: Date.now(), expiresAt, sessionId });
    server.send(JSON.stringify({ type: "ready" }));

    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(_webSocket: WebSocket, _message: string | ArrayBuffer) {
    // The Consultation Inbox is server-push only. Protocol-level WebSocket ping/pong
    // is handled by the runtime; no application heartbeat keeps the Object awake.
  }

  webSocketClose(webSocket: WebSocket, code: number, reason: string) {
    webSocket.close(code, reason);
  }
}
