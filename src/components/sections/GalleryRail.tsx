import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { GestureProgressIndicator } from "@/components/GestureProgressIndicator";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { galleryItems } from "@/data/content";
import { cn } from "@/lib/utils";

type DragAxis = "pending" | "horizontal" | "vertical" | "rejected";

interface EndGestureState {
  pointerId: number;
  startX: number;
  startY: number;
  axis: DragAxis;
  startedAtEnd: boolean;
}

interface EndTouchState {
  startX: number;
  startY: number;
  axis: DragAxis;
  startedAtEnd: boolean;
}

const scrollDescriptionId = "gallery-scroll-description";
const scrollEndThreshold = 8;
const openGalleryThreshold = 96;
const homeIndicatorRevealDistance = 112;
const homeGalleryIds = [
  "hair-texture",
  "skin-gesture",
  "studio-detail",
  "hair-professional",
] as const;
const homeGalleryTones = ["canvas", "surface", "ink", "canvas"] as const;

const gallerySlots = homeGalleryIds.map((id, index) => {
  const item = galleryItems.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Missing home gallery item: ${id}`);

  return {
    ...item,
    ratio: `${item.width} / ${item.height}`,
    tone: homeGalleryTones[index] ?? "surface",
  };
});

export function GalleryRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<EndGestureState | null>(null);
  const touchRef = useRef<EndTouchState | null>(null);
  const armedRef = useRef(false);
  const navigatingRef = useRef(false);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [railRevealOffset, setRailRevealOffset] = useState(0);
  const [progress, setProgress] = useState(0);
  const [armed, setArmed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const navigate = useNavigate();

  function resetGesture() {
    dragRef.current = null;
    touchRef.current = null;
    armedRef.current = false;
    setRailRevealOffset(0);
    setProgress(0);
    setArmed(false);
    setAnnouncement("");
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const updateScrollHint = () => {
      const remainingScroll = rail.scrollWidth - rail.clientWidth - rail.scrollLeft;
      setHasMoreContent(remainingScroll > scrollEndThreshold);
    };

    const animationFrame = window.requestAnimationFrame(updateScrollHint);
    rail.addEventListener("scroll", updateScrollHint, { passive: true });
    window.addEventListener("resize", updateScrollHint);

    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(updateScrollHint) : null;
    resizeObserver?.observe(rail);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      rail.removeEventListener("scroll", updateScrollHint);
      window.removeEventListener("resize", updateScrollHint);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      const remaining = rail.scrollWidth - rail.clientWidth - rail.scrollLeft;
      touchRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        axis: "pending",
        startedAtEnd: rail.scrollWidth > rail.clientWidth && remaining <= scrollEndThreshold,
      };
      armedRef.current = false;
      setRailRevealOffset(0);
      setProgress(0);
      setArmed(false);
      setAnnouncement("");
    };

    const handleTouchMove = (event: TouchEvent) => {
      const drag = touchRef.current;
      const touch = event.touches[0];
      if (!drag || !touch || !drag.startedAtEnd) return;
      const deltaX = touch.clientX - drag.startX;
      const deltaY = touch.clientY - drag.startY;

      if (drag.axis === "pending") {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // At the true end, acquire an outward horizontal drag as early as possible
        // so the browser never turns a later same-press reversal into native rail scroll.
        if (deltaX < 0 && absX >= 2 && absX > absY) {
          drag.axis = "horizontal";
        } else if (Math.max(absX, absY) < 10) {
          return;
        } else if (absX > absY && deltaX >= 0) {
          drag.axis = "rejected";
          return;
        } else {
          drag.axis = "vertical";
          return;
        }
      }
      if (drag.axis !== "horizontal") return;

      // Once the deliberate end gesture is acquired, reverse movement may cancel
      // the extra drag back to its origin, but never scroll the underlying rail
      // farther backward during the same press.
      if (event.cancelable) event.preventDefault();
      const nextExtraDrag = Math.max(0, -deltaX);
      const nextProgress = Math.min(1, nextExtraDrag / openGalleryThreshold);
      const nextArmed = nextProgress >= 1;
      setRailRevealOffset(nextProgress * homeIndicatorRevealDistance);
      setProgress(nextProgress);
      if (nextArmed !== armedRef.current) {
        armedRef.current = nextArmed;
        setArmed(nextArmed);
        setAnnouncement(nextArmed ? "Rilascia per aprire la galleria" : "");
      }
    };

    const finishTouch = (cancelled: boolean) => {
      const drag = touchRef.current;
      const shouldOpen =
        !cancelled && drag?.startedAtEnd && drag.axis === "horizontal" && armedRef.current;
      resetGesture();
      if (shouldOpen && !navigatingRef.current) {
        navigatingRef.current = true;
        void navigate({ to: "/galleria" });
      }
    };

    const handleTouchEnd = () => finishTouch(false);
    const handleTouchCancel = () => finishTouch(true);
    rail.addEventListener("touchstart", handleTouchStart, { passive: true });
    rail.addEventListener("touchmove", handleTouchMove, { passive: false });
    rail.addEventListener("touchend", handleTouchEnd);
    rail.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      rail.removeEventListener("touchstart", handleTouchStart);
      rail.removeEventListener("touchmove", handleTouchMove);
      rail.removeEventListener("touchend", handleTouchEnd);
      rail.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [navigate]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.pointerType === "touch") return;
    const rail = event.currentTarget;
    const remaining = rail.scrollWidth - rail.clientWidth - rail.scrollLeft;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      axis: "pending",
      startedAtEnd: rail.scrollWidth > rail.clientWidth && remaining <= scrollEndThreshold,
    };
    armedRef.current = false;
    setRailRevealOffset(0);
    setProgress(0);
    setArmed(false);
    setAnnouncement("");
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !drag.startedAtEnd) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (drag.axis === "pending") {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (deltaX < 0 && absX >= 2 && absX > absY) {
        drag.axis = "horizontal";
      } else if (Math.max(absX, absY) < 10) {
        return;
      } else if (absX > absY && deltaX >= 0) {
        drag.axis = "rejected";
        return;
      } else {
        drag.axis = "vertical";
        return;
      }
    }

    if (drag.axis !== "horizontal") return;

    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.preventDefault();

    // Match touch behavior: reverse movement retracts only the synthetic extra
    // drag back to zero. Going past zero is clamped until release/cancel.
    const nextExtraDrag = Math.max(0, -deltaX);
    const nextProgress = Math.min(1, nextExtraDrag / openGalleryThreshold);
    const nextArmed = nextProgress >= 1;
    setRailRevealOffset(nextProgress * homeIndicatorRevealDistance);
    setProgress(nextProgress);
    if (nextArmed !== armedRef.current) {
      armedRef.current = nextArmed;
      setArmed(nextArmed);
      setAnnouncement(nextArmed ? "Rilascia per aprire la galleria" : "");
    }
  }

  function releasePointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resetGesture();
  }

  function finishPointerGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const shouldOpen = drag.startedAtEnd && drag.axis === "horizontal" && armedRef.current;
    releasePointer(event);

    if (shouldOpen && !navigatingRef.current) {
      navigatingRef.current = true;
      void navigate({ to: "/galleria" });
    }
  }

  function cancelPointerGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    releasePointer(event);
  }

  return (
    <section
      id="galleria"
      aria-label="Immagini dello studio"
      className="scroll-mt-[calc(var(--header-height)+24px)] bg-surface pb-20 pt-4 md:pb-24 md:pt-5 lg:pt-6"
    >
      <div className="container-editorial">
        <p id={scrollDescriptionId} className="sr-only">
          Su schermi piccoli, scorri orizzontalmente per visualizzare tutte le immagini. Alla fine,
          un ulteriore gesto deliberato apre la galleria completa.
        </p>
        <div className="relative min-w-0">
          <div
            data-js-only
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-0 flex w-28 items-center justify-end transition-opacity duration-200 motion-reduce:transition-none md:hidden",
              progress > 0 ? "opacity-100" : "opacity-0",
            )}
          >
            <GestureProgressIndicator
              progress={progress}
              direction="right"
              armed={armed}
              label="Apri la galleria"
              length="home"
              className="text-muted data-[armed=true]:text-accent-strong"
            />
          </div>

          <div
            ref={railRef}
            role="list"
            tabIndex={0}
            aria-describedby={scrollDescriptionId}
            className={cn(
              "relative z-10 -mx-5 flex min-w-0 select-none snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-12 lg:gap-6",
              railRevealOffset === 0
                ? "transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-ui)] motion-reduce:transition-none"
                : "will-change-transform transition-none",
            )}
            style={{ transform: `translateX(${-railRevealOffset}px)` }}
            onDragStart={(event) => event.preventDefault()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointerGesture}
            onPointerCancel={cancelPointerGesture}
          >
            {gallerySlots.map((slot, index) => {
              const offsets = ["", "md:mt-8 lg:mt-12", "", "md:mt-5 lg:mt-8"];

              return (
                <div
                  key={slot.id}
                  role="listitem"
                  className={`w-[72%] shrink-0 snap-start md:w-auto lg:col-span-3 ${offsets[index]}`}
                  data-reveal
                  style={{ ["--reveal-delay" as string]: `${index * 70}ms` }}
                >
                  <ImagePlaceholder
                    ratio={slot.ratio}
                    tone={slot.tone}
                    src={slot.src}
                    alt={slot.alt}
                    objectPosition={slot.objectPosition}
                    sizes="(min-width: 1024px) 23vw, (min-width: 768px) 48vw, 72vw"
                  />
                </div>
              );
            })}
          </div>

          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 -right-5 z-20 w-14 bg-gradient-to-l from-surface to-transparent transition-opacity duration-200 motion-reduce:transition-none md:hidden ${
              hasMoreContent ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            data-js-only
            aria-hidden
            className={`pointer-events-none absolute right-2 top-1/2 z-30 -translate-y-1/2 transition-opacity duration-200 motion-reduce:transition-none md:hidden ${
              hasMoreContent ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-canvas/90 text-accent-strong backdrop-blur-sm">
              <ArrowRight className="rito-gallery-arrow-nudge" size={18} strokeWidth={1.6} />
            </span>
          </div>

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {announcement}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes rito-gallery-arrow-nudge {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(0.3rem); }
        }

        @media (prefers-reduced-motion: no-preference) {
          .rito-gallery-arrow-nudge {
            animation: rito-gallery-arrow-nudge 1.55s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
          }
        }
      `}</style>
    </section>
  );
}
