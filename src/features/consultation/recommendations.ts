import { getTreatment, treatments } from "@/data/treatments";
import { recommendationRules } from "./config";

function matches(rule: Record<string, string>, answers: Record<string, string>) {
  return Object.entries(rule).every(([key, value]) => answers[key] === value);
}

export function resolveRecommendations(serviceSlug: string, answers: Record<string, string>) {
  const service = getTreatment(serviceSlug);
  if (!service) return [];

  const fromRules = recommendationRules
    .filter((rule) => rule.category === service.category && matches(rule.when, answers))
    .flatMap((rule) => rule.suggest);

  const sameCategoryFallback = treatments
    .filter((candidate) => candidate.category === service.category)
    .map((candidate) => candidate.slug);

  const ordered = [...fromRules, ...sameCategoryFallback];

  return ordered
    .filter((slug, index) => slug !== service.slug && ordered.indexOf(slug) === index)
    .map((slug) => getTreatment(slug))
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
    .slice(0, 2);
}
