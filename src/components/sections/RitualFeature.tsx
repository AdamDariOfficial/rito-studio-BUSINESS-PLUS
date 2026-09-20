import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { RevealDivider } from "@/components/RevealDivider";

const methodSteps = [
  {
    index: "01",
    title: "Ascolto",
    body: "Una consulenza breve e concreta per capire esigenze, abitudini e aspettative.",
  },
  {
    index: "02",
    title: "Precisione",
    body: "Tecniche, prodotti e tempi scelti in base al servizio, non a un protocollo indistinto.",
  },
  {
    index: "03",
    title: "Continuità",
    body: "Indicazioni semplici per mantenere il risultato e pianificare il prossimo appuntamento.",
  },
] as const;

export function RitualFeature() {
  return (
    <section
      id="metodo"
      aria-labelledby="metodo-heading"
      className="scroll-mt-[calc(var(--header-height)+24px)] bg-canvas py-12 md:py-16"
    >
      <div className="container-editorial">
        <div className="grid gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-6 md:col-start-7 md:row-start-1 md:pt-10">
            <p className="eyebrow" data-reveal>
              Metodo
            </p>
            <h2
              id="metodo-heading"
              className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3.5rem)] leading-[1.05] text-ink"
              data-reveal
              style={{ ["--reveal-delay" as string]: "80ms" }}
            >
              Prima viene <span className="italic">l’ascolto.</span>
            </h2>
            <p
              className="mt-5 max-w-lg text-base leading-relaxed text-muted md:text-lg"
              data-reveal
              style={{ ["--reveal-delay" as string]: "140ms" }}
            >
              Osserviamo, ascoltiamo e definiamo insieme il risultato.
            </p>

            <ol
              className="relative mt-8 max-w-xl border-t border-transparent"
              aria-label="I tre principi del metodo"
            >
              <RevealDivider className="inset-x-0 -top-px h-px bg-line" />
              {methodSteps.map((step, index) => (
                <li
                  key={step.index}
                  className="relative grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-x-4 gap-y-2 border-b border-transparent py-5 md:grid-cols-[3rem_minmax(0,8.5rem)_minmax(0,1fr)] md:items-center md:gap-x-5 md:py-7"
                  style={{ ["--reveal-delay" as string]: `${180 + index * 30}ms` }}
                >
                  <span className="font-display text-xl leading-none text-accent" data-reveal>
                    {step.index}
                  </span>
                  <h3
                    className="font-display text-xl leading-tight text-ink md:text-2xl"
                    data-reveal
                  >
                    {step.title}
                  </h3>
                  <p
                    className="col-start-2 max-w-md text-sm leading-relaxed text-muted md:col-start-auto"
                    data-reveal
                  >
                    {step.body}
                  </p>
                  <RevealDivider className="inset-x-0 -bottom-px h-px bg-line" />
                </li>
              ))}
            </ol>
          </div>

          <div className="md:col-span-5 md:col-start-1 md:row-start-1" data-reveal>
            <ImagePlaceholder
              ratio="3 / 4"
              tone="ink"
              src="/images/rito/rito-ritual-feature.webp"
              alt="Mani di una professionista durante una manicure di precisione"
              sizes="(min-width: 768px) 42vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
