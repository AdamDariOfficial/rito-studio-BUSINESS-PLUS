import { heroSlideListSchema, heroSlideSchema, type HeroSlide } from "./model";
import { seedHeroSlides } from "./seed";

const HERO_KEY = "rito-business-plus:hero-slides:v1";
const HERO_CHANGE_EVENT = "rito-business-plus:hero-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function cloneSeed() {
  return seedHeroSlides.map((slide) => ({
    ...slide,
    primaryCta: { ...slide.primaryCta },
    secondaryCta: slide.secondaryCta ? { ...slide.secondaryCta } : null,
  }));
}

function write(slides: HeroSlide[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(HERO_KEY, JSON.stringify(slides));
  window.dispatchEvent(new Event(HERO_CHANGE_EVENT));
}

function read() {
  if (!isBrowser()) return cloneSeed();
  const raw = window.localStorage.getItem(HERO_KEY);
  if (!raw) {
    const seed = cloneSeed();
    write(seed);
    return seed;
  }
  try {
    return heroSlideListSchema.parse(JSON.parse(raw));
  } catch {
    const seed = cloneSeed();
    write(seed);
    return seed;
  }
}

function requirePublished(slides: HeroSlide[]) {
  if (!slides.some((slide) => slide.status === "published")) {
    throw new Error("La hero deve mantenere almeno una schermata pubblicata.");
  }
}

export function listDemoHeroSlides() {
  return [...read()].sort((a, b) => a.order - b.order);
}

export function createDemoHeroSlide(input: Omit<HeroSlide, "id" | "order" | "version">) {
  const current = listDemoHeroSlides();
  if (current.length >= 5) throw new Error("Puoi gestire al massimo 5 schermate hero.");
  const slide = heroSlideSchema.parse({
    ...input,
    id: crypto.randomUUID(),
    order: current.length,
    version: 1,
  });
  write([...current, slide]);
  return slide;
}

export function updateDemoHeroSlide(
  id: string,
  input: Omit<HeroSlide, "id" | "order" | "version">,
) {
  const current = listDemoHeroSlides();
  const existing = current.find((slide) => slide.id === id);
  if (!existing) throw new Error("Schermata hero non trovata.");
  const nextSlide = heroSlideSchema.parse({
    ...input,
    id,
    order: existing.order,
    version: existing.version + 1,
  });
  const next = current.map((slide) => (slide.id === id ? nextSlide : slide));
  requirePublished(next);
  write(next);
  return nextSlide;
}

export function deleteDemoHeroSlide(id: string) {
  const current = listDemoHeroSlides();
  const next = current.filter((slide) => slide.id !== id);
  if (next.length === current.length) throw new Error("Schermata hero non trovata.");
  requirePublished(next);
  write(
    next.map((slide, order) => ({
      ...slide,
      order,
      version: slide.version + (slide.order === order ? 0 : 1),
    })),
  );
}

export function saveDemoHeroOrder(ids: string[]) {
  const current = listDemoHeroSlides();
  if (ids.length !== current.length || new Set(ids).size !== current.length) {
    throw new Error("Ordine hero non valido.");
  }
  const byId = new Map(current.map((slide) => [slide.id, slide]));
  const next = ids.map((id, order) => {
    const slide = byId.get(id);
    if (!slide) throw new Error("Ordine hero non valido.");
    return { ...slide, order, version: slide.version + (slide.order === order ? 0 : 1) };
  });
  write(next);
  return next;
}

export function subscribeDemoHeroSlides(callback: () => void) {
  if (!isBrowser()) return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === HERO_KEY) callback();
  };
  const onChange = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener(HERO_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HERO_CHANGE_EVENT, onChange);
  };
}
