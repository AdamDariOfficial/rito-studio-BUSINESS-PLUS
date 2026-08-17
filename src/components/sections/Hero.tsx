import { Link } from "@tanstack/react-router";
import { EditorialArrow } from "@/components/EditorialArrow";
import { ctaLabels } from "@/lib/site-config";
import { useReveal } from "@/hooks/use-reveal";

export function Hero() {
  const imageRef = useReveal<HTMLDivElement>();

  return (
    <section
      aria-label="Introduzione"
      className="relative overflow-hidden pt-[var(--header-height)] md:min-h-[100svh]"
    >
      <div className="container-editorial md:flex md:min-h-[calc(100svh-var(--header-height))] md:items-center md:py-12">
        <div className="grid w-full md:grid-cols-12 md:items-center md:gap-8">
          <div className="order-1 -mx-5 md:order-2 md:col-span-5 md:mx-0">
            <div
              ref={imageRef}
              data-reveal
              className="hero-image relative overflow-hidden bg-surface"
              style={{ ["--reveal-delay" as string]: "120ms" }}
            >
              <img
                src="/images/rito/rito-hero-main.webp"
                alt="Professionista durante un trattamento viso in atelier"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 42vw, 100vw"
                className="h-[58svh] min-h-[460px] w-full object-cover object-[57%_45%] md:h-[calc(100svh-var(--header-height)-6rem)] md:min-h-[32rem] md:max-h-[47rem] md:object-center"
              />
            </div>
          </div>

          <div className="relative z-10 order-2 -mt-20 border-t-2 border-accent bg-canvas px-6 py-7 shadow-[0_20px_50px_rgba(27,26,24,0.12)] md:order-1 md:col-span-7 md:mt-0 md:border-0 md:bg-transparent md:p-0 md:pr-6 md:shadow-none">
            <p className="eyebrow" data-reveal style={{ ["--reveal-delay" as string]: "0ms" }}>
              Beauty &amp; Care Atelier · Padova
            </p>

            <h1
              className="mt-5 font-display text-[clamp(3.2rem,14vw,4.6rem)] leading-[0.9] tracking-[-0.02em] text-ink md:mt-8 md:text-[clamp(2.75rem,8vw,6.5rem)] md:leading-[0.98] md:tracking-[-0.015em]"
              data-reveal
              style={{ ["--reveal-delay" as string]: "80ms" }}
            >
              La bellezza,
              <br />
              <span className="italic text-accent">nel suo ritmo.</span>
            </h1>

            <p
              className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-muted md:mt-8 md:text-lg"
              data-reveal
              style={{ ["--reveal-delay" as string]: "160ms" }}
            >
              Un atelier contemporaneo dedicato a capelli, pelle e benessere. Trattamenti su misura,
              gesti precisi e il tempo necessario per ascoltarti.
            </p>

            <div className="mt-7 flex flex-col items-stretch gap-4 lg:mt-10 lg:flex-row lg:items-center">
              <Link
                to="/consulenza"
                aria-label={ctaLabels.startConsultation}
                data-reveal
                style={{ ["--reveal-delay" as string]: "220ms" }}
                className="action-primary inline-flex min-h-12 items-center justify-center border border-ink bg-ink px-6 text-sm font-medium tracking-wide text-white hover:border-accent-strong hover:bg-accent-strong"
              >
                {ctaLabels.startConsultation}
              </Link>
              <Link
                to="/trattamenti"
                data-reveal
                style={{ ["--reveal-delay" as string]: "300ms" }}
                className="editorial-link group min-h-11 justify-center px-1 text-sm font-medium tracking-wide md:min-h-12 md:px-2"
              >
                {ctaLabels.discoverTreatments}
                <EditorialArrow />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
