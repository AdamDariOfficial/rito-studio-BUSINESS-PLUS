import { getTreatment } from "../../../data/treatments.ts";
import { getConsultationQuestions } from "../config.ts";
import { resolveRecommendations } from "../recommendations.ts";
import { consultationSubmissionSchema } from "../schemas.ts";
import type { ConsultationSubmission } from "../types.ts";
import { ConsultationInputError } from "./errors.ts";

export function validateSubmissionSemantics(submission: ConsultationSubmission) {
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

  const canonicalRecommendations = resolveRecommendations(parsed.serviceSlug, parsed.answers).map(
    (candidate) => candidate.slug,
  );
  if (
    parsed.recommendedSlugs.length !== canonicalRecommendations.length ||
    parsed.recommendedSlugs.some((slug, index) => slug !== canonicalRecommendations[index])
  ) {
    throw new ConsultationInputError();
  }

  return parsed;
}
