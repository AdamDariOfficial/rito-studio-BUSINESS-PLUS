import { useEffect, useMemo, useRef } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { PageIntro } from "@/components/PageIntro";
import { SiteShell } from "@/components/SiteShell";
import { TreatmentDetailDialog } from "@/components/TreatmentDetailDialog";
import { TreatmentRows } from "@/components/TreatmentRows";
import {
  getTreatment,
  servicesNote,
  treatmentCategories,
  treatments,
  type TreatmentCategoryId,
} from "@/data/treatments";
import { buildHead, routeSeo } from "@/lib/seo";
import { prefersReducedMotion } from "@/lib/scroll-to-anchor";
import { cn } from "@/lib/utils";
import { useHorizontalScrollEdges } from "@/hooks/use-horizontal-scroll-edges";

const validCategories = new Set(treatmentCategories.map((category) => category.id));

type TreatmentsSearch = {
  categoria?: string;
  trattamento?: string;
};

export const Route = createFileRoute("/trattamenti/")({
  validateSearch: (search: Record<string, unknown>): TreatmentsSearch => ({
    categoria: typeof search.categoria === "string" ? search.categoria : undefined,
    trattamento: typeof search.trattamento === "string" ? search.trattamento : undefined,
  }),
  head: () => buildHead(routeSeo.treatments),
  component: TreatmentsPage,
});

function TreatmentsPage() {
  const searchString = useRouterState({ select: (state) => state.location.searchStr });
  const { categoria, trattamento } = useMemo(() => {
    const search = new URLSearchParams(searchString);
    return {
      categoria: search.get("categoria") ?? undefined,
      trattamento: search.get("trattamento") ?? undefined,
    };
  }, [searchString]);
  const navigate = Route.useNavigate();
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const filterRailRef = useRef<HTMLElement>(null);
  const activeFilterRef = useRef<HTMLAnchorElement>(null);
  const filterEdges = useHorizontalScrollEdges(filterRailRef);
  const invalidFilter = Boolean(
    categoria && !validCategories.has(categoria as TreatmentCategoryId),
  );
  const selected = invalidFilter ? undefined : (categoria as TreatmentCategoryId | undefined);
  const visible = selected ? treatments.filter((item) => item.category === selected) : treatments;
  const requestedTreatment = trattamento ? getTreatment(trattamento) : undefined;
  const invalidTreatment = Boolean(trattamento && !requestedTreatment);
  const treatmentOutsideFilter = Boolean(
    requestedTreatment && (invalidFilter || (selected && requestedTreatment.category !== selected)),
  );
  const activeTreatment = treatmentOutsideFilter ? undefined : requestedTreatment;
  const dialogSequence = selected ? visible : treatments;
  const recommendations = activeTreatment
    ? treatments
        .filter(
          (item) =>
            item.category === activeTreatment.category && item.slug !== activeTreatment.slug,
        )
        .slice(0, 3)
    : [];

  useEffect(() => {
    const rail = filterRailRef.current;
    const active = activeFilterRef.current;
    if (!rail || !active) return;

    const frame = window.requestAnimationFrame(() => {
      const inset = 12;
      const itemLeft = active.offsetLeft;
      const itemRight = itemLeft + active.offsetWidth;
      const visibleLeft = rail.scrollLeft + inset;
      const visibleRight = rail.scrollLeft + rail.clientWidth - inset;
      let nextScrollLeft = rail.scrollLeft;

      if (itemLeft < visibleLeft) nextScrollLeft = Math.max(0, itemLeft - inset);
      if (itemRight > visibleRight) {
        nextScrollLeft = itemRight - rail.clientWidth + inset;
      }

      if (Math.abs(nextScrollLeft - rail.scrollLeft) > 1) {
        rail.scrollTo({
          left: nextScrollLeft,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [invalidFilter, selected]);

  function closeTreatment(replace = true) {
    void navigate({
      search: (previous) => ({ ...previous, trattamento: undefined }),
      replace,
      resetScroll: false,
    });
  }

  return (
    <SiteShell>
      <PageIntro
        eyebrow="Catalogo"
        title={
          <>
            La cura, <span className="italic text-accent">su misura.</span>
          </>
        }
        intro="Esplora i rituali per area, prezzo indicativo ed esigenza. Ogni scheda raccoglie le informazioni disponibili."
      />

      <section className="py-16 md:py-24" aria-labelledby="catalogo-heading">
        <div className="container-editorial">
          <h2 id="catalogo-heading" className="sr-only">
            Catalogo dei trattamenti
          </h2>
          <div className="relative min-w-0">
            <nav
              ref={filterRailRef}
              aria-label="Filtra per categoria"
              className="scrollbar-none -mx-1 flex min-w-0 flex-nowrap gap-x-6 overflow-x-auto overflow-y-hidden overscroll-x-contain border-b border-line px-1 py-1"
            >
              <Link
                ref={!selected && !invalidFilter ? activeFilterRef : undefined}
                to="/trattamenti"
                search={{}}
                activeOptions={{ exact: true, includeSearch: true }}
                resetScroll={false}
                aria-current={!selected && !invalidFilter ? "page" : undefined}
                className={cn(
                  "interactive-control min-h-12 shrink-0 whitespace-nowrap border-b-2 px-1 py-3 text-sm",
                  !selected && !invalidFilter
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-ink",
                )}
              >
                Tutti
              </Link>
              {treatmentCategories.map((category) => (
                <Link
                  ref={selected === category.id ? activeFilterRef : undefined}
                  key={category.id}
                  to="/trattamenti"
                  search={{ categoria: category.id }}
                  activeOptions={{ exact: true, includeSearch: true }}
                  resetScroll={false}
                  aria-current={selected === category.id ? "page" : undefined}
                  className={cn(
                    "interactive-control min-h-12 shrink-0 whitespace-nowrap border-b-2 px-1 py-3 text-sm",
                    selected === category.id
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:text-ink",
                  )}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-1 left-0 w-10 bg-gradient-to-r from-canvas via-canvas/90 to-transparent transition-opacity duration-[var(--motion-duration-fast)] motion-reduce:transition-none",
                filterEdges.canScrollLeft ? "opacity-100" : "opacity-0",
              )}
            />
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-1 right-0 w-10 bg-gradient-to-l from-canvas via-canvas/90 to-transparent transition-opacity duration-[var(--motion-duration-fast)] motion-reduce:transition-none",
                filterEdges.canScrollRight ? "opacity-100" : "opacity-0",
              )}
            />
          </div>

          {invalidFilter ? (
            <div className="my-8 border border-line bg-surface p-5" role="status">
              <p className="font-medium text-ink">Il filtro “{categoria}” non è disponibile.</p>
              <Link
                to="/trattamenti"
                search={{}}
                className="mt-3 inline-flex min-h-11 items-center text-sm text-ink underline underline-offset-4"
              >
                Mostra tutti i trattamenti
              </Link>
            </div>
          ) : null}

          {invalidTreatment || treatmentOutsideFilter ? (
            <div className="my-8 border border-line bg-surface p-5" role="status">
              <p className="font-medium text-ink">
                {invalidTreatment
                  ? `Il trattamento “${trattamento}” non è disponibile.`
                  : "Il trattamento selezionato non appartiene a questa categoria."}
              </p>
              <button
                type="button"
                onClick={() => closeTreatment()}
                className="editorial-link mt-3 min-h-11 text-sm font-medium"
              >
                Continua con il catalogo
              </button>
            </div>
          ) : null}

          <div className="mt-10">
            <TreatmentRows
              items={invalidFilter ? [] : visible}
              emptyMessage="Scegli una categoria disponibile oppure torna al catalogo completo."
              onSelect={(treatmentItem, trigger) => {
                openerRef.current = trigger;
                void navigate({
                  search: (previous) => ({
                    ...previous,
                    trattamento: treatmentItem.slug,
                  }),
                  resetScroll: false,
                });
              }}
            />
          </div>
          <p className="mt-8 max-w-2xl text-xs italic leading-relaxed text-muted">{servicesNote}</p>
        </div>
      </section>

      <TreatmentDetailDialog
        treatment={activeTreatment}
        sequence={dialogSequence}
        recommendations={recommendations}
        open={Boolean(activeTreatment)}
        onOpenChange={(open) => {
          if (!open) closeTreatment();
        }}
        onNavigate={(nextTreatment) => {
          void navigate({
            search: (previous) => ({
              ...previous,
              trattamento: nextTreatment.slug,
            }),
            replace: true,
            resetScroll: false,
          });
        }}
        returnFocusRef={openerRef}
      />
    </SiteShell>
  );
}
