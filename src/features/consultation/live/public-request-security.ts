import { ConsultationInputError } from "./errors.ts";

export const MAX_PUBLIC_BODY_BYTES = 64 * 1024;

async function hashActor(namespace: string, value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${namespace}:${hex.slice(0, 32)}`;
}

export async function consultationNetworkActorKey(request: Request) {
  // Cloudflare sets CF-Connecting-IP at the edge. Never trust client-controlled forwarding chains.
  const address = request.headers.get("cf-connecting-ip")?.trim() || "unavailable";
  return hashActor("consultation-network", address);
}

export async function consultationPhoneActorKey(phone: string) {
  return hashActor("consultation-phone", phone);
}

export function requireSameOriginJson(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) throw new ConsultationInputError();

  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) throw new ConsultationInputError();

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") throw new ConsultationInputError();
}

export async function readBoundedJsonBody(request: Request): Promise<unknown> {
  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader !== null) {
    const declaredLength = Number(lengthHeader);
    if (!Number.isSafeInteger(declaredLength) || declaredLength < 0) {
      throw new ConsultationInputError();
    }
    if (declaredLength > MAX_PUBLIC_BODY_BYTES) throw new ConsultationInputError();
  }

  if (!request.body) return JSON.parse("") as unknown;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_PUBLIC_BODY_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // The request is already rejected; a stream cancellation failure must not alter the 400.
        }
        throw new ConsultationInputError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) throw error;
    throw new ConsultationInputError();
  }
}
