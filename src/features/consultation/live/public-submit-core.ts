import { ZodError } from "zod";
import { liveConsultationSubmissionSchema } from "../schemas.ts";
import { ConsultationInputError, ConsultationRateLimitError } from "./errors.ts";
import { readBoundedJsonBody, requireSameOriginJson } from "./public-request-security.ts";

const JSON_HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};

export interface PublicSubmitDependencies {
  requireIngressAllowed(request: Request): Promise<void>;
  submit(input: ReturnType<typeof liveConsultationSubmissionSchema.parse>): Promise<unknown>;
}

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), { status, headers: JSON_HEADERS });
}

export async function handlePublicConsultationSubmitCore(
  request: Request,
  dependencies: PublicSubmitDependencies,
): Promise<Response | null> {
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
    await dependencies.requireIngressAllowed(request);
    const body = liveConsultationSubmissionSchema.parse(await readBoundedJsonBody(request));
    const result = await dependencies.submit(body);
    return new Response(JSON.stringify(result), { status: 200, headers: JSON_HEADERS });
  } catch (error) {
    if (error instanceof ConsultationRateLimitError) return jsonError(error.message, 429);
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
