import assert from "node:assert/strict";
import {
  getHeroImageOption,
  heroSlideSchema,
  isHeroSlideActive,
} from "../../src/features/hero/model.ts";
import { seedHeroSlides } from "../../src/features/hero/seed.ts";

assert.equal(seedHeroSlides.length, 3);
assert.ok(seedHeroSlides.every((slide) => heroSlideSchema.safeParse(slide).success));
assert.ok(seedHeroSlides.every((slide) => getHeroImageOption(slide.imageRef)));
assert.ok(
  seedHeroSlides.every(
    (slide) => !slide.mobileImageRef || Boolean(getHeroImageOption(slide.mobileImageRef)),
  ),
);
assert.ok(
  seedHeroSlides.every((slide) => isHeroSlideActive(slide, new Date("2026-09-21T10:00:00.000Z"))),
);
assert.equal(
  heroSlideSchema.safeParse({ ...seedHeroSlides[0], imageRef: "https://example.com/image.jpg" })
    .success,
  false,
  "desktop hero images must stay inside the approved RITO asset allowlist",
);
assert.equal(
  heroSlideSchema.safeParse({
    ...seedHeroSlides[0],
    mobileImageRef: "https://example.com/mobile.jpg",
  }).success,
  false,
  "mobile hero images must stay inside the approved RITO asset allowlist",
);
const legacyWithoutMobile = { ...seedHeroSlides[1] } as Record<string, unknown>;
delete legacyWithoutMobile.mobileImageRef;
delete legacyWithoutMobile.mobileImageAlt;
const legacyParsed = heroSlideSchema.parse(legacyWithoutMobile);
assert.equal(legacyParsed.mobileImageRef, "");
assert.equal(legacyParsed.mobileImageAlt, "");
assert.equal(
  heroSlideSchema.safeParse({ ...seedHeroSlides[0], status: "published", startsAt: "" }).success,
  false,
  "published slides require a start time",
);
assert.equal(
  isHeroSlideActive(
    { ...seedHeroSlides[0], endsAt: "2026-01-01T00:00:00.000Z" },
    new Date("2026-09-21T10:00:00.000Z"),
  ),
  false,
);

console.log("RITO hero model/seed contract: PASS");
