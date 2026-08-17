import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { ctaLabels, nav, site } from "@/lib/site-config";
import { prefersReducedMotion, scrollToTop } from "@/lib/scroll-to-anchor";
import { cn } from "@/lib/utils";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.closest("[inert]") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.getClientRects().length > 0,
  );
}

export function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const drawerId = useId();
  const modalRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const drawerActive = open || closing;

  const closeDrawer = useCallback((restoreFocus = true) => {
    restoreFocusRef.current = restoreFocus;
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    if (prefersReducedMotion()) {
      setClosing(false);
      setOpen(false);
      return;
    }
    setClosing(true);
    setOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setClosing(false);
      closeTimerRef.current = null;
    }, 320);
  }, []);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeDrawer(false);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [closeDrawer]);

  useEffect(() => {
    if (!open) {
      if (restoreFocusRef.current) {
        restoreFocusRef.current = false;
        const frame = requestAnimationFrame(() =>
          triggerRef.current?.focus({ preventScroll: true }),
        );
        return () => cancelAnimationFrame(frame);
      }
      return;
    }

    const modal = modalRef.current;
    const drawer = drawerRef.current;
    if (!modal || !drawer) return;

    const frame = requestAnimationFrame(() => {
      (drawer.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? drawer).focus({
        preventScroll: true,
      });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = focusableElements(modal);
      if (!focusable.length) return;
      const current = focusable.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && current <= 0) {
        event.preventDefault();
        focusable.at(-1)?.focus();
      } else if (!event.shiftKey && current === focusable.length - 1) {
        event.preventDefault();
        focusable[0]?.focus();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && modal.contains(event.target)) return;
      (drawer.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? triggerRef.current)?.focus({
        preventScroll: true,
      });
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [closeDrawer, open]);

  useEffect(() => {
    if (!drawerActive) return;
    const previousOverflow = document.body.style.overflow;
    const previousGutter = document.documentElement.style.scrollbarGutter;
    document.documentElement.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.scrollbarGutter = previousGutter;
    };
  }, [drawerActive]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (drawerRef.current?.contains(event.target) || triggerRef.current?.contains(event.target))
        return;
      closeDrawer();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [closeDrawer, open]);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

  function handleBrandClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;

    event.preventDefault();
    void navigate({
      to: "/",
      replace: true,
      resetScroll: false,
    }).then(() => scrollToTop());
  }

  return (
    <header
      ref={modalRef}
      role={open ? "dialog" : undefined}
      aria-modal={open || undefined}
      aria-label={open ? "Menu di navigazione" : undefined}
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-canvas/95 backdrop-blur-sm transition-[border-color,background-color] duration-200 motion-reduce:transition-none",
        scrolled || drawerActive ? "border-b border-line" : "border-b border-transparent",
      )}
      style={{ height: "var(--header-height)" }}
    >
      <div className="container-editorial flex h-full items-center justify-between gap-5">
        <Link
          to="/"
          resetScroll={pathname !== "/"}
          onClick={handleBrandClick}
          inert={open}
          className="shrink-0 font-display text-lg leading-none tracking-tight text-ink"
          aria-label={`${site.brand.name} — home`}
        >
          {site.brand.name}
        </Link>

        <nav
          inert={open}
          aria-label="Navigazione principale"
          className="hidden items-center gap-4 lg:flex xl:gap-6"
        >
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive(item.to) ? "page" : undefined}
              className={cn(
                "relative py-1 text-[0.8125rem] transition-colors",
                isActive(item.to) ? "text-accent" : "text-ink hover:text-accent",
              )}
            >
              {item.label}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -bottom-1 left-1/2 h-px -translate-x-1/2 bg-accent transition-[width,opacity] duration-300 motion-reduce:transition-none",
                  isActive(item.to) ? "w-5 opacity-100" : "w-0 opacity-0",
                )}
              />
            </Link>
          ))}
        </nav>

        <div inert={open} className="hidden lg:block">
          <Link
            to="/consulenza"
            aria-label={ctaLabels.startConsultation}
            className="action-primary inline-flex min-h-11 items-center border border-ink bg-ink px-5 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong"
          >
            {ctaLabels.navConsultation}
          </Link>
        </div>

        <button
          data-js-only
          ref={triggerRef}
          type="button"
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={drawerId}
          onClick={() => (open ? closeDrawer() : setOpen(true))}
          className="interactive-control relative inline-flex h-11 w-11 items-center justify-center text-ink hover:bg-surface lg:hidden"
        >
          <Menu
            aria-hidden
            size={22}
            className={cn(
              "absolute transition-[opacity,transform] duration-300 motion-reduce:transition-none",
              open ? "rotate-90 scale-0 opacity-0" : "opacity-100",
            )}
          />
          <X
            aria-hidden
            size={22}
            className={cn(
              "absolute transition-[opacity,transform] duration-300 motion-reduce:transition-none",
              open ? "opacity-100" : "-rotate-90 scale-0 opacity-0",
            )}
          />
        </button>

        <noscript>
          <details className="relative lg:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center px-1 text-sm font-medium text-ink">
              Menu
            </summary>
            <div className="fixed inset-x-0 top-[var(--header-height)] max-h-[calc(100dvh-var(--header-height))] overflow-y-auto overscroll-contain border-b border-line bg-canvas">
              <div className="container-editorial pb-5 pt-3">
                <div className="border border-line bg-canvas p-5">
                  <nav aria-label="Menu senza JavaScript">
                    <ul className="flex flex-col">
                      {nav.map((item, index) => (
                        <li key={item.to} className="border-b border-line last:border-b-0">
                          <a
                            href={item.to}
                            className="flex min-h-14 items-center justify-between py-4 font-display text-2xl text-ink"
                          >
                            <span>{item.label}</span>
                            <span className="eyebrow text-muted">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  <a
                    href="/consulenza"
                    aria-label={ctaLabels.startConsultation}
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center border border-ink bg-ink px-6 text-sm font-medium text-white"
                  >
                    {ctaLabels.navConsultation}
                  </a>
                  <p className="mt-4 text-xs text-muted">{site.contact.locationLabel}</p>
                </div>
              </div>
            </div>
          </details>
        </noscript>
      </div>

      <div
        data-js-only
        id={drawerId}
        ref={drawerRef}
        aria-hidden={!open}
        inert={!open}
        tabIndex={-1}
        className={cn(
          "absolute inset-x-0 top-full z-50 grid origin-top transition-[grid-template-rows,opacity] duration-[320ms] ease-[var(--motion-ease-ui)] motion-reduce:transition-none lg:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="container-editorial flex max-h-[calc(100dvh-var(--header-height))] justify-end overflow-y-auto overscroll-contain pb-5 pt-3">
            <div className="w-full border border-line bg-canvas/95 p-5 backdrop-blur-sm sm:max-w-md">
              <nav aria-label="Navigazione mobile">
                <ul className="flex flex-col">
                  {nav.map((item, index) => (
                    <li key={item.to} className="border-b border-line last:border-b-0">
                      <Link
                        to={item.to}
                        onClick={() => closeDrawer(false)}
                        aria-current={isActive(item.to) ? "page" : undefined}
                        style={{ transitionDelay: open ? `${index * 35}ms` : "0ms" }}
                        className={cn(
                          "flex min-h-14 items-center justify-between py-4 font-display text-2xl transition-[color,opacity,transform] duration-300 motion-reduce:translate-x-0 motion-reduce:opacity-100 motion-reduce:transition-none",
                          open || closing
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0",
                          isActive(item.to) ? "text-accent" : "text-ink",
                        )}
                      >
                        <span>{item.label}</span>
                        <span className="eyebrow text-muted">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <Link
                to="/consulenza"
                onClick={() => closeDrawer(false)}
                aria-label={ctaLabels.startConsultation}
                className="action-primary mt-5 inline-flex min-h-12 w-full items-center justify-center border border-ink bg-ink px-6 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong"
              >
                {ctaLabels.navConsultation}
              </Link>
              <p className="mt-4 text-xs text-muted">{site.contact.locationLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
