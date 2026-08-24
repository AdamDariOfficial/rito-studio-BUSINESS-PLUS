import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EditorialArrow } from "@/components/EditorialArrow";
import { ctaLabels } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const heroSlides = [
  {
    src: "/images/rito/rito-hero-main.webp",
    alt: "Professionista durante un trattamento viso in atelier",
    objectPosition: "57% 45%",
  },
  {
    src: "/images/rito/rito-studio-wide.webp",
    alt: "Interno luminoso di RITO Studio con postazioni e specchi",
    objectPosition: "50% 50%",
  },
  {
    src: "/images/rito/rito-gallery-hair-01.webp",
    alt: "Dettaglio di capelli biondi mossi durante lo styling",
    objectPosition: "50% 42%",
  },
] as const;

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  function move(direction: -1 | 1) {
    setActiveSlide((current) => (current + direction + heroSlides.length) % heroSlides.length);
  }

  return (
    <section
      data-rito-hero-commerce-carousel
      aria-label="Introduzione"
      aria-roledescription="carousel"
      className="relative isolate min-h-[100svh] overflow-hidden bg-ink pt-[var(--header-height)] text-white"
    >
      <div className="absolute inset-x-0 bottom-0 top-[var(--header-height)] -z-20 bg-ink">
        {heroSlides.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={index === activeSlide ? slide.alt : ""}
            aria-hidden={index !== activeSlide}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            sizes="100vw"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[var(--motion-ease-ui)] motion-reduce:transition-none",
              index === activeSlide
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-[1.015] opacity-0",
            )}
            style={{ objectPosition: slide.objectPosition }}
          />
        ))}
      </div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 top-[var(--header-height)] -z-10 bg-[linear-gradient(90deg,rgba(27,26,24,0.88)_0%,rgba(27,26,24,0.68)_34%,rgba(27,26,24,0.24)_68%,rgba(27,26,24,0.38)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 top-[var(--header-height)] -z-10 bg-[linear-gradient(0deg,rgba(27,26,24,0.72)_0%,transparent_42%,rgba(27,26,24,0.12)_100%)]"
      />

      <div className="container-editorial relative flex min-h-[calc(100svh-var(--header-height))] items-end pb-24 pt-16 sm:pb-28 md:items-center md:pb-20 md:pt-20">
        <div className="max-w-[44rem]">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-white/72">
            Beauty &amp; Care Atelier · Padova
          </p>

          <h1 className="mt-4 font-display text-[clamp(3.25rem,15vw,5.25rem)] leading-[0.9] tracking-[-0.025em] text-white md:mt-6 md:text-[clamp(4.75rem,8vw,7.75rem)] md:leading-[0.9]">
            La bellezza,
            <br />
            <span className="italic text-[#d8a9b4]">nel suo ritmo.</span>
          </h1>

          <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-white/78 md:mt-7 md:text-lg">
            Un atelier contemporaneo dedicato a capelli, pelle e benessere. Trattamenti su misura,
            gesti precisi e il tempo necessario per ascoltarti.
          </p>

          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:mt-9">
            <Link
              to="/consulenza"
              aria-label={ctaLabels.startConsultation}
              className="interactive-control inline-flex min-h-12 items-center justify-center border border-white bg-white px-6 text-sm font-medium tracking-wide text-ink hover:bg-white/90"
            >
              {ctaLabels.startConsultation}
            </Link>
            <Link
              to="/trattamenti"
              className="editorial-link group min-h-12 justify-center px-2 text-sm font-medium tracking-wide text-white after:bg-white hover:text-white"
            >
              {ctaLabels.discoverTreatments}
              <EditorialArrow />
            </Link>
          </div>
        </div>

        <div
          data-rito-hero-counter
          className="absolute bottom-7 left-5 flex items-center gap-3 text-[0.6875rem] font-medium tabular-nums tracking-[0.12em] text-white/72 sm:left-6 md:bottom-8 md:left-8"
          aria-live="polite"
        >
          <span>{String(activeSlide + 1).padStart(2, "0")}</span>
          <span aria-hidden className="h-px w-8 bg-white/45" />
          <span>{String(heroSlides.length).padStart(2, "0")}</span>
        </div>
      </div>

      <div
        data-rito-hero-side-nav
        className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between px-3 sm:px-5 md:px-7"
      >
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Immagine hero precedente"
          className="interactive-control pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/55 bg-ink/30 text-white backdrop-blur-sm hover:border-white hover:bg-ink/55"
        >
          <ChevronLeft aria-hidden size={20} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Immagine hero successiva"
          className="interactive-control pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/55 bg-ink/30 text-white backdrop-blur-sm hover:border-white hover:bg-ink/55"
        >
          <ChevronRight aria-hidden size={20} strokeWidth={1.6} />
        </button>
      </div>
    </section>
  );
}
