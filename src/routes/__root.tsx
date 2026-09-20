import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SeoDocumentHead } from "@/components/SeoDocumentHead";
import { RouteFocus } from "@/components/RouteFocus";
import { SiteShell } from "@/components/SiteShell";
import { routeSeo } from "@/lib/seo";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <>
      <SeoDocumentHead seo={routeSeo.notFound} />
      <SiteShell>
        <section className="flex min-h-[80svh] items-center justify-center px-5 pt-[var(--header-height)]">
          <div className="max-w-md text-center">
            <p className="eyebrow">Errore 404</p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,5rem)] leading-tight text-ink">
              Pagina non trovata
            </h1>
            <p className="mt-4 text-sm text-muted">
              La pagina cercata non esiste o è stata spostata. Torna alla home per riprendere la
              navigazione.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="action-primary inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-5 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong"
              >
                Torna alla home
              </Link>
              <Link
                to="/trattamenti"
                className="interactive-control inline-flex min-h-11 items-center justify-center border border-ink px-5 text-sm font-medium text-ink hover:bg-ink hover:text-white"
              >
                Scopri i trattamenti
              </Link>
            </div>
          </div>
        </section>
      </SiteShell>
    </>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Errore</p>
        <h1 className="mt-4 font-display text-2xl text-ink">Questa pagina non si è caricata</h1>
        <p className="mt-3 text-sm text-muted">
          Qualcosa è andato storto. Puoi riprovare o tornare alla home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="action-primary inline-flex min-h-11 items-center border border-ink bg-ink px-5 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong"
          >
            Riprova
          </button>
          <a
            href="/"
            className="interactive-control inline-flex min-h-11 items-center border border-ink px-5 text-sm font-medium text-ink hover:bg-ink hover:text-white"
          >
            Torna alla home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#F6F4EF" },
      { name: "author", content: "Tretnix" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Manrope:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <head>
        <HeadContent />
        <noscript>
          <style>{`[data-js-only] { display: none !important; }`}</style>
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <RouteFocus />
      <Outlet />
    </QueryClientProvider>
  );
}
