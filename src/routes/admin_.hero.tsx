import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, Copy, LogOut, Plus, Save, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HeroSlideVisual } from "@/components/sections/HeroSlideVisual";
import { getConsultationProfile } from "@/features/consultation/config";
import {
  getAdminSession,
  logoutAdminSession,
} from "@/features/consultation/consultation.functions";
import {
  createDemoHeroSlide,
  deleteDemoHeroSlide,
  listDemoHeroSlides,
  saveDemoHeroOrder,
  subscribeDemoHeroSlides,
  updateDemoHeroSlide,
} from "@/features/hero/demo-store";
import {
  createHeroSlide,
  deleteHeroSlide,
  listAdminHeroSlides,
  saveHeroOrder,
  updateHeroSlide,
} from "@/features/hero/hero.functions";
import {
  getHeroImageOption,
  heroCtaTargetLabels,
  heroCtaTargets,
  heroImageOptions,
  heroSlideSchema,
  heroSlideStatusLabels,
  heroSlideStatuses,
  type HeroCtaTarget,
  type HeroSlide,
  type HeroSlideStatus,
} from "@/features/hero/model";
import { buildHead, routeSeo } from "@/lib/seo";

export const Route = createFileRoute("/admin_/hero")({
  head: () => buildHead(routeSeo.adminHero),
  component: HeroAdminPage,
});

const fieldControlClass =
  "min-h-12 w-full border border-line bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-accent motion-reduce:transition-none";

type Draft = {
  eyebrow: string;
  title: string;
  accent: string;
  trailing: string;
  body: string;
  imageRef: string;
  imageAlt: string;
  primaryLabel: string;
  primaryTarget: HeroCtaTarget;
  secondaryEnabled: boolean;
  secondaryLabel: string;
  secondaryTarget: HeroCtaTarget;
  status: HeroSlideStatus;
  startsAt: string;
  endsAt: string;
};

function dateTimeLocal(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : "";
}

function toDraft(slide?: HeroSlide): Draft {
  const source = slide ?? {
    eyebrow: "Beauty & Care Atelier · Padova",
    title: "Nuova storia,",
    accent: "nel ritmo RITO.",
    trailing: "",
    body: "Scrivi un messaggio breve, concreto e coerente con la promessa RITO Studio.",
    imageRef: heroImageOptions[0].ref,
    imageAlt: heroImageOptions[0].alt,
    primaryCta: { label: "Inizia la consulenza", target: "consultation" as const },
    secondaryCta: { label: "Scopri i trattamenti", target: "treatments" as const },
    status: "draft" as const,
    startsAt: "",
    endsAt: "",
  };

  return {
    eyebrow: source.eyebrow,
    title: source.title,
    accent: source.accent,
    trailing: source.trailing,
    body: source.body,
    imageRef: source.imageRef,
    imageAlt: source.imageAlt,
    primaryLabel: source.primaryCta.label,
    primaryTarget: source.primaryCta.target,
    secondaryEnabled: Boolean(source.secondaryCta),
    secondaryLabel: source.secondaryCta?.label ?? "",
    secondaryTarget: source.secondaryCta?.target ?? "treatments",
    status: source.status,
    startsAt: dateTimeLocal(source.startsAt),
    endsAt: dateTimeLocal(source.endsAt),
  };
}

function HeroAdminPage() {
  const profile = getConsultationProfile();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [authenticated, setAuthenticated] = useState(profile === "demo");
  const [csrfToken, setCsrfToken] = useState("");
  const [sessionLoading, setSessionLoading] = useState(profile === "live");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => toDraft());
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const next = profile === "demo" ? listDemoHeroSlides() : await listAdminHeroSlides();
      setSlides([...next].sort((a, b) => a.order - b.order));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Caricamento hero non riuscito.");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile === "demo") {
      void refresh();
      return subscribeDemoHeroSlides(() => void refresh());
    }

    let cancelled = false;
    void getAdminSession()
      .then((session) => {
        if (cancelled) return;
        setAuthenticated(session.authenticated);
        setCsrfToken(session.authenticated ? session.csrfToken : "");
      })
      .catch(() => {
        if (!cancelled) setError("Non è stato possibile verificare l'accesso admin.");
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile, refresh]);

  useEffect(() => {
    if (profile !== "live" || sessionLoading) return;
    if (!authenticated) {
      window.location.replace("/admin/login");
      return;
    }
    void refresh();
  }, [authenticated, profile, refresh, sessionLoading]);

  const editingSlide = useMemo(
    () => slides.find((slide) => slide.id === editingId) ?? null,
    [editingId, slides],
  );

  function openEditor(slide?: HeroSlide) {
    setEditingId(slide?.id ?? null);
    setDraft(toDraft(slide));
    setMessage("");
    setError("");
    setEditorOpen(true);
  }

  function rawDraft() {
    return {
      eyebrow: draft.eyebrow,
      title: draft.title,
      accent: draft.accent,
      trailing: draft.trailing,
      body: draft.body,
      imageRef: draft.imageRef,
      imageAlt: draft.imageAlt,
      primaryCta: { label: draft.primaryLabel, target: draft.primaryTarget },
      secondaryCta: draft.secondaryEnabled
        ? { label: draft.secondaryLabel, target: draft.secondaryTarget }
        : null,
      status: draft.status,
      startsAt: toIso(draft.startsAt),
      endsAt: toIso(draft.endsAt),
    };
  }

  function parsedDraft(existing?: HeroSlide) {
    const payload = rawDraft();
    const result = heroSlideSchema.safeParse({
      ...payload,
      id: existing?.id ?? "validation",
      order: existing?.order ?? slides.length,
      version: existing?.version ?? 1,
    });
    if (!result.success) {
      throw new Error(result.error.issues[0]?.message ?? "Dati hero non validi.");
    }
    const { id: _id, order: _order, version: _version, ...clean } = result.data;
    return clean;
  }

  function previewSlide(existing?: HeroSlide): HeroSlide {
    const current = rawDraft();
    const image = getHeroImageOption(current.imageRef) ?? heroImageOptions[0];
    return {
      id: existing?.id ?? "preview",
      eyebrow: current.eyebrow.trim() || "Beauty & Care Atelier · Padova",
      title: current.title.trim() || "Anteprima hero,",
      accent: current.accent.trim() || "nel ritmo RITO.",
      trailing: current.trailing.trim(),
      body: current.body.trim() || "Anteprima del contenuto hero RITO Studio.",
      imageRef: image.ref,
      imageAlt: current.imageAlt.trim() || image.alt,
      primaryCta: {
        label: current.primaryCta.label.trim() || "Inizia la consulenza",
        target: current.primaryCta.target,
      },
      secondaryCta: current.secondaryCta
        ? {
            label: current.secondaryCta.label.trim() || "Scopri i trattamenti",
            target: current.secondaryCta.target,
          }
        : null,
      status: current.status,
      startsAt:
        current.status === "published" && !current.startsAt
          ? new Date().toISOString()
          : current.startsAt,
      endsAt: current.endsAt,
      order: existing?.order ?? slides.length,
      version: existing?.version ?? 1,
    };
  }

  async function saveEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = parsedDraft(editingSlide ?? undefined);
      if (profile === "demo") {
        if (editingSlide) updateDemoHeroSlide(editingSlide.id, payload);
        else createDemoHeroSlide(payload);
      } else if (editingSlide) {
        await updateHeroSlide({
          data: {
            id: editingSlide.id,
            expectedVersion: editingSlide.version,
            slide: payload,
            csrfToken,
          },
        });
      } else {
        await createHeroSlide({ data: { slide: payload, csrfToken } });
      }
      await refresh();
      setMessage(editingSlide ? "Schermata aggiornata." : "Schermata creata.");
      setEditorOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Salvataggio hero non riuscito.");
    } finally {
      setSaving(false);
    }
  }

  async function move(slide: HeroSlide, direction: -1 | 1) {
    const index = slides.findIndex((item) => item.id === slide.id);
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const ordered = [...slides];
    const [moved] = ordered.splice(index, 1);
    ordered.splice(target, 0, moved);
    setSaving(true);
    setError("");
    try {
      if (profile === "demo") {
        saveDemoHeroOrder(ordered.map((item) => item.id));
      } else {
        await saveHeroOrder({
          data: {
            items: ordered.map((item, order) => ({
              id: item.id,
              order,
              expectedVersion: item.version,
            })),
            csrfToken,
          },
        });
      }
      await refresh();
      setMessage("Ordine hero aggiornato.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Riordino hero non riuscito.");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function duplicate(slide: HeroSlide) {
    if (slides.length >= 5) return;
    const { id: _id, order: _order, version: _version, ...copy } = slide;
    const payload = {
      ...copy,
      eyebrow: `${copy.eyebrow} · copia`,
      status: "draft" as const,
      startsAt: "",
      endsAt: "",
    };
    setSaving(true);
    try {
      if (profile === "demo") createDemoHeroSlide(payload);
      else await createHeroSlide({ data: { slide: payload, csrfToken } });
      await refresh();
      setMessage("Copia creata come bozza.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Duplicazione non riuscita.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    setError("");
    try {
      if (profile === "demo") deleteDemoHeroSlide(deleteTarget.id);
      else {
        await deleteHeroSlide({
          data: {
            id: deleteTarget.id,
            expectedVersion: deleteTarget.version,
            csrfToken,
          },
        });
      }
      setDeleteTarget(null);
      await refresh();
      setMessage("Schermata eliminata.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Eliminazione non riuscita.");
    } finally {
      setSaving(false);
    }
  }

  if (profile === "live" && (sessionLoading || !authenticated)) {
    return <div className="min-h-screen bg-canvas p-8 text-ink">Verifica sessione…</div>;
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-[1520px] items-center gap-3 px-4 sm:px-6 xl:px-8">
          <Link to="/" className="hidden shrink-0 font-display text-lg text-ink sm:block">
            RITO Studio
          </Link>
          <nav aria-label="Navigazione amministrazione" className="flex items-center gap-1 sm:ml-4">
            <Link
              to="/admin"
              className="interactive-control min-h-10 px-3 text-sm font-medium text-muted hover:text-ink"
            >
              Inbox
            </Link>
            <Link
              to="/admin/hero"
              aria-current="page"
              className="interactive-control min-h-10 border border-ink bg-ink px-3 text-sm font-medium text-white"
            >
              Hero
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/" className="editorial-link min-h-11 text-sm font-medium">
              <ArrowLeft aria-hidden size={16} />
              Sito
            </Link>
            <button
              type="button"
              onClick={() => {
                if (profile === "demo") {
                  window.location.assign("/");
                  return;
                }
                if (!csrfToken) return;
                void logoutAdminSession({ data: { csrfToken } }).finally(() =>
                  window.location.assign("/admin/login"),
                );
              }}
              className="interactive-control inline-flex min-h-11 min-w-11 items-center justify-center border border-line px-3 text-muted hover:border-ink hover:text-ink"
              aria-label="Esci dall'area admin"
            >
              <LogOut aria-hidden size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1520px] px-4 py-6 sm:px-6 xl:px-8">
        <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Homepage
            </p>
            <h1 className="mt-2 font-display text-4xl leading-none sm:text-5xl">Gestione hero</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Gestisci le schermate full-screen della home: contenuti, immagine, CTA, pubblicazione
              e ordine.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openEditor()}
            disabled={slides.length >= 5 || saving}
            className="action-primary inline-flex min-h-12 items-center justify-center gap-2 border border-ink bg-ink px-5 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Plus aria-hidden size={16} />
            Nuova schermata
          </button>
        </div>

        {message ? (
          <p role="status" className="mt-4 text-sm text-accent-strong">
            {message}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="mt-4 border border-accent/30 bg-canvas p-3 text-sm text-ink">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="py-10 text-muted">Caricamento hero…</p>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {slides.map((slide, index) => (
              <article key={slide.id} className="overflow-hidden border border-line bg-canvas">
                <div className="relative">
                  <HeroSlideVisual
                    slide={slide}
                    interactive={false}
                    preview
                    positionLabel={`${index + 1} / ${slides.length}`}
                  />
                  <button
                    type="button"
                    onClick={() => openEditor(slide)}
                    className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                    aria-label={`Modifica schermata ${index + 1}`}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {index + 1}. {slide.eyebrow}
                    </p>
                    <p className="mt-1 text-xs text-muted">{heroSlideStatusLabels[slide.status]}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton
                      label="Sposta prima"
                      disabled={index === 0 || saving}
                      onClick={() => void move(slide, -1)}
                    >
                      <ArrowUp aria-hidden size={15} />
                    </IconButton>
                    <IconButton
                      label="Sposta dopo"
                      disabled={index === slides.length - 1 || saving}
                      onClick={() => void move(slide, 1)}
                    >
                      <ArrowDown aria-hidden size={15} />
                    </IconButton>
                    <IconButton
                      label="Duplica"
                      disabled={slides.length >= 5 || saving}
                      onClick={() => void duplicate(slide)}
                    >
                      <Copy aria-hidden size={15} />
                    </IconButton>
                    <IconButton
                      label="Elimina"
                      disabled={saving}
                      onClick={() => setDeleteTarget(slide)}
                    >
                      <Trash2 aria-hidden size={15} />
                    </IconButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[94dvh] overflow-hidden rounded-none border-line bg-canvas p-0 text-ink sm:max-w-5xl">
          <DialogHeader className="border-b border-line px-5 pb-4 pt-5 sm:px-7">
            <DialogTitle className="font-display text-3xl font-normal">
              {editingSlide ? "Modifica schermata" : "Nuova schermata"}
            </DialogTitle>
            <DialogDescription className="text-muted">
              La preview pubblica usa lo stesso renderer della home.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEditor} className="flex max-h-[calc(94dvh-7rem)] min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Eyebrow">
                    <input
                      className={fieldControlClass}
                      value={draft.eyebrow}
                      onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })}
                    />
                  </Field>
                  <Field label="Stato">
                    <select
                      className={fieldControlClass}
                      value={draft.status}
                      onChange={(e) =>
                        setDraft({ ...draft, status: e.target.value as HeroSlideStatus })
                      }
                    >
                      {heroSlideStatuses.map((status) => (
                        <option key={status} value={status}>
                          {heroSlideStatusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Titolo">
                    <input
                      className={fieldControlClass}
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    />
                  </Field>
                  <Field label="Accento">
                    <input
                      className={fieldControlClass}
                      value={draft.accent}
                      onChange={(e) => setDraft({ ...draft, accent: e.target.value })}
                    />
                  </Field>
                  <Field label="Riga finale">
                    <input
                      className={fieldControlClass}
                      value={draft.trailing}
                      onChange={(e) => setDraft({ ...draft, trailing: e.target.value })}
                    />
                  </Field>
                  <Field label="Immagine">
                    <select
                      className={fieldControlClass}
                      value={draft.imageRef}
                      onChange={(e) => {
                        const image = getHeroImageOption(e.target.value);
                        setDraft({
                          ...draft,
                          imageRef: e.target.value,
                          imageAlt: image?.alt ?? draft.imageAlt,
                        });
                      }}
                    >
                      {heroImageOptions.map((image) => (
                        <option key={image.ref} value={image.ref}>
                          {image.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Testo" className="sm:col-span-2">
                    <textarea
                      className={`${fieldControlClass} min-h-28 resize-y py-3`}
                      value={draft.body}
                      onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                    />
                  </Field>
                  <Field label="Alt immagine" className="sm:col-span-2">
                    <input
                      className={fieldControlClass}
                      value={draft.imageAlt}
                      onChange={(e) => setDraft({ ...draft, imageAlt: e.target.value })}
                    />
                  </Field>
                  <Field label="CTA primaria">
                    <input
                      className={fieldControlClass}
                      value={draft.primaryLabel}
                      onChange={(e) => setDraft({ ...draft, primaryLabel: e.target.value })}
                    />
                  </Field>
                  <Field label="Destinazione primaria">
                    <select
                      className={fieldControlClass}
                      value={draft.primaryTarget}
                      onChange={(e) =>
                        setDraft({ ...draft, primaryTarget: e.target.value as HeroCtaTarget })
                      }
                    >
                      {heroCtaTargets.map((target) => (
                        <option key={target} value={target}>
                          {heroCtaTargetLabels[target]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <label className="sm:col-span-2 flex min-h-11 items-center gap-3 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={draft.secondaryEnabled}
                      onChange={(e) => setDraft({ ...draft, secondaryEnabled: e.target.checked })}
                      className="h-4 w-4 accent-accent"
                    />
                    Mostra CTA secondaria
                  </label>
                  {draft.secondaryEnabled ? (
                    <>
                      <Field label="CTA secondaria">
                        <input
                          className={fieldControlClass}
                          value={draft.secondaryLabel}
                          onChange={(e) => setDraft({ ...draft, secondaryLabel: e.target.value })}
                        />
                      </Field>
                      <Field label="Destinazione secondaria">
                        <select
                          className={fieldControlClass}
                          value={draft.secondaryTarget}
                          onChange={(e) =>
                            setDraft({ ...draft, secondaryTarget: e.target.value as HeroCtaTarget })
                          }
                        >
                          {heroCtaTargets.map((target) => (
                            <option key={target} value={target}>
                              {heroCtaTargetLabels[target]}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </>
                  ) : null}
                  <Field label="Inizio pubblicazione">
                    <input
                      type="datetime-local"
                      className={fieldControlClass}
                      value={draft.startsAt}
                      onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
                    />
                  </Field>
                  <Field label="Fine pubblicazione">
                    <input
                      type="datetime-local"
                      className={fieldControlClass}
                      value={draft.endsAt}
                      onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="min-w-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                    Preview
                  </p>
                  <div className="overflow-hidden border border-line bg-ink">
                    <HeroSlideVisual
                      slide={previewSlide(editingSlide ?? undefined)}
                      preview
                      interactive={false}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-line bg-canvas px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="interactive-control min-h-11 border border-line px-5 text-sm font-medium"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={saving}
                className="action-primary inline-flex min-h-11 items-center gap-2 border border-ink bg-ink px-5 text-sm font-semibold text-white disabled:opacity-40"
              >
                <Save aria-hidden size={15} />
                {saving ? "Salvataggio…" : "Salva"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-none border-line bg-canvas text-ink">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-normal">
              Eliminare questa schermata?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted">
              La hero deve mantenere almeno una schermata pubblicata. L'azione non può essere
              annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-line">Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              className="rounded-none bg-accent text-white hover:bg-accent-strong"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="interactive-control inline-flex h-10 w-10 items-center justify-center border border-line text-muted hover:border-ink hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}
