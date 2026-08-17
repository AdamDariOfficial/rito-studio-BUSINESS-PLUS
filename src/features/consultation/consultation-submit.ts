import { createClientOnlyFn } from "@tanstack/react-start";
import { consultationRequestSchema, liveConsultationSubmissionSchema } from "./schemas";
import type { ConsultationSubmission } from "./types";

export const submitLiveConsultation = createClientOnlyFn(
  async (input: { submissionKey: string; submission: ConsultationSubmission }) => {
    const body = liveConsultationSubmissionSchema.parse(input);
    const response = await fetch("/api/consultations", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Consultation submit failed (${response.status}).`);
    }

    return consultationRequestSchema.parse(await response.json());
  },
);
