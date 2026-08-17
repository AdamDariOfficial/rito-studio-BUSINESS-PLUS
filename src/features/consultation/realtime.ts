import { z } from "zod";

export const consultationRealtimeEventSchema = z.object({
  type: z.enum(["consultation.created", "consultation.updated", "consultation.deleted"]),
  requestId: z.string().trim().min(1).max(160),
  version: z.number().int().positive(),
  occurredAt: z.string().datetime(),
});

export type ConsultationRealtimeEvent = z.infer<typeof consultationRealtimeEventSchema>;
