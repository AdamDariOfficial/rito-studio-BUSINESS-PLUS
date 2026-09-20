import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { EditorialArrow } from "@/components/EditorialArrow";
import { Link } from "@tanstack/react-router";

export function StudioEditorial() {
  return (
    <section
      id="studio"
      aria-labelledby="studio-heading"
      className="scroll-mt-[calc(var(--header-height)+24px)] border-y border-line bg-surface py-12 md:py-16"
    >
      <div className="container-editorial">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <p className="eyebrow" data-reveal>
              Lo spazio
            </p>
            <h2
              id="studio-heading"
              className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3.5rem)] leading-[1.05] text-ink"
              data-reveal
              style={{ ["--reveal-delay" as string]: "80ms" }}
            >
              Uno spazio per <span className="italic">il gesto.</span>
            </h2>
            <p
              className="mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg"
              data-reveal
              style={{ ["--reveal-delay" as string]: "140ms" }}
            >
              Luce morbida, materiali naturali e postazioni essenziali. Lo studio lascia spazio alla
              relazione, al lavoro e al tempo personale.
            </p>
            <Link to="/studio" className="editorial-link group mt-7 min-h-11 text-sm font-medium">
              Conosci lo studio
              <EditorialArrow />
            </Link>
          </div>
          <div className="md:col-span-7" data-reveal>
            <ImagePlaceholder
              ratio="16 / 10"
              tone="canvas"
              className="border border-line"
              src="/images/rito/rito-studio-wide.webp"
              alt="Interno luminoso di uno studio beauty con postazioni e specchi"
              sizes="(min-width: 768px) 58vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
