import { consultationRealtimeEventSchema } from "../realtime";
import type { ConsultationRealtime } from "./contracts";
import { requireLiveBinding } from "./cloudflare-env.server";

export const durableObjectConsultationRealtime: ConsultationRealtime = {
  async publish(event) {
    const parsed = consultationRealtimeEventSchema.parse(event);
    const namespace = requireLiveBinding("CONSULTATION_REALTIME");
    const response = await namespace.getByName("main").fetch(
      new Request("https://consultation-realtime.internal/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed),
      }),
    );
    if (!response.ok) throw new Error("Realtime Consultation Inbox non disponibile.");
  },
};
