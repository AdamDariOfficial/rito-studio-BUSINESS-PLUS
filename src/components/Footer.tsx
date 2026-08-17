import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { type MouseEvent } from "react";
import { scrollToTop } from "@/lib/scroll-to-anchor";
import { site } from "@/lib/site-config";

const footerLinkClass =
  "text-white transition-colors hover:text-surface focus-visible:outline-white";

export function Footer() {
  const year = new Date().getFullYear();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();

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
    <footer className="border-t border-ink bg-ink text-white">
      <div className="container-editorial grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
        <div>
          <Link
            to="/"
            resetScroll={pathname !== "/"}
            onClick={handleBrandClick}
            className="inline-flex font-display text-2xl text-white transition-colors hover:text-surface focus-visible:outline-white"
            aria-label={`${site.brand.name} — home`}
          >
            {site.brand.name}
          </Link>
          <p className="mt-1 text-sm text-surface">{site.brand.descriptor}</p>
          <p className="mt-6 max-w-xs text-xs leading-relaxed text-surface">
            Capelli, pelle e benessere in un ambiente essenziale, su appuntamento.
          </p>
        </div>

        <div>
          <p className="eyebrow text-surface">Contatti</p>
          <ul className="mt-4 space-y-2 text-sm text-white">
            <li>{site.contact.locationLabel}</li>
            <li>
              <a href={site.contact.phoneHref} className={footerLinkClass}>
                {site.contact.phone}
              </a>
            </li>
            <li>
              <a href={site.contact.emailHref} className={footerLinkClass}>
                {site.contact.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-surface">Info</p>
          <ul className="mt-4 space-y-2 text-sm text-white">
            <li>
              <Link to="/trattamenti" className={footerLinkClass}>
                Trattamenti
              </Link>
            </li>
            <li>
              <Link to="/studio" className={footerLinkClass}>
                Studio
              </Link>
            </li>
            <li>
              <Link to="/galleria" className={footerLinkClass}>
                Galleria
              </Link>
            </li>
            <li>
              <Link to="/faq" className={footerLinkClass}>
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/contatti" className={footerLinkClass}>
                Contatti
              </Link>
            </li>
            <li>
              <Link to="/privacy" className={footerLinkClass}>
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/cookie" className={footerLinkClass}>
                Cookie
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-editorial flex flex-col-reverse items-start justify-between gap-3 py-6 text-xs text-surface md:flex-row md:items-center">
          <p>
            © {year} {site.brand.name}. Tutti i diritti riservati.
          </p>
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>{site.attribution.text}</span>
            <a
              href={site.attribution.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white underline decoration-white/40 underline-offset-4 transition-colors hover:text-surface hover:decoration-surface focus-visible:outline-white"
              aria-label={`${site.attribution.linkLabel} — apre in una nuova scheda`}
            >
              {site.attribution.linkLabel}
              <ArrowUpRight aria-hidden size={13} strokeWidth={1.8} />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
