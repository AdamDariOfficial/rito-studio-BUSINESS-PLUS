import nitroWorker, { ConsultationRealtimeHub } from "./index.mjs";
import {
  applyStagingTransportHeaders,
  createStagingHttpsRedirect,
} from "./staging-security-response.mjs";

export { ConsultationRealtimeHub };

export default {
  ...nitroWorker,
  async fetch(request, env, context) {
    const redirect = createStagingHttpsRedirect(request);
    if (redirect) return redirect;

    const response = await nitroWorker.fetch(request, env, context);
    return applyStagingTransportHeaders(request, response);
  },
};
