import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Phone, Sparkles, X } from "lucide-react";
import { getCategory, type Treatment } from "@/data/treatments";
import { ctaLabels, site } from "@/lib/site-config";

type DragAxis = "pending" | "horizontal" | "vertical";

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  axis: DragAxis;
}

interface TreatmentDetailDialogProps {
  treatment?: Treatment;
  sequence: readonly Treatment[];
  recommendations: readonly Treatment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (treatment: Treatment) => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

const swipeThreshold = 56;

function arrowKeyBelongsToControl(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        'input, textarea, select, [contenteditable="true"], [role="slider"], [role="spinbutton"]',
      ),
    )
  );
}

export function TreatmentDetailDialog({
  treatment,
  sequence,
  recommendations,
  open,
  onOpenChange,
  onNavigate,
  returnFocusRef,
}: TreatmentDetailDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const currentIndex = treatment ? sequence.findIndex((item) => item.slug === treatment.slug) : -1;
  const canMovePrevious = currentIndex > 0;
  const canMoveNext = currentIndex >= 0 && currentIndex < sequence.length - 1;

  const move = useCallback(
    (nextDirection: -1 | 1) => {
      const next = sequence[currentIndex + nextDirection];
      if (!next) return;
      setDirection(nextDirection);
      onNavigate(next);
    },
    [currentIndex, onNavigate, sequence],
  );

  useEffect(() => {
    if (!open || !treatment) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (arrowKeyBelongsToControl(event.target)) return;

      if (event.key === "ArrowLeft" && canMovePrevious) {
        event.preventDefault();
        move(-1);
      }
      if (event.key === "ArrowRight" && canMoveNext) {
        event.preventDefault();
        move(1);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [canMoveNext, canMovePrevious, move, open, treatment]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!treatment || event.button !== 0) return;
    if (
      event.target instanceof Element &&
      event.target.closest("a, button, input, textarea, select, [contenteditable='true']")
    ) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      axis: "pending",
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (drag.axis === "pending") {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 10) return;
      drag.axis = Math.abs(deltaX) > Math.abs(deltaY) * 1.2 ? "horizontal" : "vertical";
      if (drag.axis === "horizontal") event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (drag.axis !== "horizontal") return;
    event.preventDefault();
    drag.lastX = event.clientX;
  }

  function releasePointerGesture(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  function finishPointerGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const distance = drag.lastX - drag.startX;
    const nextDirection = distance < 0 ? 1 : -1;
    const shouldMove =
      drag.axis === "horizontal" &&
      Math.abs(distance) >= swipeThreshold &&
      (nextDirection === 1 ? canMoveNext : canMovePrevious);

    releasePointerGesture(event);
    if (shouldMove) move(nextDirection);
  }

  function cancelPointerGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    releasePointerGesture(event);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="treatment-dialog-overlay fixed inset-0 z-[80] bg-ink/75" />
        <Dialog.Content
          id="treatment-detail-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            closeRef.current?.focus({ preventScroll: true });
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus({ preventScroll: true });
          }}
          className="treatment-dialog-panel fixed inset-x-0 bottom-0 top-2 z-[81] min-h-0 overflow-hidden border border-line bg-canvas text-ink outline-none md:inset-y-4 md:left-auto md:right-4 md:top-4 md:w-[min(46rem,calc(100vw-2rem))]"
        >
          {treatment ? (
            <div
              key={treatment.slug}
              className="treatment-detail-step grid h-full min-h-0 touch-pan-y grid-rows-[auto_1fr_auto]"
              style={{ ["--treatment-direction" as string]: direction }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishPointerGesture}
              onPointerCancel={cancelPointerGesture}
            >
              <header className="relative z-10 border-b border-line bg-canvas px-5 py-4 sm:px-7 md:px-10 md:py-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="eyebrow truncate text-accent">
                      {getCategory(treatment.category)?.name}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <div className="hidden items-center gap-1 md:flex">
                      <button
                        type="button"
                        onClick={() => move(-1)}
                        disabled={!canMovePrevious}
                        aria-label="Trattamento precedente"
                        className="interactive-control inline-flex h-11 w-11 items-center justify-center border border-line text-ink hover:border-ink hover:bg-surface disabled:opacity-35"
                      >
                        <ChevronLeft aria-hidden size={19} strokeWidth={1.7} />
                      </button>
                      <p
                        className="min-w-14 text-center text-xs tabular-nums text-muted"
                        aria-hidden
                      >
                        {currentIndex + 1} / {sequence.length}
                      </p>
                      <button
                        type="button"
                        onClick={() => move(1)}
                        disabled={!canMoveNext}
                        aria-label="Trattamento successivo"
                        className="interactive-control inline-flex h-11 w-11 items-center justify-center border border-line text-ink hover:border-ink hover:bg-surface disabled:opacity-35"
                      >
                        <ChevronRight aria-hidden size={19} strokeWidth={1.7} />
                      </button>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        ref={closeRef}
                        type="button"
                        aria-label="Chiudi il dettaglio trattamento"
                        className="interactive-control ml-1 inline-flex h-11 w-11 items-center justify-center border border-line bg-canvas text-ink hover:border-ink hover:bg-surface"
                      >
                        <X aria-hidden size={20} strokeWidth={1.7} />
                      </button>
                    </Dialog.Close>
                  </div>
                </div>
                <Dialog.Title asChild>
                  <h2 className="mt-4 max-w-xl font-display text-[clamp(2.2rem,7vw,4.25rem)] leading-[0.95] tracking-[-0.02em] text-ink">
                    {treatment.name}
                  </h2>
                </Dialog.Title>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="eyebrow">Prezzo indicativo</span>
                  <span className="text-sm font-medium tabular-nums text-accent-strong">
                    {treatment.priceLabel}
                  </span>
                </div>
                <p className="sr-only" aria-live="polite" aria-atomic="true">
                  {treatment.name}, {currentIndex + 1} di {sequence.length}
                </p>
              </header>

              <div className="min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-7 sm:px-7 md:px-10 md:pb-10 md:pt-9">
                {treatment.duration ? (
                  <dl className="border-y border-line py-5">
                    <div>
                      <dt className="eyebrow">Durata</dt>
                      <dd className="mt-2 text-sm text-ink">{treatment.duration}</dd>
                    </div>
                  </dl>
                ) : null}

                <Dialog.Description asChild>
                  <p className="mt-7 max-w-2xl font-display text-2xl leading-relaxed text-ink md:text-3xl">
                    {treatment.fullDescription ?? treatment.shortDescription}
                  </p>
                </Dialog.Description>

                {treatment.idealFor ? (
                  <section
                    className="mt-9 border-t border-line pt-7"
                    aria-labelledby="detail-ideal-for"
                  >
                    <h3 id="detail-ideal-for" className="font-display text-2xl text-ink">
                      Ideale per
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                      {treatment.idealFor}
                    </p>
                  </section>
                ) : null}

                {treatment.includes?.length ? (
                  <section
                    className="mt-9 border-t border-line pt-7"
                    aria-labelledby="detail-includes"
                  >
                    <h3 id="detail-includes" className="font-display text-2xl text-ink">
                      Cosa include
                    </h3>
                    <ul className="mt-4 border-t border-line">
                      {treatment.includes.map((item) => (
                        <li key={item} className="border-b border-line py-3 text-sm text-ink">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {treatment.beforeAppointment || treatment.afterAppointment || treatment.notes ? (
                  <section
                    className="mt-9 border-t border-line pt-7"
                    aria-labelledby="detail-guidance"
                  >
                    <h3 id="detail-guidance" className="font-display text-2xl text-ink">
                      Indicazioni
                    </h3>
                    <dl className="mt-5 space-y-6 text-sm leading-relaxed">
                      {treatment.beforeAppointment ? (
                        <div>
                          <dt className="font-medium text-ink">Prima dell’appuntamento</dt>
                          <dd className="mt-2 text-muted">{treatment.beforeAppointment}</dd>
                        </div>
                      ) : null}
                      {treatment.afterAppointment ? (
                        <div>
                          <dt className="font-medium text-ink">Dopo l’appuntamento</dt>
                          <dd className="mt-2 text-muted">{treatment.afterAppointment}</dd>
                        </div>
                      ) : null}
                      {treatment.notes ? (
                        <div>
                          <dt className="font-medium text-ink">Note</dt>
                          <dd className="mt-2 text-muted">{treatment.notes}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </section>
                ) : null}

                {recommendations.length ? (
                  <section
                    className="mt-9 border-t border-line pt-7"
                    aria-labelledby="detail-recommendations"
                  >
                    <h3 id="detail-recommendations" className="font-display text-2xl text-ink">
                      Potrebbero piacerti anche
                    </h3>
                    <ul className="mt-4 border-t border-line">
                      {recommendations.map((item) => (
                        <li key={item.slug} className="border-b border-line">
                          <button
                            type="button"
                            onClick={() => {
                              const targetIndex = sequence.findIndex(
                                (candidate) => candidate.slug === item.slug,
                              );
                              setDirection(targetIndex >= currentIndex ? 1 : -1);
                              onNavigate(item);
                            }}
                            className="interactive-row treatment-row group flex min-h-12 w-full items-center justify-between gap-4 py-3 text-left text-sm text-ink"
                          >
                            <span>{item.name}</span>
                            <ChevronRight
                              aria-hidden
                              size={17}
                              strokeWidth={1.7}
                              className="editorial-arrow"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <section
                  className="mt-10 border-t border-line bg-surface px-5 py-7 sm:px-7"
                  aria-labelledby="detail-booking"
                >
                  <h3 id="detail-booking" className="font-display text-2xl text-ink">
                    Vuoi costruire il tuo percorso?
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-on-surface">
                    Parti da questo trattamento e rispondi a poche domande. Potrai valutare al
                    massimo due servizi complementari prima di inviare la richiesta.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      to="/consulenza"
                      search={{ servizio: treatment.slug }}
                      aria-label={`${ctaLabels.startConsultation}: ${treatment.name}`}
                      className="action-primary inline-flex min-h-12 w-full items-center justify-center gap-2 border border-ink bg-ink px-6 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong sm:w-auto"
                    >
                      <Sparkles aria-hidden size={16} strokeWidth={1.7} />
                      {ctaLabels.startConsultation}
                    </Link>
                    <a
                      href={site.contact.phoneHref}
                      aria-label={`${ctaLabels.callStudio}: ${site.contact.phone}`}
                      className="editorial-link inline-flex min-h-12 items-center gap-2 px-1 text-sm font-medium"
                    >
                      <Phone aria-hidden size={16} strokeWidth={1.7} />
                      {ctaLabels.callStudio}
                    </a>
                  </div>
                </section>
              </div>

              <footer
                data-mobile-treatment-nav
                className="border-t border-line bg-canvas px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden"
              >
                <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3">
                  <button
                    type="button"
                    onClick={() => move(-1)}
                    disabled={!canMovePrevious}
                    aria-label="Trattamento precedente"
                    className="interactive-control inline-flex h-11 w-11 items-center justify-center border border-line text-ink hover:border-ink hover:bg-surface disabled:opacity-35"
                  >
                    <ChevronLeft aria-hidden size={19} strokeWidth={1.7} />
                  </button>
                  <p className="text-center text-sm tabular-nums text-muted" aria-live="polite">
                    {currentIndex + 1} / {sequence.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => move(1)}
                    disabled={!canMoveNext}
                    aria-label="Trattamento successivo"
                    className="interactive-control inline-flex h-11 w-11 items-center justify-center border border-line text-ink hover:border-ink hover:bg-surface disabled:opacity-35"
                  >
                    <ChevronRight aria-hidden size={19} strokeWidth={1.7} />
                  </button>
                </div>
              </footer>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
