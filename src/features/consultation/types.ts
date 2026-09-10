export type ConsultationProfile = "demo" | "live";
export type ConsultationHandoff = "inbox" | "tel" | "whatsapp" | "external";
export type ConsultationStatus = "new" | "contacted" | "booked" | "archived";
export type PreferredContact = "phone" | "whatsapp" | "email";
export type PreferredWindow =
  | "Mattina"
  | "Primo pomeriggio"
  | "Tardo pomeriggio"
  | "Sono flessibile";

export interface ConsultationContact {
  name: string;
  phone: string;
  email?: string;
  preferredContact: PreferredContact;
  preferredDate?: string;
  preferredWindow: PreferredWindow;
}

export interface ConsultationSubmission {
  serviceSlug: string;
  answers: Record<string, string>;
  recommendedSlugs: string[];
  selectedServiceSlugs: string[];
  contact: ConsultationContact;
  consent: true;
}

export interface ConsultationRequest extends ConsultationSubmission {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  status: ConsultationStatus;
  note: string;
  source: ConsultationProfile;
}

export interface ConsultationQuestionOption {
  value: string;
  label: string;
}

export interface ConsultationQuestion {
  id: string;
  prompt: string;
  hint?: string;
  options: readonly ConsultationQuestionOption[];
}

export interface RecommendationRule {
  category: "hair" | "skin" | "hands" | "wellness";
  when: Record<string, string>;
  suggest: readonly string[];
}
