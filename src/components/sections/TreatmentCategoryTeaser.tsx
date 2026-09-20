import { Link } from "@tanstack/react-router";
import { EditorialArrow } from "@/components/EditorialArrow";
import { RevealDivider } from "@/components/RevealDivider";
import { treatmentCategories } from "@/data/treatments";

export function TreatmentCategoryTeaser() {
  return (
    <section
      id="trattamenti"
      aria-labelledby="treatment-teaser-heading"
      className="scroll-mt-[calc(var(--header-height)+24px)] border-y border-line bg-surface py-12 md:py-16"
    >
      <div className="container-editorial">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="eyebrow" data-reveal>
              Trattamenti
            </p>
            <h2
              id="treatment-teaser-heading"
              className="mt-5 max-w-lg font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.98] text-ink"
              data-reveal
              style={{ ["--reveal-delay" as string]: "60ms" }}
            >
              Quattro aree di <span className="italic text-accent">cura.</span>
            </h2>
            <p
              className="mt-6 max-w-md leading-relaxed text-muted-on-surface"
              data-reveal
              style={{ ["--reveal-delay" as string]: "120ms" }}
            >
              Scegli l’area che ti interessa e consulta servizi, indicazioni e prezzi nel catalogo
              completo.
            </p>
          </div>

          <div className="md:col-span-7">
            <div className="relative">
              <RevealDivider className="inset-x-0 -top-px h-px bg-line" />
              <ol className="grid grid-cols-2 border-t border-transparent">
                {treatmentCategories.map((category, index) => (
                  <li
                    key={category.id}
                    className="relative border-b border-transparent odd:border-r odd:pr-4 even:pl-4 md:odd:pr-7 md:even:pl-7"
                  >
                    <Link
                      to="/trattamenti"
                      search={{ categoria: category.id }}
                      data-reveal
                      style={{ ["--reveal-delay" as string]: `${index * 45}ms` }}
                      className="interactive-row group flex min-h-28 items-start justify-between gap-3 py-5 sm:min-h-32 sm:gap-5 sm:py-6"
                    >
                      <span className="min-w-0">
                        <span className="eyebrow text-accent">{category.index}</span>
                        <span className="mt-3 block font-display text-xl leading-tight text-ink transition-colors duration-[var(--motion-duration-ui)] group-hover:text-accent group-focus-visible:text-accent sm:text-2xl md:text-3xl">
                          {category.name}
                        </span>
                        <span className="mt-2 hidden max-w-sm text-sm leading-relaxed text-muted-on-surface sm:block">
                          {category.introduction}
                        </span>
                      </span>
                      <EditorialArrow className="mt-1" />
                    </Link>
                    <RevealDivider className="inset-x-0 -bottom-px h-px bg-line" />
                    {index % 2 === 0 && (
                      <RevealDivider className="inset-y-0 -right-px w-px bg-line" />
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex justify-center pt-6 md:pt-7">
              <Link
                to="/trattamenti"
                search={{}}
                className="editorial-link group min-h-11 justify-center px-1 text-sm font-medium"
              >
                Scopri tutti i trattamenti
                <EditorialArrow />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
