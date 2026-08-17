export type ConsultationEventName =
  | "consultation_started"
  | "consultation_step_completed"
  | "consultation_completed"
  | "consultation_recommendation_toggled"
  | "consultation_handoff_clicked";

export interface ConsultationEvent {
  name: ConsultationEventName;
  serviceSlug?: string;
  step?: number;
  value?: string;
}

export function trackConsultationEvent(event: ConsultationEvent) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("rito:consultation-event", {
      detail: event,
    }),
  );
}
