import { getTreatment } from "@/data/treatments";
import { MAX_CONSULTATION_SELECTED_SERVICES } from "./config";
import { z } from "zod";

export const consultationStatusSchema = z.enum(["new", "contacted", "booked", "archived"]);

export const consultationContactSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(6).max(32),
    email: z.string().trim().email().max(120).optional().or(z.literal("")),
    preferredContact: z.enum(["phone", "whatsapp", "email"]),
    preferredDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .or(z.literal("")),
    preferredWindow: z.string().trim().min(1).max(120),
  })
  .superRefine((contact, ctx) => {
    if (contact.preferredContact === "email" && !contact.email) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Inserisci un'email se scegli Email come contatto preferito.",
      });
    }
  });

const serviceSlugSchema = z.string().trim().min(1).max(120);

const consultationSubmissionBaseSchema = z.object({
  serviceSlug: serviceSlugSchema,
  answers: z.record(z.string().max(120)),
  recommendedSlugs: z.array(serviceSlugSchema).max(2),
  selectedServiceSlugs: z.array(serviceSlugSchema).min(1).max(MAX_CONSULTATION_SELECTED_SERVICES),
  contact: consultationContactSchema,
  consent: z.literal(true),
});

function refineSubmission(
  submission: z.infer<typeof consultationSubmissionBaseSchema>,
  ctx: z.RefinementCtx,
) {
  const recommended = new Set(submission.recommendedSlugs);
  const selected = new Set(submission.selectedServiceSlugs);

  if (recommended.size !== submission.recommendedSlugs.length) {
    ctx.addIssue({
      code: "custom",
      path: ["recommendedSlugs"],
      message: "I suggerimenti non possono contenere duplicati.",
    });
  }
  if (selected.size !== submission.selectedServiceSlugs.length) {
    ctx.addIssue({
      code: "custom",
      path: ["selectedServiceSlugs"],
      message: "I servizi selezionati non possono contenere duplicati.",
    });
  }
  if (!selected.has(submission.serviceSlug)) {
    ctx.addIssue({
      code: "custom",
      path: ["selectedServiceSlugs"],
      message: "Il servizio principale deve restare nel percorso.",
    });
  }
  if (recommended.has(submission.serviceSlug)) {
    ctx.addIssue({
      code: "custom",
      path: ["recommendedSlugs"],
      message: "Il servizio principale non può essere un complementare.",
    });
  }

  for (const slug of new Set([
    submission.serviceSlug,
    ...submission.recommendedSlugs,
    ...submission.selectedServiceSlugs,
  ])) {
    if (!getTreatment(slug)) {
      ctx.addIssue({
        code: "custom",
        path: ["selectedServiceSlugs"],
        message: `Servizio non disponibile: ${slug}`,
      });
    }
  }
}

export const consultationSubmissionSchema =
  consultationSubmissionBaseSchema.superRefine(refineSubmission);

export const liveConsultationSubmissionSchema = z.object({
  submissionKey: z.string().uuid(),
  submission: consultationSubmissionSchema,
});

export const consultationRequestSchema = consultationSubmissionBaseSchema
  .extend({
    id: z.string().trim().min(1).max(160),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    version: z.number().int().positive(),
    status: consultationStatusSchema,
    note: z.string().max(600),
    source: z.enum(["demo", "live"]),
  })
  .superRefine(refineSubmission);

export const consultationRequestListSchema = z.array(consultationRequestSchema);

export const consultationAdminGetSchema = z.object({
  id: z.string().trim().min(1).max(160),
});

const adminCsrfSchema = z.string().trim().min(20).max(256);

export const consultationAdminUpdateSchema = z.object({
  csrfToken: adminCsrfSchema,
  id: z.string().trim().min(1).max(160),
  expectedVersion: z.number().int().positive(),
  status: consultationStatusSchema.optional(),
  note: z.string().max(600).optional(),
});

export const consultationAdminEditSchema = z
  .object({
    csrfToken: adminCsrfSchema,
    id: z.string().trim().min(1).max(160),
    expectedVersion: z.number().int().positive(),
    selectedServiceSlugs: z
      .array(serviceSlugSchema)
      .min(1)
      .max(MAX_CONSULTATION_SELECTED_SERVICES)
      .refine(
        (values) => new Set(values).size === values.length,
        "Servizi duplicati non consentiti.",
      ),
    contact: consultationContactSchema,
  })
  .superRefine((input, ctx) => {
    for (const slug of input.selectedServiceSlugs) {
      if (!getTreatment(slug)) {
        ctx.addIssue({
          code: "custom",
          path: ["selectedServiceSlugs"],
          message: `Servizio non disponibile: ${slug}`,
        });
      }
    }
  });

export const consultationAdminDeleteSchema = z.object({
  csrfToken: adminCsrfSchema,
  id: z.string().trim().min(1).max(160),
  expectedVersion: z.number().int().positive(),
});
