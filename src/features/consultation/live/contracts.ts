import type { ConsultationRealtimeEvent } from "../realtime";
import type { ConsultationRequest, ConsultationStatus, ConsultationSubmission } from "../types";

export interface ConsultationCreateInput {
  submissionKey: string;
  submission: ConsultationSubmission;
  consentAt: string;
  privacyVersion: string;
}

export interface ConsultationUpdateInput {
  id: string;
  expectedVersion: number;
  status?: ConsultationStatus;
  note?: string;
}

export interface ConsultationEditInput {
  id: string;
  expectedVersion: number;
  selectedServiceSlugs: string[];
  contact: ConsultationRequest["contact"];
}

export interface ConsultationRepository {
  create(
    input: ConsultationCreateInput,
  ): Promise<{ request: ConsultationRequest; created: boolean }>;
  list(): Promise<ConsultationRequest[]>;
  get(id: string): Promise<ConsultationRequest | null>;
  getBySubmissionKey(submissionKey: string): Promise<ConsultationRequest | null>;
  update(input: ConsultationUpdateInput): Promise<ConsultationRequest>;
  edit(input: ConsultationEditInput): Promise<ConsultationRequest>;
  delete(id: string, expectedVersion: number): Promise<void>;
}

export interface ConsultationRealtime {
  publish(event: ConsultationRealtimeEvent): Promise<void>;
}

export interface AdminIdentity {
  subject: string;
  email?: string;
}

export interface AdminAuth {
  getIdentity(request: Request): Promise<AdminIdentity | null>;
  requireIdentity(request: Request): Promise<AdminIdentity>;
}

export interface ConsultationRateLimiter {
  requireSubmitAllowed(actorKey: string): Promise<void>;
}
