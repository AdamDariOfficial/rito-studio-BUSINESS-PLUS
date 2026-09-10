import { submitConsultationLive } from "./live-consultation.service.server";
import { handlePublicConsultationSubmitCore } from "./public-submit-core";
import { workersConsultationRateLimiter } from "./workers-rate-limiter.server";

export async function handlePublicConsultationSubmit(request: Request): Promise<Response | null> {
  return handlePublicConsultationSubmitCore(request, {
    requireIngressAllowed: (currentRequest) =>
      workersConsultationRateLimiter.requireIngressAllowed(currentRequest),
    submit: submitConsultationLive,
  });
}
