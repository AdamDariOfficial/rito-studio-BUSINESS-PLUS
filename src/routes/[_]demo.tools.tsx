import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, RotateCcw, Save, Upload } from "lucide-react";
import {
  exportDemoState,
  importDemoState,
  listDemoConsultations,
  resetDemoConsultations,
  restoreDemoSnapshot,
  saveDemoSnapshot,
} from "@/features/consultation/demo-store";
import { getConsultationProfile } from "@/features/consultation/config";
import { buildHead, routeSeo } from "@/lib/seo";

export const Route = createFileRoute("/_demo/tools")({
  head: () => buildHead(routeSeo.demoTools),
  component: DemoToolsPage,
});

function DemoToolsPage() {
  const profile = getConsultationProfile();
  const [message, setMessage] = useState("");
  const [importValue, setImportValue] = useState("");
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    if (profile === "demo") setRequestCount(listDemoConsultations().length);
  }, [profile]);

  function refresh(messageText: string) {
    setRequestCount(listDemoConsultations().length);
    setMessage(messageText);
  }

  if (profile !== "demo") {
    return (
      <DemoFrame>
        <p className="eyebrow text-accent">Demo tools</p>
        <h1 className="mt-4 font-display text-4xl text-ink">Non disponibili in modalità live</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
          Questa route è riservata al profilo portfolio/demo e non gestisce dati di produzione.
        </p>
      </DemoFrame>
    );
  }

  return (
    <DemoFrame>
      <div className="max-w-6xl">
        <p className="eyebrow text-accent">Portfolio / development</p>
        <h1 className="mt-4 font-display text-[clamp(2.7rem,8vw,5rem)] leading-[0.95] text-ink">
          Demo tools
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted">
          Gestisci soltanto la memoria locale dimostrativa. Questi strumenti non sono un CMS e non
          modificano repository, deploy o dati live.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="border border-line bg-canvas p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="eyebrow">Stato corrente</p>
                <p className="mt-2 font-display text-2xl text-ink">{requestCount} richieste demo</p>
              </div>
              <Link to="/admin" className="editorial-link min-h-11 text-sm font-medium">
                Apri inbox
              </Link>
            </div>

            {message ? (
              <p className="mt-5 border border-line bg-surface p-4 text-sm text-ink" role="status">
                {message}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  saveDemoSnapshot();
                  refresh("Snapshot locale salvato.");
                }}
                className="interactive-control inline-flex min-h-12 items-center justify-center gap-2 border border-line px-4 text-sm text-ink hover:border-ink"
              >
                <Save aria-hidden size={16} strokeWidth={1.7} />
                Salva snapshot
              </button>

              <button
                type="button"
                onClick={() =>
                  refresh(
                    restoreDemoSnapshot()
                      ? "Snapshot ripristinato."
                      : "Nessuno snapshot valido disponibile.",
                  )
                }
                className="interactive-control inline-flex min-h-12 items-center justify-center gap-2 border border-line px-4 text-sm text-ink hover:border-ink"
              >
                <RotateCcw aria-hidden size={16} strokeWidth={1.7} />
                Ripristina snapshot
              </button>

              <button
                type="button"
                onClick={() => {
                  resetDemoConsultations();
                  refresh("Stato iniziale demo ripristinato.");
                }}
                className="interactive-control inline-flex min-h-12 items-center justify-center gap-2 border border-line px-4 text-sm text-ink hover:border-ink"
              >
                <RotateCcw aria-hidden size={16} strokeWidth={1.7} />
                Ripristina seed
              </button>

              <button
                type="button"
                onClick={() => {
                  setImportValue(exportDemoState());
                  refresh("Stato esportato nell'editor qui sotto.");
                }}
                className="interactive-control inline-flex min-h-12 items-center justify-center gap-2 border border-line px-4 text-sm text-ink hover:border-ink"
              >
                <Download aria-hidden size={16} strokeWidth={1.7} />
                Esporta stato
              </button>
            </div>
          </div>

          <div className="border border-line bg-canvas p-5 sm:p-6">
            <label className="block">
              <span className="eyebrow">Import / export JSON</span>
              <textarea
                value={importValue}
                onChange={(event) => setImportValue(event.target.value)}
                rows={12}
                spellCheck={false}
                className="mt-4 w-full resize-y border border-line bg-surface p-4 font-mono text-xs leading-relaxed text-ink outline-none focus:border-accent"
                placeholder='{"requests": [...]}'
              />
            </label>
            <button
              type="button"
              onClick={() => {
                try {
                  importDemoState(importValue);
                  refresh("Stato importato correttamente.");
                } catch {
                  refresh("JSON non valido oppure struttura richieste non riconosciuta.");
                }
              }}
              className="action-primary mt-4 inline-flex min-h-12 items-center justify-center gap-2 border border-ink bg-ink px-6 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong"
            >
              <Upload aria-hidden size={16} strokeWidth={1.7} />
              Importa stato
            </button>
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}

function DemoFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-line bg-canvas">
        <div className="container-editorial flex min-h-16 items-center justify-between gap-4 py-3">
          <Link to="/" className="font-display text-lg text-ink">
            RITO Studio
          </Link>
          <Link to="/admin" className="editorial-link min-h-11 text-sm font-medium">
            <ArrowLeft aria-hidden size={16} strokeWidth={1.7} />
            Consultation Inbox
          </Link>
        </div>
      </header>
      <main className="container-editorial py-8 md:py-12">{children}</main>
    </div>
  );
}
