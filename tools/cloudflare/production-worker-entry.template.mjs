import nitroWorker, { ConsultationRealtimeHub } from "./index.mjs";
import {
  applyProductionTransportHeaders,
  createProductionHttpsRedirect,
} from "./production-security-response.mjs";

export { ConsultationRealtimeHub };

export default {
  ...nitroWorker,
  async fetch(request, env, context) {
    const redirect = createProductionHttpsRedirect(request);
    if (redirect) return redirect;

    const response = await nitroWorker.fetch(request, env, context);
    return applyProductionTransportHeaders(request, response);
  },
};
