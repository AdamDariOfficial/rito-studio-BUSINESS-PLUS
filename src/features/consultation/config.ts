import type {
  ConsultationHandoff,
  ConsultationProfile,
  ConsultationQuestion,
  RecommendationRule,
} from "./types";
import type { TreatmentCategoryId } from "@/data/treatments";

export const MAX_CONSULTATION_SELECTED_SERVICES = 6;

export function getConsultationProfile(): ConsultationProfile {
  return import.meta.env.VITE_CONSULTATION_PROFILE === "live" ? "live" : "demo";
}

export function getConsultationHandoff(): ConsultationHandoff {
  const value = import.meta.env.VITE_CONSULTATION_HANDOFF;
  if (value === "tel" || value === "whatsapp" || value === "external" || value === "inbox") {
    return value;
  }
  return "inbox";
}

const commonTimingQuestion: ConsultationQuestion = {
  id: "timing",
  prompt: "Quando vorresti dedicarti questo momento?",
  options: [
    { value: "presto", label: "Nei prossimi giorni" },
    { value: "due-settimane", label: "Entro due settimane" },
    { value: "senza-fretta", label: "Senza fretta" },
  ],
};

const questionsByCategory: Record<TreatmentCategoryId, readonly ConsultationQuestion[]> = {
  hair: [
    {
      id: "goal",
      prompt: "Che tipo di risultato stai cercando?",
      options: [
        { value: "rinnovo", label: "Un cambiamento visibile" },
        { value: "mantenimento", label: "Mantenere e ordinare" },
        { value: "occasione", label: "Prepararmi per un'occasione" },
      ],
    },
    {
      id: "pace",
      prompt: "Che tipo di percorso preferisci?",
      options: [
        { value: "essenziale", label: "Solo ciò che serve" },
        { value: "completo", label: "Un percorso più completo" },
        { value: "guidami", label: "Preferisco farmi guidare" },
      ],
    },
    commonTimingQuestion,
  ],
  skin: [
    {
      id: "goal",
      prompt: "Su cosa vuoi concentrarti?",
      options: [
        { value: "cura", label: "Un momento di cura" },
        { value: "luminosita", label: "Un aspetto più luminoso" },
        { value: "definizione", label: "Definire lo sguardo" },
      ],
    },
    {
      id: "pace",
      prompt: "Che tipo di esperienza preferisci?",
      options: [
        { value: "essenziale", label: "Essenziale" },
        { value: "completo", label: "Più completa" },
        { value: "guidami", label: "Preferisco farmi guidare" },
      ],
    },
    commonTimingQuestion,
  ],
  hands: [
    {
      id: "goal",
      prompt: "Che risultato vuoi ottenere?",
      options: [
        { value: "ordine", label: "Ordine e cura essenziale" },
        { value: "finitura", label: "Una finitura più definita" },
        { value: "rituale", label: "Un momento di cura più completo" },
      ],
    },
    {
      id: "pace",
      prompt: "Quanto vuoi rendere completo il momento?",
      options: [
        { value: "essenziale", label: "Essenziale" },
        { value: "completo", label: "Più completo" },
        { value: "guidami", label: "Preferisco farmi guidare" },
      ],
    },
    commonTimingQuestion,
  ],
  wellness: [
    {
      id: "goal",
      prompt: "Che tipo di pausa stai cercando?",
      options: [
        { value: "relax", label: "Rallentare e rilassarmi" },
        { value: "mirato", label: "Dedicarmi a una zona specifica" },
        { value: "completo", label: "Un momento più completo" },
      ],
    },
    {
      id: "pace",
      prompt: "Quanto tempo vuoi dedicare al percorso?",
      options: [
        { value: "essenziale", label: "Essenziale" },
        { value: "completo", label: "Più disteso" },
        { value: "guidami", label: "Preferisco farmi guidare" },
      ],
    },
    commonTimingQuestion,
  ],
};

export function getConsultationQuestions(category: TreatmentCategoryId) {
  return questionsByCategory[category];
}

export function getConsultationQuestion(category: TreatmentCategoryId, questionId: string) {
  return questionsByCategory[category].find((question) => question.id === questionId);
}

export function getConsultationAnswerLabel(
  category: TreatmentCategoryId,
  questionId: string,
  value: string,
) {
  const question = getConsultationQuestion(category, questionId);
  return question?.options.find((option) => option.value === value)?.label ?? value;
}

export const recommendationRules: readonly RecommendationRule[] = [
  {
    category: "hair",
    when: { goal: "rinnovo" },
    suggest: ["trattamento-texture", "piega-e-styling"],
  },
  {
    category: "hair",
    when: { goal: "mantenimento" },
    suggest: ["taglio-essenziale", "trattamento-texture"],
  },
  {
    category: "hair",
    when: { goal: "occasione" },
    suggest: ["piega-e-styling", "trattamento-texture"],
  },
  {
    category: "skin",
    when: { goal: "cura" },
    suggest: ["rituale-viso", "trattamento-illuminante"],
  },
  {
    category: "skin",
    when: { goal: "luminosita" },
    suggest: ["trattamento-illuminante", "rituale-viso"],
  },
  { category: "skin", when: { goal: "definizione" }, suggest: ["brow-design", "lash-lift"] },
  { category: "hands", when: { goal: "ordine" }, suggest: ["manicure-essenziale", "nail-care"] },
  {
    category: "hands",
    when: { goal: "finitura" },
    suggest: ["semipermanente", "manicure-essenziale"],
  },
  {
    category: "hands",
    when: { goal: "rituale" },
    suggest: ["rituale-mani", "manicure-essenziale"],
  },
  {
    category: "wellness",
    when: { goal: "relax" },
    suggest: ["massaggio-distensivo", "trattamento-relax"],
  },
  {
    category: "wellness",
    when: { goal: "mirato" },
    suggest: ["rituale-schiena", "massaggio-distensivo"],
  },
  {
    category: "wellness",
    when: { goal: "completo" },
    suggest: ["trattamento-relax", "percorso-corpo"],
  },
] as const;

export const consultationWindows = [
  "Mattina",
  "Primo pomeriggio",
  "Tardo pomeriggio",
  "Sono flessibile",
] as const;
