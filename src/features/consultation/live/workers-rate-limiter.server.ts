import type { ConsultationRateLimiter } from "./contracts";
import { requireLiveBinding } from "./cloudflare-env.server";
import { ConsultationRateLimitError } from "./errors";

export async function consultationSubmitActorKey(phone: string) {
  const normalized = phone.replace(/[^+\d]/g, "").toLowerCase();
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
  return `consultation-phone:${hex.slice(0, 32)}`;
}

export const workersConsultationRateLimiter: ConsultationRateLimiter = {
  async requireSubmitAllowed(actorKey) {
    const limiter = requireLiveBinding("CONSULTATION_SUBMIT_RATE_LIMITER");
    const result = await limiter.limit({ key: actorKey });
    if (!result.success) {
      throw new ConsultationRateLimitError();
    }
  },
};
