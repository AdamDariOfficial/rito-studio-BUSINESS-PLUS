import type { ConsultationRateLimiter } from "./contracts";
import { requireLiveBinding } from "./cloudflare-env.server";
import { ConsultationRateLimitError } from "./errors";
import { consultationNetworkActorKey, consultationPhoneActorKey } from "./public-request-security";

export const workersConsultationRateLimiter: ConsultationRateLimiter = {
  async requireSubmitAllowed(actorKey) {
    const limiter = requireLiveBinding("CONSULTATION_SUBMIT_RATE_LIMITER");
    const result = await limiter.limit({ key: actorKey });
    if (!result.success) {
      throw new ConsultationRateLimitError();
    }
  },
  async requireIngressAllowed(request: Request) {
    const limiter = requireLiveBinding("CONSULTATION_SUBMIT_RATE_LIMITER");
    const result = await limiter.limit({ key: await consultationNetworkActorKey(request) });
    if (!result.success) throw new ConsultationRateLimitError();
  },
};

export { consultationPhoneActorKey };
