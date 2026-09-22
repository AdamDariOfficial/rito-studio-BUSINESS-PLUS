import { heroSlideSchema, getHeroImageOption, type HeroSlide } from "../model";
import { d1HeroRepository } from "./d1-hero-repository.server";
import {
  nativeAdminAuth,
  requireAdminCsrf,
} from "../../consultation/live/native-admin-auth.server";

function requireImage(ref: string) {
  if (!getHeroImageOption(ref)) throw new Error("Immagine hero non consentita.");
}

export async function listPublicHeroSlidesLive() {
  return d1HeroRepository.listPublic(new Date().toISOString());
}

export async function listAdminHeroSlidesLive(request: Request) {
  await nativeAdminAuth.requireIdentity(request);
  return d1HeroRepository.listAdmin();
}

export async function createHeroSlideLive(
  request: Request,
  input: { slide: Omit<HeroSlide, "id" | "order" | "version">; csrfToken: string },
) {
  await requireAdminCsrf(request, input.csrfToken);
  requireImage(input.slide.imageRef);
  const parsed = heroSlideSchema.parse({ ...input.slide, id: "validation", order: 0, version: 1 });
  const { id: _id, order: _order, version: _version, ...draft } = parsed;
  return d1HeroRepository.create(draft);
}

export async function updateHeroSlideLive(
  request: Request,
  input: {
    id: string;
    expectedVersion: number;
    slide: Omit<HeroSlide, "id" | "order" | "version">;
    csrfToken: string;
  },
) {
  await requireAdminCsrf(request, input.csrfToken);
  requireImage(input.slide.imageRef);
  const parsed = heroSlideSchema.parse({
    ...input.slide,
    id: input.id,
    order: 0,
    version: input.expectedVersion,
  });
  const { id: _id, order: _order, version: _version, ...draft } = parsed;
  return d1HeroRepository.update(input.id, input.expectedVersion, draft);
}

export async function deleteHeroSlideLive(
  request: Request,
  input: { id: string; expectedVersion: number; csrfToken: string },
) {
  await requireAdminCsrf(request, input.csrfToken);
  await d1HeroRepository.delete(input.id, input.expectedVersion);
  return d1HeroRepository.listAdmin();
}

export async function saveHeroOrderLive(
  request: Request,
  input: {
    items: Array<{ id: string; order: number; expectedVersion: number }>;
    csrfToken: string;
  },
) {
  await requireAdminCsrf(request, input.csrfToken);
  return d1HeroRepository.saveOrder(input.items);
}
