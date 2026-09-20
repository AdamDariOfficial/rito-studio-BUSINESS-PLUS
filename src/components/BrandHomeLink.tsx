import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { MouseEvent, ReactNode } from "react";
import { scrollToTop } from "@/lib/scroll-to-anchor";

type BrandHomeLinkProps = {
  children: ReactNode;
  className: string;
  ariaLabel: string;
  inert?: boolean;
  onActivate?: () => void;
};

export function BrandHomeLink({
  children,
  className,
  ariaLabel,
  inert,
  onActivate,
}: BrandHomeLinkProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    onActivate?.();
    if (pathname !== "/") return;

    event.preventDefault();
    void navigate({ to: "/", replace: true, resetScroll: false }).then(() => scrollToTop());
  }

  return (
    <Link
      to="/"
      resetScroll={pathname !== "/"}
      onClick={handleClick}
      inert={inert}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
