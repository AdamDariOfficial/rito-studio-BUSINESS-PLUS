import { Link } from "@tanstack/react-router";
import { ArrowLeft, LogOut } from "lucide-react";

type AdminSection = "inbox" | "hero";

export function AdminHeader({
  active,
  onLogout,
  logoutDisabled = false,
}: {
  active: AdminSection;
  onLogout?: () => void;
  logoutDisabled?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex min-h-14 w-full max-w-[1520px] items-center gap-2 px-4 sm:gap-3 sm:px-6 xl:px-8">
        <Link to="/" className="hidden shrink-0 font-display text-lg text-ink sm:block">
          RITO Studio
        </Link>

        <nav aria-label="Navigazione amministrazione" className="flex items-center gap-1 sm:ml-4">
          <Link
            to="/admin"
            aria-current={active === "inbox" ? "page" : undefined}
            className={`interactive-control inline-flex min-h-11 items-center px-3 text-sm font-medium ${
              active === "inbox"
                ? "border border-ink bg-ink text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            Inbox
          </Link>
          <Link
            to="/admin/hero"
            aria-current={active === "hero" ? "page" : undefined}
            className={`interactive-control inline-flex min-h-11 items-center px-3 text-sm font-medium ${
              active === "hero"
                ? "border border-ink bg-ink text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            Hero
          </Link>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className="editorial-link inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium sm:px-2 sm:text-base"
          >
            <ArrowLeft aria-hidden size={16} strokeWidth={1.7} />
            <span className="hidden sm:inline">Torna al sito</span>
            <span className="sm:hidden">Sito</span>
          </Link>

          {onLogout ? (
            <button
              type="button"
              data-admin-logout
              data-admin-exit
              onClick={onLogout}
              disabled={logoutDisabled}
              className="interactive-control inline-flex min-h-11 min-w-11 items-center justify-center gap-2 border border-line px-2 text-muted hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
              aria-label="Esci dall'area admin"
              title="Esci"
            >
              <LogOut aria-hidden size={16} strokeWidth={1.7} />
              <span className="hidden text-sm font-medium lg:inline">Esci</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
