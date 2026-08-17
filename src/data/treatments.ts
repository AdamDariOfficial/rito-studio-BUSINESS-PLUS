export type TreatmentCategoryId = "hair" | "skin" | "hands" | "wellness";

export interface TreatmentCategory {
  id: TreatmentCategoryId;
  index: string;
  name: string;
  introduction: string;
}

export interface Treatment {
  name: string;
  slug: string;
  category: TreatmentCategoryId;
  priceLabel: string;
  priceAmount: number;
  priceFrom?: boolean;
  shortDescription: string;
  duration?: string;
  fullDescription?: string;
  idealFor?: string;
  includes?: readonly string[];
  beforeAppointment?: string;
  afterAppointment?: string;
  notes?: string;
}

export const treatmentCategories: readonly TreatmentCategory[] = [
  {
    id: "hair",
    index: "01",
    name: "Hair Rituals",
    introduction: "Taglio, colore, texture e styling definiti attraverso una consulenza iniziale.",
  },
  {
    id: "skin",
    index: "02",
    name: "Skin & Brow",
    introduction: "Rituali viso, brow e lash con indicazioni calibrate sull'esigenza espressa.",
  },
  {
    id: "hands",
    index: "03",
    name: "Hands & Nails",
    introduction: "Cura essenziale di mani e unghie, con tecniche concordate prima del servizio.",
  },
  {
    id: "wellness",
    index: "04",
    name: "Wellness",
    introduction:
      "Percorsi distensivi e di benessere non medicali, costruiti senza promesse cliniche.",
  },
] as const;

function defineTreatment(treatment: Treatment): Treatment {
  return treatment;
}

export const treatments: readonly Treatment[] = [
  defineTreatment({
    name: "Taglio essenziale",
    slug: "taglio-essenziale",
    category: "hair",
    priceLabel: "€45",
    priceAmount: 45,
    shortDescription: "Un taglio costruito su proporzioni, abitudini e texture.",
  }),
  defineTreatment({
    name: "Colore su misura",
    slug: "colore-su-misura",
    category: "hair",
    priceLabel: "da €80",
    priceAmount: 80,
    priceFrom: true,
    shortDescription: "Un percorso colore definito dopo un confronto su tono e mantenimento.",
  }),
  defineTreatment({
    name: "Trattamento texture",
    slug: "trattamento-texture",
    category: "hair",
    priceLabel: "da €65",
    priceAmount: 65,
    priceFrom: true,
    shortDescription: "Un rituale dedicato alla gestione e alla presenza naturale della texture.",
  }),
  defineTreatment({
    name: "Piega e styling",
    slug: "piega-e-styling",
    category: "hair",
    priceLabel: "da €35",
    priceAmount: 35,
    priceFrom: true,
    shortDescription: "Forma e styling concordati in base al risultato desiderato.",
  }),
  defineTreatment({
    name: "Rituale viso",
    slug: "rituale-viso",
    category: "skin",
    priceLabel: "€70",
    priceAmount: 70,
    shortDescription:
      "Un trattamento personalizzato che combina detersione, manualità e prodotti selezionati in base alle esigenze della pelle.",
    duration: "60 min",
    fullDescription:
      "Un rituale viso costruito a partire dall’ascolto e dall’osservazione delle esigenze espresse. Passaggi e prodotti vengono condivisi prima di iniziare.",
    idealFor: "Chi desidera dedicare tempo alla cura del viso con un percorso concordato.",
    includes: ["Confronto iniziale", "Rituale viso", "Indicazioni essenziali successive"],
    beforeAppointment:
      "Comunica allo studio eventuali sensibilità o indicazioni rilevanti prima dell’appuntamento.",
    afterAppointment:
      "Segui le indicazioni condivise al termine e contatta lo studio in caso di dubbi.",
    notes: "Il trattamento non ha finalità mediche o terapeutiche.",
  }),
  defineTreatment({
    name: "Brow design",
    slug: "brow-design",
    category: "skin",
    priceLabel: "€25",
    priceAmount: 25,
    shortDescription: "Definizione delle sopracciglia concordata a partire da forma ed equilibrio.",
  }),
  defineTreatment({
    name: "Lash lift",
    slug: "lash-lift",
    category: "skin",
    priceLabel: "€55",
    priceAmount: 55,
    shortDescription:
      "Un servizio dedicato alla curvatura delle ciglia, preceduto da una verifica dell'esigenza.",
  }),
  defineTreatment({
    name: "Trattamento illuminante",
    slug: "trattamento-illuminante",
    category: "skin",
    priceLabel: "€80",
    priceAmount: 80,
    shortDescription: "Un rituale viso orientato a una sensazione di freschezza e cura.",
  }),
  defineTreatment({
    name: "Manicure essenziale",
    slug: "manicure-essenziale",
    category: "hands",
    priceLabel: "€30",
    priceAmount: 30,
    shortDescription: "Cura ordinata di mani e unghie con finitura essenziale.",
  }),
  defineTreatment({
    name: "Semipermanente",
    slug: "semipermanente",
    category: "hands",
    priceLabel: "€40",
    priceAmount: 40,
    shortDescription: "Applicazione concordata per una finitura uniforme e controllata.",
  }),
  defineTreatment({
    name: "Nail care",
    slug: "nail-care",
    category: "hands",
    priceLabel: "€35",
    priceAmount: 35,
    shortDescription:
      "Un servizio di cura essenziale costruito sulle condizioni osservabili delle unghie.",
  }),
  defineTreatment({
    name: "Rituale mani",
    slug: "rituale-mani",
    category: "hands",
    priceLabel: "€45",
    priceAmount: 45,
    shortDescription:
      "Un tempo dedicato alla cura delle mani, con passaggi chiariti prima di iniziare.",
  }),
  defineTreatment({
    name: "Massaggio distensivo",
    slug: "massaggio-distensivo",
    category: "wellness",
    priceLabel: "€70",
    priceAmount: 70,
    shortDescription: "Un rituale di benessere non medicale dal ritmo lento e concordato.",
  }),
  defineTreatment({
    name: "Rituale schiena",
    slug: "rituale-schiena",
    category: "wellness",
    priceLabel: "€55",
    priceAmount: 55,
    shortDescription: "Un percorso dedicato alla zona della schiena, senza finalità terapeutiche.",
  }),
  defineTreatment({
    name: "Trattamento relax",
    slug: "trattamento-relax",
    category: "wellness",
    priceLabel: "€85",
    priceAmount: 85,
    shortDescription:
      "Un tempo di cura non medicale, costruito per rallentare il ritmo dell'appuntamento.",
  }),
  defineTreatment({
    name: "Percorso corpo",
    slug: "percorso-corpo",
    category: "wellness",
    priceLabel: "da €95",
    priceAmount: 95,
    priceFrom: true,
    shortDescription: "Un percorso corpo definito in consulenza, senza promesse cliniche.",
  }),
] as const;

export const servicesNote =
  "I prezzi indicati si intendono a partire da dove specificato. Eventuali variazioni vengono concordate durante la consulenza.";

export function formatTreatmentSelectionTotal(items: readonly Treatment[]) {
  const amount = items.reduce((total, treatment) => total + treatment.priceAmount, 0);
  const hasStartingPrice = items.some((treatment) => treatment.priceFrom);
  return `${hasStartingPrice ? "da " : ""}€${amount.toLocaleString("it-IT")}`;
}

export function getTreatment(slug: string) {
  return treatments.find((treatment) => treatment.slug === slug);
}

export function getCategory(id: TreatmentCategoryId) {
  return treatmentCategories.find((category) => category.id === id);
}
