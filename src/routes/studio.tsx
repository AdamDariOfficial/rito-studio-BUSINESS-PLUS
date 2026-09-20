import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { EditorialArrow } from "@/components/EditorialArrow";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { RevealDivider } from "@/components/RevealDivider";
import { SiteShell } from "@/components/SiteShell";
import { buildHead, routeSeo } from "@/lib/seo";
import { ctaLabels, site } from "@/lib/site-config";

export const Route = createFileRoute("/studio")({
  head: () => buildHead(routeSeo.studio),
  component: StudioPage,
});

const studioPrinciples = [
  {
    index: "01",
    title: "Ambiente",
    body: "Luce, ordine e calma per lasciare spazio alla relazione.",
  },
  {
    index: "02",
    title: "Materiali",
    body: "Prodotti e strumenti scelti con criterio, senza eccessi.",
  },
  {
    index: "03",
    title: "Cura",
    body: "Igiene, preparazione e attenzione al dettaglio in ogni gesto.",
  },
] as const;

function StudioPage() {
  return (
    <SiteShell>
      <section
        aria-labelledby="studio-page-heading"
        className="border-b border-line pb-10 pt-[calc(var(--header-height)+2rem)] md:pb-12 md:pt-[calc(var(--header-height)+3rem)]"
      >
        <div className="container-editorial grid items-center gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5" data-reveal>
            <p className="eyebrow">Lo studio</p>
            <h1
              id="studio-page-heading"
              className="mt-4 max-w-lg font-display text-[clamp(2.8rem,6vw,5rem)] leading-[0.96] tracking-[-0.02em] text-ink"
            >
              Uno spazio <span className="italic text-accent">per te.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
              Uno spazio essenziale, luminoso e ordinato, pensato per lavorare con calma e farti
              sentire a tuo agio.
            </p>
          </div>

          <div
            className="md:col-span-7"
            data-reveal
            style={{ ["--reveal-delay" as string]: "80ms" }}
          >
            <ImagePlaceholder
              ratio="16 / 9"
              src="/images/rito/rito-studio-wide.webp"
              alt="Interno luminoso di uno studio beauty con postazioni e specchi"
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 768px) 58vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-ink py-10 md:py-12" aria-labelledby="studio-principles-heading">
        <div className="container-editorial">
          <p className="eyebrow text-surface" data-reveal>
            Dentro RITO
          </p>
          <h2
            id="studio-principles-heading"
            className="mt-3 max-w-2xl font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1] text-white"
            data-reveal
          >
            Essenziale, con <span className="italic">intenzione.</span>
          </h2>

          <ol
            className="relative mt-7 border-t border-transparent lg:grid lg:grid-cols-3 lg:border-t-0 lg:gap-8"
            aria-label="I tre elementi dello studio"
          >
            <RevealDivider className="inset-x-0 -top-px h-px bg-white/20 lg:hidden" />
            {studioPrinciples.map((item, index) => (
              <li
                key={item.title}
                className="relative grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-x-4 gap-y-2 border-b border-transparent py-5 lg:block lg:border-b-0 lg:py-1"
                style={{ ["--reveal-delay" as string]: `${120 + index * 50}ms` }}
              >
                <span className="font-display text-xl leading-none text-surface" data-reveal>
                  {item.index}
                </span>
                <h3
                  className="font-display text-xl leading-tight text-white lg:mt-3 lg:text-2xl"
                  data-reveal
                >
                  {item.title}
                </h3>
                <p
                  className="col-start-2 max-w-sm text-sm leading-relaxed text-surface lg:mt-3"
                  data-reveal
                >
                  {item.body}
                </p>
                <RevealDivider className="inset-x-0 -bottom-px h-px bg-white/20 lg:hidden" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-label="Informazioni prima della visita"
        className="border-t border-line py-8 md:py-10"
      >
        <div className="container-editorial grid gap-6 md:grid-cols-12 md:items-center md:gap-8">
          <div className="md:col-span-7" data-reveal>
            <a
              href={site.contact.mapExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-link group min-h-11 text-sm font-medium"
            >
              {site.contact.locationLabel}
              <EditorialArrow />
            </a>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted">
              Per esigenze di accesso specifiche, contatta lo studio prima della visita.
            </p>
          </div>

          <div
            className="flex flex-col items-start gap-4 sm:flex-row sm:items-center md:col-span-5 md:justify-end"
            data-reveal
            style={{ ["--reveal-delay" as string]: "80ms" }}
          >
            <Link
              to="/consulenza"
              aria-label={ctaLabels.startConsultation}
              className="action-primary inline-flex min-h-12 w-full items-center justify-center gap-2 border border-ink bg-ink px-6 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong sm:w-auto"
            >
              <MessageCircle aria-hidden size={16} strokeWidth={1.7} />
              {ctaLabels.startConsultation}
            </Link>
            <Link to="/contatti" className="editorial-link group min-h-11 text-sm font-medium">
              Informazioni pratiche
              <EditorialArrow />
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
