import "./lib/error-capture";

import {
  getAdminSessionDetails,
  requireAdminWebSocketOrigin,
} from "./features/consultation/live/native-admin-auth.server";
import { getConsultationCloudflareEnv } from "./features/consultation/live/cloudflare-env.server";
import { handlePublicConsultationSubmit } from "./features/consultation/live/public-submit.server";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (module) => (module.default ?? module) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function handleConsultationRealtime(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/__tretnix/consultation-realtime") return null;

  if (request.method !== "GET" || request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
    return new Response("WebSocket upgrade required", {
      status: 426,
      headers: { "cache-control": "no-store" },
    });
  }

  try {
    requireAdminWebSocketOrigin(request);
    const session = await getAdminSessionDetails(request);
    if (!session) throw new Error("Accesso admin non autorizzato.");
    const namespace = getConsultationCloudflareEnv().CONSULTATION_REALTIME;
    if (!namespace) {
      return new Response("Realtime backend unavailable", {
        status: 503,
        headers: { "cache-control": "no-store" },
      });
    }
    const forwardedRequest = new Request(request);
    forwardedRequest.headers.set("x-rito-admin-session-id", session.sessionId);
    forwardedRequest.headers.set("x-rito-admin-session-expires-at", session.expiresAt);
    return namespace.getByName("main").fetch(forwardedRequest);
  } catch {
    return new Response("Forbidden", {
      status: 403,
      headers: { "cache-control": "no-store" },
    });
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const publicSubmitResponse = await handlePublicConsultationSubmit(request);
      if (publicSubmitResponse) return publicSubmitResponse;

      const realtimeResponse = await handleConsultationRealtime(request);
      if (realtimeResponse) return realtimeResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
