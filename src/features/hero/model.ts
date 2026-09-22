import { z } from "zod";

export const heroSlideStatuses = ["draft", "published", "archived"] as const;
export const heroCtaTargets = [
  "consultation",
  "treatments",
  "studio",
  "gallery",
  "contact",
] as const;

export type HeroSlideStatus = (typeof heroSlideStatuses)[number];
export type HeroCtaTarget = (typeof heroCtaTargets)[number];

export const heroImageRefs = [
  "/images/rito/rito-hero-main.webp",
  "/images/rito/rito-gallery-hair-01.webp",
  "/images/rito/rito-gallery-professional-01.webp",
  "/images/rito/rito-gallery-skin-01.webp",
  "/images/rito/rito-ritual-feature.webp",
  "/images/rito/rito-studio-wide.webp",
  "/images/rito/rito-gallery-space-01.webp",
] as const;

export const heroImageOptions = [
  {
    ref: "/images/rito/rito-hero-main.webp",
    label: "Rituale viso",
    alt: "Professionista durante un trattamento viso in atelier",
    objectPosition: "57% 45%",
  },
  {
    ref: "/images/rito/rito-gallery-hair-01.webp",
    label: "Hair texture",
    alt: "Dettaglio di capelli biondi mossi durante lo styling",
    objectPosition: "center 45%",
  },
  {
    ref: "/images/rito/rito-gallery-professional-01.webp",
    label: "Hair professional",
    alt: "Applicazione professionale del colore sui capelli",
    objectPosition: "center center",
  },
  {
    ref: "/images/rito/rito-gallery-skin-01.webp",
    label: "Skin gesture",
    alt: "Trattamento viso eseguito con un gesto delicato",
    objectPosition: "center center",
  },
  {
    ref: "/images/rito/rito-ritual-feature.webp",
    label: "Hands ritual",
    alt: "Mani di una professionista durante una manicure di precisione",
    objectPosition: "center center",
  },
  {
    ref: "/images/rito/rito-studio-wide.webp",
    label: "Studio wide",
    alt: "Interno luminoso di RITO Studio con postazioni e specchi",
    objectPosition: "center center",
  },
  {
    ref: "/images/rito/rito-gallery-space-01.webp",
    label: "Studio detail",
    alt: "Postazione professionale in un ambiente beauty essenziale",
    objectPosition: "center center",
  },
] as const;

export const heroCtaSchema = z.object({
  label: z.string().trim().min(1).max(60),
  target: z.enum(heroCtaTargets),
});

function addScheduleIssues(
  slide: { status: HeroSlideStatus; startsAt: string; endsAt: string },
  ctx: z.RefinementCtx,
) {
  if (slide.status === "published" && !slide.startsAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Imposta data e ora di inizio prima di pubblicare la schermata.",
      path: ["startsAt"],
    });
  }
  if (slide.startsAt && slide.endsAt && slide.endsAt <= slide.startsAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fine deve essere successiva all'inizio.",
      path: ["endsAt"],
    });
  }
}

const heroSlideDraftBaseSchema = z.object({
  eyebrow: z.string().trim().min(1).max(90),
  title: z.string().trim().min(1).max(90),
  accent: z.string().trim().min(1).max(90),
  trailing: z.string().trim().max(90),
  body: z.string().trim().min(1).max(360),
  imageRef: z.enum(heroImageRefs),
  imageAlt: z.string().trim().min(1).max(180),
  mobileImageRef: z.enum(heroImageRefs).or(z.literal("")).optional().default(""),
  mobileImageAlt: z.string().trim().max(180).optional().default(""),
  primaryCta: heroCtaSchema,
  secondaryCta: heroCtaSchema.nullable(),
  status: z.enum(heroSlideStatuses),
  startsAt: z.string().datetime().or(z.literal("")),
  endsAt: z.string().datetime().or(z.literal("")),
});

export const heroSlideDraftSchema = heroSlideDraftBaseSchema.superRefine(addScheduleIssues);

export const heroSlideSchema = heroSlideDraftBaseSchema
  .extend({
    id: z.string().trim().min(1).max(160),
    order: z.number().int().min(0).max(99),
    version: z.number().int().positive(),
  })
  .superRefine(addScheduleIssues);

export const heroSlideListSchema = z.array(heroSlideSchema).max(5);

export type HeroCta = z.infer<typeof heroCtaSchema>;
export type HeroSlide = z.infer<typeof heroSlideSchema>;

export const heroSlideStatusLabels: Record<HeroSlideStatus, string> = {
  draft: "Bozza",
  published: "Pubblicata",
  archived: "Archiviata",
};

export const heroCtaTargetLabels: Record<HeroCtaTarget, string> = {
  consultation: "Consulenza",
  treatments: "Trattamenti",
  studio: "Studio",
  gallery: "Galleria",
  contact: "Contatti",
};

export function getHeroImageOption(ref: string) {
  return heroImageOptions.find((item) => item.ref === ref) ?? null;
}

export function isHeroSlideActive(slide: HeroSlide, now = new Date()) {
  if (slide.status !== "published" || !slide.startsAt) return false;
  const current = now.getTime();
  const starts = Date.parse(slide.startsAt);
  const ends = slide.endsAt ? Date.parse(slide.endsAt) : Number.POSITIVE_INFINITY;
  return Number.isFinite(starts) && starts <= current && current < ends;
}
