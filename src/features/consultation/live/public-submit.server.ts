import { ZodError } from "zod";
import { liveConsultationSubmissionSchema } from "../schemas";
import { ConsultationInputError, ConsultationRateLimitError } from "./errors";
import { submitConsultationLive } from "./live-consultation.service.server";

const MAX_PUBLIC_BODY_BYTES = 64 * 1024;

const JSON_HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), { status, headers: JSON_HEADERS });
}

export async function handlePublicConsultationSubmit(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/consultations") return null;

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: { ...JSON_HEADERS, allow: "POST" },
    });
  }

  try {
    requireSameOriginJson(request);
    const body = liveConsultationSubmissionSchema.parse(await readJsonBody(request));
    const result = await submitConsultationLive(body);
    return new Response(JSON.stringify(result), { status: 200, headers: JSON_HEADERS });
  } catch (error) {
    if (error instanceof ConsultationRateLimitError) {
      return jsonError(error.message, 429);
    }
    if (
      error instanceof ConsultationInputError ||
      error instanceof ZodError ||
      error instanceof SyntaxError
    ) {
      return jsonError("Controlla i dati della richiesta.", 400);
    }

    // Never expose configuration, D1, Durable Object or other internal errors to public callers.
    console.error("Public consultation submit failed", {
      errorName: error instanceof Error ? error.name : typeof error,
    });
    return jsonError("Servizio temporaneamente non disponibile. Riprova tra poco.", 503);
  }
}

async function readJsonBody(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_PUBLIC_BODY_BYTES) {
    throw new ConsultationInputError();
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_PUBLIC_BODY_BYTES) {
    throw new ConsultationInputError();
  }
  return JSON.parse(text) as unknown;
}

function requireSameOriginJson(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) throw new ConsultationInputError();

  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) throw new ConsultationInputError();

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") throw new ConsultationInputError();
}
