import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { galleryCategories, galleryItems, type GalleryItem } from "@/data/content";
import { GestureProgressIndicator } from "@/components/GestureProgressIndicator";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { revealVisibleElements } from "@/hooks/use-reveal-controller";
import { useHorizontalScrollEdges } from "@/hooks/use-horizontal-scroll-edges";
import { prefersReducedMotion } from "@/lib/scroll-to-anchor";
import { cn } from "@/lib/utils";

type GalleryCategory = (typeof galleryCategories)[number];
type DragAxis = "pending" | "horizontal" | "vertical";
type GestureDirection = "left" | "right";

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  axis: DragAxis;
}

const swipeThreshold = 48;
const lightboxRevealDistance = 48;

function GalleryImage({ item, sizes }: { item: GalleryItem; sizes: string }) {
  return (
    <ImagePlaceholder
      ratio={`${item.width} / ${item.height}`}
      src={item.src}
      alt={item.alt}
      label={item.src ? undefined : "Immagine non disponibile"}
      objectPosition={item.objectPosition}
      sizes={sizes}
      className="bg-surface"
    />
  );
}

export function GalleryExplorer() {
  const [category, setCategory] = useState<GalleryCategory>("Tutte");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragDirection, setDragDirection] = useState<GestureDirection | null>(null);
  const [dragProgress, setDragProgress] = useState(0);
  const [dragArmed, setDragArmed] = useState(false);
  const [dragAnnouncement, setDragAnnouncement] = useState("");
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const dragArmedRef = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const filterRailRef = useRef<HTMLDivElement>(null);
  const activeFilterRef = useRef<HTMLButtonElement>(null);
  const shouldScrollToGalleryRef = useRef(false);
  const filterEdges = useHorizontalScrollEdges(filterRailRef);
  const filtered = useMemo(
    () => galleryItems.filter((item) => category === "Tutte" || item.category === category),
    [category],
  );
  const selectedIndex = filtered.findIndex((item) => item.id === selectedId);
  const selected = selectedIndex >= 0 ? filtered[selectedIndex] : undefined;

  useEffect(() => {
    const rail = filterRailRef.current;
    const active = activeFilterRef.current;
    if (!rail || !active) return;

    const frame = window.requestAnimationFrame(() => {
      const inset = 12;
      const railRect = rail.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      const leftBoundary = railRect.left + inset;
      const rightBoundary = railRect.right - inset;
      let delta = 0;

      if (activeRect.left < leftBoundary) {
        delta = activeRect.left - leftBoundary;
      } else if (activeRect.right > rightBoundary) {
        delta = activeRect.right - rightBoundary;
      }

      if (Math.abs(delta) > 1) {
        const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
        const nextScrollLeft = Math.min(maxScrollLeft, Math.max(0, rail.scrollLeft + delta));
        rail.scrollTo({
          left: nextScrollLeft,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [category]);

  useEffect(() => {
    if (!shouldScrollToGalleryRef.current) return;
    shouldScrollToGalleryRef.current = false;

    const frame = window.requestAnimationFrame(() => {
      const target = gridRef.current;
      if (!target) return;

      const headerHeight =
        Number.parseFloat(
          window.getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
        ) || 0;
      const filterHeight = filterRailRef.current?.getBoundingClientRect().height ?? 0;
      const top =
        window.scrollY + target.getBoundingClientRect().top - headerHeight - filterHeight - 16;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [category]);

  function rememberGalleryFilterScrollIntent() {
    const target = gridRef.current;
    if (!target) return;

    const headerHeight =
      Number.parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
      ) || 0;
    const filterHeight = filterRailRef.current?.getBoundingClientRect().height ?? 0;
    const desiredTop = headerHeight + filterHeight + 16;
    const currentTop = target.getBoundingClientRect().top;

    shouldScrollToGalleryRef.current = Math.abs(currentTop - desiredTop) > 16;
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (gridRef.current) revealVisibleElements(gridRef.current);
      window.dispatchEvent(new Event("rito:refresh-reveals"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [category]);

  const move = useCallback(
    (direction: -1 | 1) => {
      if (!filtered.length) return;
      const nextIndex = (selectedIndex + direction + filtered.length) % filtered.length;
      setDirection(direction);
      setSelectedId(filtered[nextIndex]?.id ?? null);
      setDragOffset(0);
      setDragDirection(null);
      setDragProgress(0);
      setDragArmed(false);
      setDragAnnouncement("");
      dragArmedRef.current = false;
    },
    [filtered, selectedIndex],
  );

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [move, selected]);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    const previousGutter = document.documentElement.style.scrollbarGutter;
    document.documentElement.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.scrollbarGutter = previousGutter;
    };
  }, [selected]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!selected || event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      axis: "pending",
    };
    setDragOffset(0);
    setDragDirection(null);
    setDragProgress(0);
    setDragArmed(false);
    setDragAnnouncement("");
    dragArmedRef.current = false;
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
    const nextProgress = Math.min(1, Math.abs(deltaX) / swipeThreshold);
    const nextDirection: GestureDirection | null =
      deltaX < 0 ? "right" : deltaX > 0 ? "left" : null;
    const nextOffset =
      nextDirection === "right"
        ? -nextProgress * lightboxRevealDistance
        : nextDirection === "left"
          ? nextProgress * lightboxRevealDistance
          : 0;
    const nextArmed = nextProgress >= 1;
    setDragOffset(nextOffset);
    setDragDirection(nextDirection);
    setDragProgress(nextProgress);
    setDragAnnouncement(
      nextArmed
        ? `Rilascia per mostrare l'immagine ${deltaX < 0 ? "successiva" : "precedente"}`
        : "",
    );
    if (nextArmed !== dragArmedRef.current) {
      dragArmedRef.current = nextArmed;
      setDragArmed(nextArmed);
    }
  }

  function releasePointerGesture(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setDragOffset(0);
    setDragDirection(null);
    setDragProgress(0);
    setDragArmed(false);
    setDragAnnouncement("");
    dragArmedRef.current = false;
  }

  function finishPointerGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const distance = drag.lastX - drag.startX;
    const shouldMove = drag.axis === "horizontal" && dragArmedRef.current;
    releasePointerGesture(event);

    if (shouldMove) {
      move(distance < 0 ? 1 : -1);
    }
  }

  function cancelPointerGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    releasePointerGesture(event);
  }

  return (
    <Dialog.Root open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)}>
      <div
        data-gallery-filter-rail
        data-gallery-conditional-scroll
        data-gallery-filter-return-to-results
        className="sticky top-[var(--header-height)] z-30 bg-canvas py-1"
      >
        <div className="relative min-w-0">
          <div
            ref={filterRailRef}
            data-gallery-filter-bidirectional
            role="group"
            className="scrollbar-none -mx-1 flex min-w-0 flex-nowrap gap-x-6 overflow-x-auto overflow-y-hidden overscroll-x-contain border-b border-line px-1 py-1"
            aria-label="Filtra la galleria"
          >
            {galleryCategories.map((item) => (
              <button
                ref={category === item ? activeFilterRef : undefined}
                key={item}
                type="button"
                onClick={() => {
                  if (category !== item) rememberGalleryFilterScrollIntent();
                  setCategory(item);
                }}
                aria-pressed={category === item}
                className={cn(
                  "interactive-control min-h-12 shrink-0 whitespace-nowrap border-b-2 px-1 py-3 text-sm",
                  category === item
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-ink",
                )}
              >
                {item}
              </button>
            ))}
          </div>
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
      </div>

      <div key={category} ref={gridRef} className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
        {filtered.map((item, index) => (
          <Dialog.Trigger asChild key={item.id}>
            <button
              data-reveal
              style={{ ["--reveal-delay" as string]: `${Math.min(index * 60, 240)}ms` }}
              type="button"
              onClick={(event) => {
                openerRef.current = event.currentTarget;
                setSelectedId(item.id);
              }}
              className="group mb-5 block w-full break-inside-avoid text-left"
              aria-label={`Apri immagine: ${item.alt}`}
            >
              <span className="block overflow-hidden">
                <span className="block transition-transform duration-700 ease-[var(--motion-ease-reveal)] group-hover:scale-[1.02] motion-reduce:transition-none">
                  <GalleryImage
                    item={item}
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
                  />
                </span>
              </span>
              <span className="mt-3 flex items-center justify-between gap-4 text-xs text-muted transition-colors duration-[var(--motion-duration-ui)] group-hover:text-accent group-focus-visible:text-accent">
                <span>{item.category}</span>
                <span>Apri</span>
              </span>
            </button>
          </Dialog.Trigger>
        ))}
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            openerRef.current?.focus({ preventScroll: true });
          }}
          className="fixed inset-0 z-[81] grid min-h-0 grid-rows-[minmax(0,1fr)_auto_auto] bg-ink p-4 text-white outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:p-6 md:p-8"
        >
          <Dialog.Close
            className="interactive-control absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center border border-white/50 bg-ink/75 text-white backdrop-blur-sm hover:bg-white hover:text-ink sm:right-6 sm:top-6 md:right-8 md:top-8"
            aria-label="Chiudi la galleria"
          >
            <X aria-hidden size={20} />
          </Dialog.Close>

          <div
            className="relative flex min-h-0 touch-pan-y select-none items-center justify-center overflow-hidden pb-5 pt-16"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointerGesture}
            onPointerCancel={cancelPointerGesture}
          >
            <div
              data-js-only
              className={cn(
                "pointer-events-none absolute top-1/2 z-0 flex w-12 -translate-y-1/2 items-center",
                dragDirection === "right" ? "right-0 justify-end" : "left-0 justify-start",
              )}
            >
              <GestureProgressIndicator
                progress={dragProgress}
                armed={dragArmed}
                direction={dragDirection ?? "right"}
                length="gallery"
                className="text-white/65 data-[armed=true]:text-white"
              />
            </div>
            <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[80rem] min-w-0 items-center justify-center">
              {selected?.src ? (
                <div
                  key={selected.id}
                  className="gallery-step-image flex h-full w-full items-center justify-center"
                  style={{ ["--gallery-direction" as string]: direction }}
                >
                  <img
                    src={selected.src}
                    alt={selected.alt}
                    width={selected.width}
                    height={selected.height}
                    draggable={false}
                    className={cn(
                      "gallery-drag-surface max-h-[calc(100dvh-11rem)] max-w-full object-contain",
                      dragOffset === 0
                        ? "transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-ui)]"
                        : "transition-none",
                    )}
                    style={{ transform: `translateX(${dragOffset}px)` }}
                  />
                </div>
              ) : (
                <p className="text-sm text-surface">Immagine non disponibile.</p>
              )}
            </div>
          </div>

          <div data-gallery-caption-below-image className="mx-auto w-full max-w-[80rem] pb-5 pt-2">
            <Dialog.Title className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-white/55">
              {selected?.category ?? "Galleria"}
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/80">
              {selected?.alt}
            </Dialog.Description>
          </div>

          <div className="mx-auto flex w-full max-w-[80rem] items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Immagine precedente"
              className="interactive-control inline-flex h-11 w-11 items-center justify-center border border-white/50 text-white hover:bg-white hover:text-ink"
            >
              <ChevronLeft aria-hidden size={18} />
            </button>
            <div className="flex items-center gap-3">
              <p className="text-xs tabular-nums text-surface" aria-live="polite">
                {selectedIndex + 1} / {filtered.length}
              </p>
              <p className="sr-only" aria-live="polite" aria-atomic="true">
                {dragAnnouncement}
              </p>
            </div>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Immagine successiva"
              className="interactive-control inline-flex h-11 w-11 items-center justify-center border border-white/50 text-white hover:bg-white hover:text-ink"
            >
              <ChevronRight aria-hidden size={18} />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
