import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { heroCtaSchema, heroSlideDraftSchema, heroSlideListSchema, heroSlideSchema } from "./model";
import {
  createHeroSlideLive,
  deleteHeroSlideLive,
  listAdminHeroSlidesLive,
  listPublicHeroSlidesLive,
  saveHeroOrderLive,
  updateHeroSlideLive,
} from "./live/live-hero.service.server";

const csrfTokenSchema = z.string().trim().min(20).max(256);

function noStore() {
  setResponseHeader("Cache-Control", "no-store");
}

export const listPublicHeroSlides = createServerFn({ method: "GET" }).handler(async () => {
  noStore();
  return heroSlideListSchema.parse(await listPublicHeroSlidesLive());
});

export const listAdminHeroSlides = createServerFn({ method: "GET" }).handler(async () => {
  noStore();
  return heroSlideListSchema.parse(await listAdminHeroSlidesLive(getRequest()));
});

export const createHeroSlide = createServerFn({ method: "POST" })
  .validator(z.object({ slide: heroSlideDraftSchema, csrfToken: csrfTokenSchema }))
  .handler(async ({ data }) => {
    noStore();
    return heroSlideSchema.parse(await createHeroSlideLive(getRequest(), data));
  });

export const updateHeroSlide = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().trim().min(1).max(160),
      expectedVersion: z.number().int().positive(),
      slide: heroSlideDraftSchema,
      csrfToken: csrfTokenSchema,
    }),
  )
  .handler(async ({ data }) => {
    noStore();
    return heroSlideSchema.parse(await updateHeroSlideLive(getRequest(), data));
  });

export const deleteHeroSlide = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().trim().min(1).max(160),
      expectedVersion: z.number().int().positive(),
      csrfToken: csrfTokenSchema,
    }),
  )
  .handler(async ({ data }) => {
    noStore();
    return heroSlideListSchema.parse(await deleteHeroSlideLive(getRequest(), data));
  });

export const saveHeroOrder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      items: z
        .array(
          z.object({
            id: z.string().trim().min(1).max(160),
            order: z.number().int().min(0).max(99),
            expectedVersion: z.number().int().positive(),
          }),
        )
        .min(1)
        .max(5),
      csrfToken: csrfTokenSchema,
    }),
  )
  .handler(async ({ data }) => {
    noStore();
    return heroSlideListSchema.parse(await saveHeroOrderLive(getRequest(), data));
  });

export { heroCtaSchema };
