import { getTreatment } from "@/data/treatments";
import { getConsultationQuestions } from "../config";
import { consultationSubmissionSchema } from "../schemas";
import type { ConsultationSubmission } from "../types";
import { getConsultationCloudflareEnv } from "./cloudflare-env.server";
import { d1ConsultationRepository } from "./d1-consultation-repository.server";
import { ConsultationInputError } from "./errors";
import { durableObjectConsultationRealtime } from "./durable-object-realtime.server";
import { nativeAdminAuth, requireAdminCsrf } from "./native-admin-auth.server";
import {
  consultationSubmitActorKey,
  workersConsultationRateLimiter,
} from "./workers-rate-limiter.server";

function validateSubmissionSemantics(submission: ConsultationSubmission) {
  const parsed = consultationSubmissionSchema.parse(submission);
  const treatment = getTreatment(parsed.serviceSlug);
  if (!treatment) throw new ConsultationInputError();

  const questions = getConsultationQuestions(treatment.category);
  const allowedQuestionIds = new Set(questions.map((question) => question.id));
  for (const question of questions) {
    const answer = parsed.answers[question.id];
    if (!answer || !question.options.some((option) => option.value === answer)) {
      throw new ConsultationInputError();
    }
  }
  if (Object.keys(parsed.answers).some((id) => !allowedQuestionIds.has(id))) {
    throw new ConsultationInputError();
  }

  return parsed;
}

function privacyVersion() {
  const value = getConsultationCloudflareEnv().CONSULTATION_PRIVACY_VERSION?.trim();
  if (!value) throw new Error("CONSULTATION_PRIVACY_VERSION non configurata.");
  return value;
}

function event(
  type: "consultation.created" | "consultation.updated" | "consultation.deleted",
  requestId: string,
  version: number,
) {
  return { type, requestId, version, occurredAt: new Date().toISOString() } as const;
}

async function publishRealtimeBestEffort(payload: ReturnType<typeof event>) {
  try {
    await durableObjectConsultationRealtime.publish(payload);
  } catch (error) {
    // D1 is canonical. A realtime outage must never turn an already-persisted operation
    // into a false failure for the visitor/admin; reconnect + snapshot is authoritative.
    console.error("Consultation realtime publish failed after D1 commit", {
      eventType: payload.type,
      requestId: payload.requestId,
      version: payload.version,
      errorName: error instanceof Error ? error.name : typeof error,
    });
  }
}

export async function submitConsultationLive(input: {
  submissionKey: string;
  submission: ConsultationSubmission;
}) {
  const submission = validateSubmissionSemantics(input.submission);
  const existing = await d1ConsultationRepository.getBySubmissionKey(input.submissionKey);
  if (existing) return existing;

  await workersConsultationRateLimiter.requireSubmitAllowed(
    await consultationSubmitActorKey(submission.contact.phone),
  );
  const result = await d1ConsultationRepository.create({
    submissionKey: input.submissionKey,
    submission,
    consentAt: new Date().toISOString(),
    privacyVersion: privacyVersion(),
  });

  if (result.created) {
    await publishRealtimeBestEffort(
      event("consultation.created", result.request.id, result.request.version),
    );
  }
  return result.request;
}

export async function getAdminIdentity(request: Request) {
  return nativeAdminAuth.getIdentity(request);
}

export async function listConsultationsLive(request: Request) {
  await nativeAdminAuth.requireIdentity(request);
  return d1ConsultationRepository.list();
}

export async function getConsultationLive(request: Request, id: string) {
  await nativeAdminAuth.requireIdentity(request);
  const result = await d1ConsultationRepository.get(id);
  if (!result) throw new Error("Richiesta non trovata.");
  return result;
}

export async function updateConsultationLive(
  request: Request,
  input: import("./contracts").ConsultationUpdateInput & { csrfToken: string },
) {
  await requireAdminCsrf(request, input.csrfToken);
  const { csrfToken: _csrfToken, ...update } = input;
  const result = await d1ConsultationRepository.update(update);
  await publishRealtimeBestEffort(event("consultation.updated", result.id, result.version));
  return result;
}

export async function editConsultationLive(
  request: Request,
  input: import("./contracts").ConsultationEditInput & { csrfToken: string },
) {
  await requireAdminCsrf(request, input.csrfToken);
  const { csrfToken: _csrfToken, ...edit } = input;
  const result = await d1ConsultationRepository.edit(edit);
  await publishRealtimeBestEffort(event("consultation.updated", result.id, result.version));
  return result;
}

export async function deleteConsultationLive(
  request: Request,
  input: { id: string; expectedVersion: number; csrfToken: string },
) {
  await requireAdminCsrf(request, input.csrfToken);
  await d1ConsultationRepository.delete(input.id, input.expectedVersion);
  await publishRealtimeBestEffort(
    event("consultation.deleted", input.id, input.expectedVersion + 1),
  );
}
