import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  Copy,
  LogOut,
  Mail,
  Pencil,
  Phone,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTreatment, treatments } from "@/data/treatments";
import {
  getConsultationAnswerLabel,
  getConsultationProfile,
  getConsultationQuestion,
  consultationWindows,
  MAX_CONSULTATION_SELECTED_SERVICES,
} from "@/features/consultation/config";
import {
  deleteDemoConsultation,
  editDemoConsultation,
  getConsultationServiceLabel,
  listDemoConsultations,
  subscribeDemoConsultations,
  updateDemoConsultation,
} from "@/features/consultation/demo-store";
import {
  deleteLiveConsultation,
  editLiveConsultation,
  getAdminSession,
  getLiveConsultation,
  listLiveConsultations,
  logoutAdminSession,
  updateLiveConsultation,
} from "@/features/consultation/consultation.functions";
import { consultationRealtimeEventSchema } from "@/features/consultation/realtime";
import type {
  ConsultationContact,
  ConsultationRequest,
  ConsultationStatus,
  PreferredContact,
} from "@/features/consultation/types";
import { buildHead, routeSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const statusLabels: Record<ConsultationStatus, string> = {
  new: "Nuova",
  contacted: "Contattata",
  booked: "Prenotata",
  archived: "Archiviata",
};

export const Route = createFileRoute("/admin")({
  head: () => buildHead(routeSeo.admin),
  component: ConsultationAdminPage,
});

function ConsultationAdminPage() {
  const profile = getConsultationProfile();
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [mobileDetailClosing, setMobileDetailClosing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ConsultationStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sessionLoading, setSessionLoading] = useState(profile === "live");
  const [authenticated, setAuthenticated] = useState(profile === "demo");
  const [adminEmail, setAdminEmail] = useState<string | undefined>();
  const [csrfToken, setCsrfToken] = useState("");
  const [realtimeState, setRealtimeState] = useState<
    "connecting" | "live" | "reconnecting" | "offline"
  >(profile === "live" ? "connecting" : "offline");
  const [dataError, setDataError] = useState("");
  const [saving, setSaving] = useState(false);

  const applyLiveSnapshot = useCallback((data: ConsultationRequest[]) => {
    setRequests(data);
    setSelectedId((current) =>
      current && data.some((request) => request.id === current) ? current : (data[0]?.id ?? null),
    );
  }, []);

  const refreshLive = useCallback(async () => {
    setDataError("");
    try {
      applyLiveSnapshot(await listLiveConsultations());
      return true;
    } catch {
      setDataError("Non è stato possibile caricare le richieste.");
      return false;
    }
  }, [applyLiveSnapshot]);

  useEffect(() => {
    if (profile === "demo") {
      const sync = () => {
        const data = listDemoConsultations();
        setRequests(data);
        setSelectedId((current) =>
          current && data.some((request) => request.id === current)
            ? current
            : (data[0]?.id ?? null),
        );
      };
      sync();
      return subscribeDemoConsultations(sync);
    }

    let cancelled = false;
    void getAdminSession()
      .then((session) => {
        if (cancelled) return;
        setAuthenticated(session.authenticated);
        setAdminEmail(session.authenticated ? session.email : undefined);
        setCsrfToken(session.authenticated ? session.csrfToken : "");
      })
      .catch(() => {
        if (!cancelled) setDataError("Non è stato possibile verificare l'accesso admin.");
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile]);

  useEffect(() => {
    if (profile !== "live" || sessionLoading || authenticated) return;
    window.location.replace("/admin/login");
  }, [authenticated, profile, sessionLoading]);

  useEffect(() => {
    if (profile !== "live" || !authenticated) return;

    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let reconnectAttempt = 0;
    let snapshotInFlight = false;
    let bufferedEvents: Array<ReturnType<typeof consultationRealtimeEventSchema.parse>> = [];

    const upsert = (request: ConsultationRequest) => {
      setRequests((current) => {
        const existing = current.find((item) => item.id === request.id);
        if (existing && existing.version > request.version) return current;
        const next = existing
          ? current.map((item) => (item.id === request.id ? request : item))
          : [request, ...current];
        return [...next].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      });
      setSelectedId((current) => current ?? request.id);
    };

    const applyRealtimeEvent = async (
      event: ReturnType<typeof consultationRealtimeEventSchema.parse>,
    ) => {
      if (event.type === "consultation.deleted") {
        setRequests((current) => current.filter((request) => request.id !== event.requestId));
        setSelectedId((current) => (current === event.requestId ? null : current));
        return;
      }

      try {
        const request = await getLiveConsultation({ data: { id: event.requestId } });
        if (!cancelled) upsert(request);
      } catch {
        // A following delete event can make a preceding update disappear before this read.
        // Reconnect/catch-up remains the authoritative recovery path.
      }
    };

    const markSessionExpired = () => {
      setAuthenticated(false);
      setAdminEmail(undefined);
      setCsrfToken("");
      setRealtimeState("offline");
    };

    const snapshotAndReplay = async () => {
      snapshotInFlight = true;
      try {
        const data = await listLiveConsultations();
        if (cancelled) return false;
        applyLiveSnapshot(data);
        const pending = bufferedEvents;
        bufferedEvents = [];
        snapshotInFlight = false;
        for (const event of pending) await applyRealtimeEvent(event);
        return true;
      } catch {
        snapshotInFlight = false;
        if (!cancelled) {
          try {
            const session = await getAdminSession();
            if (!session.authenticated) {
              markSessionExpired();
              return false;
            }
          } catch {
            // Keep the current UI state: the failure may be transient infrastructure, not auth.
          }
          setDataError("Connessione live attiva, ma la sincronizzazione è fallita.");
        }
        return false;
      }
    };

    const scheduleReconnect = () => {
      if (cancelled || reconnectTimer !== undefined) return;
      setRealtimeState("reconnecting");
      const base = Math.min(30_000, 1_000 * 2 ** Math.min(reconnectAttempt, 5));
      const delay = Math.round(base * (0.8 + Math.random() * 0.4));
      reconnectAttempt += 1;
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = undefined;
        connect();
      }, delay);
    };

    const connect = () => {
      if (cancelled) return;
      setRealtimeState(reconnectAttempt ? "reconnecting" : "connecting");
      bufferedEvents = [];
      snapshotInFlight = false;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(
        `${protocol}//${window.location.host}/__tretnix/consultation-realtime`,
      );

      socket.addEventListener("message", (message) => {
        let payload: unknown;
        try {
          payload = JSON.parse(String(message.data));
        } catch {
          return;
        }

        if (typeof payload === "object" && payload !== null && "type" in payload) {
          if ((payload as { type?: unknown }).type === "ready") {
            reconnectAttempt = 0;
            setRealtimeState("live");
            void snapshotAndReplay().then((ok) => {
              if (!ok && socket?.readyState === WebSocket.OPEN) socket.close();
            });
            return;
          }
        }

        const parsed = consultationRealtimeEventSchema.safeParse(payload);
        if (!parsed.success) return;
        if (snapshotInFlight) {
          bufferedEvents.push(parsed.data);
        } else {
          void applyRealtimeEvent(parsed.data);
        }
      });

      socket.addEventListener("close", (event) => {
        socket = null;
        if (event.code === 4401) {
          markSessionExpired();
          return;
        }
        scheduleReconnect();
      });
      socket.addEventListener("error", () => {
        socket?.close();
      });
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
      socket?.close(1000, "Admin page closed");
      setRealtimeState("offline");
    };
  }, [applyLiveSnapshot, authenticated, profile]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (statusFilter !== "all" && request.status !== statusFilter) return false;
      if (dateFilter && !request.createdAt.startsWith(dateFilter)) return false;
      return true;
    });
  }, [dateFilter, requests, statusFilter]);

  const selected = requests.find((request) => request.id === selectedId) ?? null;

  async function refreshAfterMutationFailure(message: string) {
    if (profile === "live") {
      const refreshed = await refreshLive();
      if (!refreshed) {
        const session = await getAdminSession().catch(() => null);
        if (session && !session.authenticated) {
          setAuthenticated(false);
          setAdminEmail(undefined);
          setCsrfToken("");
          return;
        }
      }
    }
    setDataError(message);
  }

  async function updateRequest(id: string, update: { status?: ConsultationStatus; note?: string }) {
    setSaving(true);
    setDataError("");
    try {
      if (profile === "demo") {
        updateDemoConsultation(id, update);
      } else {
        const current = requests.find((request) => request.id === id);
        if (!current) throw new Error("Request not found");
        const updated = await updateLiveConsultation({
          data: { csrfToken, id, expectedVersion: current.version, ...update },
        });
        setRequests((items) =>
          items.map((request) => (request.id === updated.id ? updated : request)),
        );
      }
    } catch {
      await refreshAfterMutationFailure(
        "La modifica non è stata salvata. La Inbox è stata risincronizzata.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function editRequest(
    request: ConsultationRequest,
    update: Pick<ConsultationRequest, "selectedServiceSlugs" | "contact">,
  ) {
    setSaving(true);
    setDataError("");
    try {
      if (profile === "demo") {
        editDemoConsultation(request.id, update);
      } else {
        const updated = await editLiveConsultation({
          data: { csrfToken, id: request.id, expectedVersion: request.version, ...update },
        });
        setRequests((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      }
      return true;
    } catch {
      await refreshAfterMutationFailure(
        "I dati non sono stati salvati. La Inbox è stata risincronizzata.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function deleteRequest(id: string) {
    setSaving(true);
    setDataError("");
    try {
      if (profile === "demo") {
        if (!deleteDemoConsultation(id)) throw new Error("Request not found");
      } else {
        const current = requests.find((request) => request.id === id);
        if (!current) throw new Error("Request not found");
        await deleteLiveConsultation({ data: { csrfToken, id, expectedVersion: current.version } });
        setRequests((items) => items.filter((request) => request.id !== id));
      }
      setSelectedId((current) => (current === id ? null : current));
      setMobileDetailOpen(false);
      setMobileDetailClosing(false);
    } catch {
      await refreshAfterMutationFailure(
        "La richiesta non è stata eliminata. La Inbox è stata risincronizzata.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openRequest(id: string) {
    setSelectedId(id);
    setMobileDetailClosing(false);
    setMobileDetailOpen(true);
  }

  function closeMobileRequest() {
    if (!mobileDetailOpen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMobileDetailOpen(false);
      setMobileDetailClosing(false);
      return;
    }
    setMobileDetailClosing(true);
  }

  if (sessionLoading) {
    return (
      <AdminFrame>
        <p className="text-sm text-muted">Verifica accesso…</p>
      </AdminFrame>
    );
  }

  if (!authenticated) {
    return (
      <AdminFrame>
        <p className="text-sm text-muted">Reindirizzamento al login…</p>
      </AdminFrame>
    );
  }

  return (
    <AdminFrame>
      <div className="flex min-h-0 flex-col gap-4 lg:h-full">
        <div className="shrink-0 border-b border-line pb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-accent">Business Plus</p>
              <h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.6rem)] leading-none text-ink">
                Consultation Inbox
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Richieste, contatti e aggiornamenti operativi in un unico spazio.
              </p>
            </div>
            {profile === "live" ? (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex min-h-11 items-center gap-2 px-2 text-xs text-muted"
                  title={adminEmail}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-2 w-2 rounded-full",
                      realtimeState === "live" ? "bg-accent" : "bg-muted/50",
                    )}
                  />
                  {realtimeState === "live"
                    ? "Live"
                    : realtimeState === "connecting"
                      ? "Connessione…"
                      : realtimeState === "reconnecting"
                        ? "Riconnessione…"
                        : "Offline"}
                </span>
                <button
                  type="button"
                  onClick={() => void refreshLive()}
                  className="interactive-control inline-flex min-h-11 items-center gap-2 border border-line px-4 text-sm text-ink hover:border-ink"
                >
                  <RefreshCw aria-hidden size={16} strokeWidth={1.7} />
                  Aggiorna
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!csrfToken) return;
                    setSaving(true);
                    setDataError("");
                    void logoutAdminSession({ data: { csrfToken } })
                      .then(() => {
                        window.location.assign("/admin/login");
                      })
                      .catch(() => {
                        setDataError("Non è stato possibile chiudere la sessione. Riprova.");
                      })
                      .finally(() => {
                        setSaving(false);
                      });
                  }}
                  disabled={!csrfToken || saving}
                  className="interactive-control inline-flex min-h-11 items-center gap-2 border border-line px-4 text-sm text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut aria-hidden size={16} strokeWidth={1.7} />
                  Esci
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {dataError ? (
          <div
            role="alert"
            className="shrink-0 border border-accent/30 bg-canvas p-4 text-sm text-ink"
          >
            {dataError}
          </div>
        ) : null}

        <div className="min-h-0 lg:hidden">
          {mobileDetailOpen && selected ? (
            <div
              className={cn(
                "border border-line bg-canvas",
                mobileDetailClosing ? "admin-request-detail-out" : "admin-request-detail-in",
              )}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget || !mobileDetailClosing) return;
                setMobileDetailOpen(false);
                setMobileDetailClosing(false);
              }}
            >
              <div className="border-b border-line px-4 py-3">
                <button
                  type="button"
                  onClick={closeMobileRequest}
                  className="editorial-link inline-flex min-h-11 items-center gap-2 text-sm font-medium"
                >
                  <ChevronLeft aria-hidden size={17} strokeWidth={1.7} />
                  Tutte le richieste
                </button>
              </div>
              <RequestDetail
                request={selected}
                saving={saving}
                onStatus={(status) => void updateRequest(selected.id, { status })}
                onNote={(note) => updateRequest(selected.id, { note })}
                onEdit={(update) => editRequest(selected, update)}
                onDelete={() => deleteRequest(selected.id)}
              />
            </div>
          ) : (
            <div className="admin-request-list-in space-y-4">
              <Filters
                statusFilter={statusFilter}
                dateFilter={dateFilter}
                onStatusFilter={setStatusFilter}
                onDateFilter={setDateFilter}
              />
              <RequestList
                requests={filteredRequests}
                selectedId={selectedId}
                onSelect={openRequest}
              />
              {profile === "demo" ? <DemoToolsLink /> : null}
            </div>
          )}
        </div>

        <div className="hidden min-h-0 flex-1 gap-4 lg:grid lg:grid-cols-[minmax(19rem,0.78fr)_minmax(0,1.42fr)]">
          <section className="flex min-h-0 flex-col border border-line bg-canvas">
            <div className="shrink-0 border-b border-line p-4">
              <Filters
                statusFilter={statusFilter}
                dateFilter={dateFilter}
                onStatusFilter={setStatusFilter}
                onDateFilter={setDateFilter}
                compact
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <RequestList
                requests={filteredRequests}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id)}
                embedded
              />
            </div>
            {profile === "demo" ? (
              <div className="shrink-0 border-t border-line px-4 py-3">
                <DemoToolsLink />
              </div>
            ) : null}
          </section>

          <section
            aria-labelledby="request-detail-heading"
            className="min-h-0 overflow-y-auto overscroll-contain border border-line bg-canvas"
          >
            {selected ? (
              <div key={selected.id} className="admin-request-detail-switch">
                <RequestDetail
                  request={selected}
                  saving={saving}
                  onStatus={(status) => void updateRequest(selected.id, { status })}
                  onNote={(note) => updateRequest(selected.id, { note })}
                  onEdit={(update) => editRequest(selected, update)}
                  onDelete={() => deleteRequest(selected.id)}
                />
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <h2 id="request-detail-heading" className="font-display text-2xl text-ink">
                  Dettaglio
                </h2>
                <p className="mt-3 text-sm text-muted">Seleziona una richiesta.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminFrame>
  );
}

function AdminFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-ink lg:h-screen lg:overflow-hidden">
      <header className="border-b border-line bg-canvas">
        <div className="container-editorial flex min-h-16 items-center justify-between gap-4 py-3">
          <Link to="/" className="font-display text-lg text-ink">
            RITO Studio
          </Link>
          <Link to="/" className="editorial-link min-h-11 text-sm font-medium">
            <ArrowLeft aria-hidden size={16} strokeWidth={1.7} />
            Torna al sito
          </Link>
        </div>
      </header>
      <main className="container-editorial py-6 md:py-8 lg:h-[calc(100vh-4rem)] lg:py-6">
        {children}
      </main>
    </div>
  );
}

function Filters({
  statusFilter,
  dateFilter,
  onStatusFilter,
  onDateFilter,
  compact = false,
}: {
  statusFilter: ConsultationStatus | "all";
  dateFilter: string;
  onStatusFilter: (value: ConsultationStatus | "all") => void;
  onDateFilter: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        compact ? "grid-cols-2" : "border border-line bg-canvas p-4 sm:grid-cols-2",
      )}
    >
      <label className="block min-w-0">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">
          Stato
        </span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilter(event.target.value as ConsultationStatus | "all")}
          className="mt-2 min-h-11 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="all">Tutte</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block min-w-0">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">
          Data
        </span>
        <input
          type="date"
          value={dateFilter}
          onChange={(event) => onDateFilter(event.target.value)}
          className="mt-2 min-h-11 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
        />
      </label>
    </div>
  );
}

function RequestList({
  requests,
  selectedId,
  onSelect,
  embedded = false,
}: {
  requests: ConsultationRequest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  embedded?: boolean;
}) {
  const content = requests.length ? (
    <ul>
      {requests.map((request) => {
        const active = request.id === selectedId;
        return (
          <li key={request.id} className="border-b border-line last:border-b-0">
            <button
              type="button"
              onClick={() => onSelect(request.id)}
              className={cn(
                "w-full px-4 py-4 text-left transition-colors motion-reduce:transition-none sm:px-5",
                active ? "bg-surface" : "bg-canvas hover:bg-surface/60",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{request.contact.name}</p>
                  <p className="mt-1 truncate text-sm text-muted">
                    {getConsultationServiceLabel(request)}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <p className="mt-3 text-xs tabular-nums text-muted">
                {formatDateTime(request.createdAt)}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  ) : (
    <p className="px-5 py-8 text-sm text-muted">Nessuna richiesta con questi filtri.</p>
  );

  if (embedded) return content;

  return (
    <section aria-labelledby="request-list-heading" className="border border-line bg-canvas">
      <div className="border-b border-line px-5 py-4">
        <h2 id="request-list-heading" className="font-display text-2xl text-ink">
          Richieste
        </h2>
        <p className="mt-1 text-xs text-muted">{requests.length} risultati</p>
      </div>
      {content}
    </section>
  );
}

function DemoToolsLink() {
  return (
    <Link
      to="/_demo/tools"
      className="inline-flex min-h-9 items-center text-xs text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink motion-reduce:transition-none"
    >
      Strumenti
    </Link>
  );
}

function StatusBadge({ status }: { status: ConsultationStatus }) {
  return (
    <span className="shrink-0 border border-line bg-canvas px-2 py-1 text-[0.6875rem] uppercase tracking-[0.12em] text-muted">
      {statusLabels[status]}
    </span>
  );
}

type EditableRequestUpdate = Pick<ConsultationRequest, "selectedServiceSlugs" | "contact">;

function RequestDetail({
  request,
  saving,
  onStatus,
  onNote,
  onEdit,
  onDelete,
}: {
  request: ConsultationRequest;
  saving: boolean;
  onStatus: (status: ConsultationStatus) => void;
  onNote: (note: string) => Promise<void>;
  onEdit: (update: EditableRequestUpdate) => Promise<boolean>;
  onDelete: () => Promise<void>;
}) {
  const [noteDraft, setNoteDraft] = useState(request.note);
  const [noteOpen, setNoteOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [contactDraft, setContactDraft] = useState<ConsultationContact>(request.contact);
  const [complementaryDraft, setComplementaryDraft] = useState<string[]>(
    request.selectedServiceSlugs.filter((slug) => slug !== request.serviceSlug),
  );

  useEffect(() => {
    setNoteDraft(request.note);
    setNoteOpen(false);
    setEditing(false);
    setContactDraft(request.contact);
    setComplementaryDraft(
      request.selectedServiceSlugs.filter((slug) => slug !== request.serviceSlug),
    );
  }, [request]);

  const mainTreatment = getTreatment(request.serviceSlug);
  const selectedTreatments = request.selectedServiceSlugs
    .map((slug) => getTreatment(slug))
    .filter((treatment): treatment is NonNullable<typeof treatment> => Boolean(treatment));

  function toggleComplementary(slug: string) {
    setComplementaryDraft((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      if (current.length >= MAX_CONSULTATION_SELECTED_SERVICES - 1) return current;
      return [...current, slug];
    });
  }

  async function saveEdit() {
    const ok = await onEdit({
      selectedServiceSlugs: [request.serviceSlug, ...complementaryDraft],
      contact: {
        ...contactDraft,
        email: contactDraft.email ?? "",
        preferredDate: contactDraft.preferredDate ?? "",
      },
    });
    if (ok) setEditing(false);
  }

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-line bg-canvas/95 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow text-accent">Richiesta</p>
            <h2 id="request-detail-heading" className="mt-2 font-display text-3xl text-ink">
              {request.contact.name}
            </h2>
            <p className="mt-1 text-xs tabular-nums text-muted">
              {formatDateTime(request.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="min-w-40 flex-1 sm:flex-none">
              <span className="sr-only">Stato richiesta</span>
              <select
                value={request.status}
                disabled={saving}
                onChange={(event) => onStatus(event.target.value as ConsultationStatus)}
                className="min-h-11 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent disabled:opacity-60"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setEditing((current) => !current)}
              className="interactive-control inline-flex min-h-11 items-center gap-2 border border-line px-3 text-sm text-ink hover:border-ink"
            >
              {editing ? <X aria-hidden size={16} /> : <Pencil aria-hidden size={16} />}
              {editing ? "Annulla" : "Modifica"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-7 p-4 sm:p-6">
        {editing ? (
          <RequestEditForm
            request={request}
            contact={contactDraft}
            complementarySlugs={complementaryDraft}
            saving={saving}
            onContact={setContactDraft}
            onToggleComplementary={toggleComplementary}
            onSave={() => void saveEdit()}
          />
        ) : (
          <>
            <section>
              <p className="eyebrow">Percorso richiesto</p>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <p className="font-display text-2xl text-ink">
                  {mainTreatment?.name ?? request.serviceSlug}
                </p>
                {mainTreatment ? (
                  <span className="text-sm text-muted">{mainTreatment.priceLabel}</span>
                ) : null}
              </div>
              {selectedTreatments.length > 1 ? (
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {selectedTreatments.slice(1).map((treatment) => (
                    <li key={treatment.slug} className="flex items-center justify-between gap-4">
                      <span>+ {treatment.name}</span>
                      <span>{treatment.priceLabel}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <section className="border-t border-line pt-6">
              <p className="eyebrow">Contatto</p>
              <dl className="mt-4 grid gap-5 text-sm sm:grid-cols-2">
                <ContactValue
                  label="Telefono"
                  value={request.contact.phone}
                  href={`tel:${request.contact.phone}`}
                  icon={<Phone aria-hidden size={16} strokeWidth={1.7} />}
                />
                <ContactValue
                  label="Email"
                  value={request.contact.email || ""}
                  href={request.contact.email ? `mailto:${request.contact.email}` : undefined}
                  icon={<Mail aria-hidden size={16} strokeWidth={1.7} />}
                  emptyLabel="—"
                />
                <div>
                  <dt className="text-muted">Canale preferito</dt>
                  <dd className="mt-1 text-ink">
                    {preferredContactLabel(request.contact.preferredContact)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Giorno preferito</dt>
                  <dd className="mt-1 text-ink">
                    {request.contact.preferredDate
                      ? formatDate(request.contact.preferredDate)
                      : "Non indicato"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Fascia preferita</dt>
                  <dd className="mt-1 text-ink">{request.contact.preferredWindow}</dd>
                </div>
              </dl>
            </section>
          </>
        )}

        <section className="border-t border-line pt-6">
          <p className="eyebrow">Risposte originali</p>
          <dl className="mt-4 space-y-3 text-sm">
            {Object.entries(request.answers).map(([key, value]) => (
              <div
                key={key}
                className="grid gap-1.5 border-b border-line pb-3 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.9fr)] sm:gap-6"
              >
                <dt className="text-muted">
                  {mainTreatment
                    ? (getConsultationQuestion(mainTreatment.category, key)?.prompt ?? key)
                    : key}
                </dt>
                <dd className="text-ink sm:text-right">
                  {mainTreatment
                    ? getConsultationAnswerLabel(mainTreatment.category, key, value)
                    : value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-t border-line pt-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="eyebrow">Nota interna</p>
              <button
                type="button"
                onClick={() => setNoteOpen(true)}
                className="mt-2 block max-w-xl text-left text-sm leading-relaxed text-ink transition-colors hover:text-accent motion-reduce:transition-none"
              >
                {request.note ? (
                  <span className="line-clamp-2">{request.note}</span>
                ) : (
                  <span className="text-muted">Nessuna nota. Aggiungine una per il team.</span>
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setNoteOpen(true)}
              className="interactive-control inline-flex min-h-11 shrink-0 items-center gap-2 px-1 text-sm text-muted hover:text-ink"
            >
              <Pencil aria-hidden size={16} strokeWidth={1.7} />
              {request.note ? "Modifica" : "Aggiungi"}
            </button>
          </div>

          <NoteEditorDialog
            open={noteOpen}
            onOpenChange={(open) => {
              setNoteOpen(open);
              if (open) setNoteDraft(request.note);
            }}
            value={noteDraft}
            saving={saving}
            unchanged={noteDraft === request.note}
            onValue={setNoteDraft}
            onSave={() => {
              void onNote(noteDraft);
              setNoteOpen(false);
            }}
          />
        </section>

        <section className="border-t border-line pt-6">
          <p className="eyebrow text-muted">Gestione richiesta</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            L'eliminazione è definitiva. Se vuoi soltanto conservarla fuori dal flusso attivo, usa
            lo stato Archiviata.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={saving}
                className="interactive-control mt-4 inline-flex min-h-11 items-center gap-2 border border-accent/40 px-4 text-sm text-accent-strong hover:border-accent disabled:opacity-50"
              >
                <Trash2 aria-hidden size={16} strokeWidth={1.7} />
                Elimina richiesta
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-line bg-canvas text-ink sm:rounded-none">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-2xl font-normal">
                  Eliminare questa richiesta?
                </AlertDialogTitle>
                <AlertDialogDescription className="leading-relaxed text-muted">
                  Questa operazione rimuove definitivamente la richiesta di {request.contact.name}.
                  Non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-none border-line bg-canvas">
                  Annulla
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => void onDelete()}
                  className="rounded-none bg-accent text-white hover:bg-accent-strong"
                >
                  Elimina definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </div>
  );
}

function NoteEditorDialog({
  open,
  onOpenChange,
  value,
  saving,
  unchanged,
  onValue,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  saving: boolean;
  unchanged: boolean;
  onValue: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none border-line bg-canvas text-ink sm:max-w-xl">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-3xl font-normal">Nota interna</DialogTitle>
          <DialogDescription className="leading-relaxed text-muted">
            Aggiungi un promemoria operativo visibile soltanto nell'area admin.
          </DialogDescription>
        </DialogHeader>

        <label className="mt-2 block">
          <span className="sr-only">Nota interna</span>
          <textarea
            autoFocus
            value={value}
            onChange={(event) => onValue(event.target.value)}
            maxLength={600}
            rows={7}
            className="w-full resize-y border border-line bg-canvas p-4 text-sm leading-relaxed text-ink outline-none focus:border-accent"
          />
        </label>

        <DialogFooter className="mt-1 flex-row items-center justify-between space-x-0">
          <span className="text-xs tabular-nums text-muted">{value.length} / 600</span>
          <button
            type="button"
            disabled={saving || unchanged}
            onClick={onSave}
            className="action-primary inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-5 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong disabled:opacity-45"
          >
            {saving ? "Salvataggio…" : "Salva nota"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequestEditForm({
  request,
  contact,
  complementarySlugs,
  saving,
  onContact,
  onToggleComplementary,
  onSave,
}: {
  request: ConsultationRequest;
  contact: ConsultationContact;
  complementarySlugs: string[];
  saving: boolean;
  onContact: (contact: ConsultationContact) => void;
  onToggleComplementary: (slug: string) => void;
  onSave: () => void;
}) {
  const mainTreatment = getTreatment(request.serviceSlug);
  const complementaryOptions = treatments.filter(
    (treatment) => treatment.slug !== request.serviceSlug,
  );

  return (
    <section aria-labelledby="edit-request-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">Modifica</p>
          <h3 id="edit-request-heading" className="mt-2 font-display text-2xl text-ink">
            Dati operativi
          </h3>
        </div>
        <span className="text-xs text-muted">Le risposte originali restano invariate.</span>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-ink">Nome e cognome</span>
          <input
            value={contact.name}
            onChange={(event) => onContact({ ...contact, name: event.target.value })}
            className="mt-2 min-h-11 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Telefono</span>
          <input
            value={contact.phone}
            onChange={(event) => onContact({ ...contact, phone: event.target.value })}
            inputMode="tel"
            className="mt-2 min-h-11 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            value={contact.email ?? ""}
            onChange={(event) => onContact({ ...contact, email: event.target.value })}
            className="mt-2 min-h-11 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Canale preferito</span>
          <select
            value={contact.preferredContact}
            onChange={(event) =>
              onContact({ ...contact, preferredContact: event.target.value as PreferredContact })
            }
            className="mt-2 min-h-11 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
          >
            <option value="phone">Telefono</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Giorno preferito</span>
          <input
            type="date"
            value={contact.preferredDate ?? ""}
            onChange={(event) => onContact({ ...contact, preferredDate: event.target.value })}
            className="mt-2 min-h-11 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-ink">Fascia preferita</span>
          <select
            value={contact.preferredWindow}
            onChange={(event) => onContact({ ...contact, preferredWindow: event.target.value })}
            className="mt-2 min-h-11 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
          >
            {consultationWindows.map((windowLabel) => (
              <option key={windowLabel} value={windowLabel}>
                {windowLabel}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-7 border-t border-line pt-6">
        <p className="text-sm font-medium text-ink">Servizio principale</p>
        <div className="mt-2 flex items-center justify-between gap-4 border border-line bg-surface px-4 py-3 text-sm">
          <span>{mainTreatment?.name ?? request.serviceSlug}</span>
          {mainTreatment ? <span className="text-muted">{mainTreatment.priceLabel}</span> : null}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Il servizio principale resta quello della consulenza originale. Puoi aggiornare i servizi
          aggiunti successivamente, fino al limite previsto per il percorso.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {complementaryOptions.map((treatment) => {
            const active = complementarySlugs.includes(treatment.slug);
            const disabled =
              !active && complementarySlugs.length >= MAX_CONSULTATION_SELECTED_SERVICES - 1;
            return (
              <label
                key={treatment.slug}
                className={cn(
                  "flex min-h-11 items-center justify-between gap-3 border px-3 py-2 text-sm",
                  active ? "border-accent bg-surface" : "border-line bg-canvas",
                  disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={active}
                    disabled={disabled}
                    onChange={() => onToggleComplementary(treatment.slug)}
                    className="h-4 w-4 accent-accent"
                  />
                  <span>{treatment.name}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">{treatment.priceLabel}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex justify-end border-t border-line pt-5">
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="action-primary inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-5 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong disabled:opacity-50"
        >
          {saving ? "Salvataggio…" : "Salva modifiche"}
        </button>
      </div>
    </section>
  );
}

function ContactValue({
  label,
  value,
  href,
  icon,
  emptyLabel = "—",
}: {
  label: string;
  value: string;
  href?: string;
  icon: ReactNode;
  emptyLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 flex min-w-0 items-center gap-2">
        {value && href ? (
          <a
            href={href}
            className="inline-flex min-w-0 items-center gap-2 break-all text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent motion-reduce:transition-none"
          >
            <span className="shrink-0 text-accent">{icon}</span>
            <span>{value}</span>
          </a>
        ) : (
          <span className="text-ink">{value || emptyLabel}</span>
        )}
        {value ? (
          <button
            type="button"
            onClick={() => void copyValue()}
            className="interactive-control inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-muted hover:text-accent"
            aria-label={`Copia ${label.toLowerCase()}`}
            title={`Copia ${label.toLowerCase()}`}
          >
            {copied ? <Check aria-hidden size={15} /> : <Copy aria-hidden size={15} />}
          </button>
        ) : null}
        <span className="sr-only" aria-live="polite">
          {copied ? `${label} copiato` : ""}
        </span>
      </dd>
    </div>
  );
}

function preferredContactLabel(value: ConsultationRequest["contact"]["preferredContact"]) {
  if (value === "whatsapp") return "WhatsApp";
  if (value === "email") return "Email";
  return "Telefono";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
