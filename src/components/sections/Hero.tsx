import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroSlideVisual } from "@/components/sections/HeroSlideVisual";
import { getConsultationProfile } from "@/features/consultation/config";
import { listDemoHeroSlides, subscribeDemoHeroSlides } from "@/features/hero/demo-store";
import { listPublicHeroSlides } from "@/features/hero/hero.functions";
import { isHeroSlideActive, type HeroSlide } from "@/features/hero/model";
import { seedHeroSlides } from "@/features/hero/seed";

const SWIPE_THRESHOLD = 52;

export function Hero() {
  const profile = getConsultationProfile();
  const [slides, setSlides] = useState<HeroSlide[]>(() =>
    profile === "demo" ? listDemoHeroSlides() : seedHeroSlides,
  );
  const [index, setIndex] = useState(0);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (profile === "demo") {
      const sync = () => setSlides(listDemoHeroSlides());
      sync();
      return subscribeDemoHeroSlides(sync);
    }

    let cancelled = false;
    void listPublicHeroSlides()
      .then((next) => {
        if (!cancelled) setSlides(next);
      })
      .catch(() => {
        if (!cancelled) setSlides([]);
      });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const activeSlides = useMemo(
    () => slides.filter((slide) => isHeroSlideActive(slide)).sort((a, b) => a.order - b.order),
    [slides],
  );

  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(0, activeSlides.length - 1)));
  }, [activeSlides.length]);

  if (activeSlides.length === 0) {
    return (
      <section
        aria-label="Hero non configurata"
        className="min-h-[calc(100svh-var(--header-height))] bg-ink md:min-h-[calc(100dvh-var(--header-height))]"
      />
    );
  }

  if (activeSlides.length === 1) {
    return <HeroSlideVisual slide={activeSlides[0]} />;
  }

  const go = (direction: -1 | 1) => {
    setIndex((current) => (current + direction + activeSlides.length) % activeSlides.length);
  };

  return (
    <section
      aria-roledescription="carosello"
      aria-label="In evidenza RITO Studio"
      className="relative isolate min-h-[calc(100svh-var(--header-height))] overflow-hidden bg-ink md:min-h-[calc(100dvh-var(--header-height))]"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        pointerStart.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const start = pointerStart.current;
        pointerStart.current = null;
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy) * 1.15) return;
        go(dx < 0 ? 1 : -1);
      }}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
    >
      <div
        className="flex min-h-[inherit] w-full touch-pan-y transition-transform duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `translate3d(-${index * 100}%,0,0)` }}
      >
        {activeSlides.map((slide, slideIndex) => {
          const active = slideIndex === index;
          return (
            <div
              key={slide.id}
              className="min-h-[inherit] w-full shrink-0"
              aria-hidden={active ? undefined : true}
              inert={!active}
            >
              <HeroSlideVisual
                slide={slide}
                interactive={active}
                positionLabel={`${String(slideIndex + 1).padStart(2, "0")} / ${String(activeSlides.length).padStart(2, "0")}`}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        className="absolute left-5 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none xl:inline-flex"
        aria-label="Schermata precedente"
      >
        <ChevronLeft aria-hidden size={20} />
      </button>

      <button
        type="button"
        onClick={() => go(1)}
        className="absolute right-5 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none xl:inline-flex"
        aria-label="Schermata successiva"
      >
        <ChevronRight aria-hidden size={20} />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/25 bg-black/40 p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.2)] backdrop-blur-md">
          <button
            type="button"
            onClick={() => go(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white xl:hidden"
            aria-label="Schermata precedente"
          >
            <ChevronLeft aria-hidden size={19} />
          </button>
          <div className="flex min-w-[5.5rem] items-center justify-center gap-2 px-1">
            {activeSlides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(slideIndex)}
                aria-label={`Vai alla schermata ${slideIndex + 1}`}
                aria-current={slideIndex === index ? "true" : undefined}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                  slideIndex === index ? "w-8 bg-[#d9a8b6]" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white xl:hidden"
            aria-label="Schermata successiva"
          >
            <ChevronRight aria-hidden size={19} />
          </button>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        Schermata {index + 1} di {activeSlides.length}
      </span>
    </section>
  );
}
