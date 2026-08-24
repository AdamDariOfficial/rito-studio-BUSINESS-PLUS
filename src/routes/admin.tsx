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
    setMobileDetailOpen(true);
  }

  function closeMobileRequest() {
    setMobileDetailOpen(false);
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
      <div
        data-admin-workspace="operations-v2-readability"
        data-admin-qa-correction="2026-08-23"
        className="flex min-h-0 flex-col lg:h-full"
      >
        <div className="shrink-0 border-b border-line bg-canvas px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="truncate font-display text-[1.65rem] leading-none text-ink sm:text-[2rem]">
                  Richieste consulenza
                </h1>
                <span className="shrink-0 text-sm font-medium tabular-nums text-muted">
                  {filteredRequests.length === requests.length
                    ? `${requests.length} ${requests.length === 1 ? "richiesta" : "richieste"}`
                    : `${filteredRequests.length} di ${requests.length} ${requests.length === 1 ? "richiesta" : "richieste"}`}
                </span>
              </div>
              <p className="mt-1 hidden text-sm leading-relaxed text-muted sm:block">
                Contatti, preferenze e stato in un unico spazio.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {profile === "live" ? (
                <>
                  <span
                    className="hidden min-h-10 items-center gap-2 px-2 text-xs text-muted sm:inline-flex"
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
                    className="interactive-control inline-flex min-h-11 min-w-11 items-center justify-center border border-line text-muted hover:border-ink hover:text-ink"
                    aria-label="Aggiorna richieste"
                    title="Aggiorna"
                  >
                    <RefreshCw aria-hidden size={16} strokeWidth={1.7} />
                  </button>
                </>
              ) : null}
              <button
                type="button"
                data-admin-logout
                data-admin-exit
                onClick={() => {
                  if (profile === "demo") {
                    window.location.assign("/");
                    return;
                  }
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
                disabled={profile === "live" && (!csrfToken || saving)}
                className="interactive-control inline-flex min-h-11 min-w-11 items-center justify-center gap-2 border border-line px-2 text-muted hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
                aria-label={profile === "demo" ? "Esci dalla demo admin" : "Esci dall'area admin"}
                title="Esci"
              >
                <LogOut aria-hidden size={16} strokeWidth={1.7} />
                <span className="hidden text-sm font-medium sm:inline">Esci</span>
              </button>
            </div>
          </div>
        </div>

        {dataError ? (
          <div
            role="alert"
            className="shrink-0 border-b border-accent/30 px-4 py-3 text-sm text-ink sm:px-5"
          >
            {dataError}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[23.5rem_minmax(0,1fr)]">
          <aside
            className={cn(
              "min-h-0 flex-col border-line bg-canvas lg:flex lg:border-r",
              mobileDetailOpen && selected ? "hidden" : "flex",
            )}
          >
            <div className="shrink-0 border-b border-line p-3">
              <Filters
                statusFilter={statusFilter}
                dateFilter={dateFilter}
                onStatusFilter={setStatusFilter}
                onDateFilter={setDateFilter}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <RequestList
                requests={filteredRequests}
                selectedId={selectedId}
                onSelect={(id) => {
                  if (window.matchMedia("(min-width: 1024px)").matches) {
                    setSelectedId(id);
                    return;
                  }
                  openRequest(id);
                }}
              />
            </div>
          </aside>

          <section
            aria-labelledby="request-detail-heading"
            className={cn(
              "min-h-0 bg-canvas lg:block lg:overflow-y-auto lg:overscroll-contain",
              mobileDetailOpen && selected ? "block" : "hidden",
            )}
          >
            {selected ? (
              <div
                key={selected.id}
                className="admin-request-detail-switch admin-request-detail-in"
              >
                <div className="border-b border-line px-4 py-2 lg:hidden">
                  <button
                    type="button"
                    data-admin-mobile-back
                    onClick={closeMobileRequest}
                    className="editorial-link inline-flex min-h-11 items-center gap-2 text-base font-medium"
                  >
                    <ChevronLeft aria-hidden size={17} strokeWidth={1.7} />
                    Richieste
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
              <div className="flex min-h-[20rem] items-center justify-center p-8">
                <p className="text-base text-muted">Seleziona una richiesta.</p>
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
    <div className="min-h-screen bg-canvas text-ink lg:h-screen lg:overflow-hidden">
      <header className="border-b border-line bg-canvas">
        <div className="mx-auto flex min-h-14 w-full max-w-[1520px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
          <Link to="/" className="font-display text-lg text-ink">
            RITO Studio
          </Link>
          <Link to="/" className="editorial-link min-h-11 text-base font-medium">
            <ArrowLeft aria-hidden size={16} strokeWidth={1.7} />
            Torna al sito
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1520px] lg:h-[calc(100vh-3.5rem)]">{children}</main>
    </div>
  );
}

function Filters({
  statusFilter,
  dateFilter,
  onStatusFilter,
  onDateFilter,
}: {
  statusFilter: ConsultationStatus | "all";
  dateFilter: string;
  onStatusFilter: (value: ConsultationStatus | "all") => void;
  onDateFilter: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block min-w-0">
        <span className="text-sm font-medium text-ink">Stato</span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilter(event.target.value as ConsultationStatus | "all")}
          className="mt-1.5 min-h-12 w-full border border-line bg-canvas px-3 text-base text-ink outline-none focus:border-accent"
        >
          <option value="all">Tutti gli stati</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block min-w-0">
        <span className="text-sm font-medium text-ink">Data</span>
        <input
          type="date"
          value={dateFilter}
          onChange={(event) => onDateFilter(event.target.value)}
          className="mt-1.5 min-h-12 w-full border border-line bg-canvas px-3 text-base text-ink outline-none focus:border-accent"
        />
      </label>
    </div>
  );
}

function RequestList({
  requests,
  selectedId,
  onSelect,
}: {
  requests: ConsultationRequest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (!requests.length) {
    return <p className="px-4 py-8 text-base text-muted">Nessuna richiesta con questi filtri.</p>;
  }

  return (
    <ul>
      {requests.map((request) => {
        const active = request.id === selectedId;
        return (
          <li key={request.id} className="border-b border-line last:border-b-0">
            <button
              type="button"
              onClick={() => onSelect(request.id)}
              className={cn(
                "w-full border-l-2 px-4 py-4 text-left transition-colors motion-reduce:transition-none",
                active
                  ? "border-l-accent bg-surface/80"
                  : "border-l-transparent bg-canvas hover:bg-surface/55",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-ink">
                    {request.contact.name}
                  </p>
                  <p className="mt-1 truncate text-base text-muted">
                    {getConsultationServiceLabel(request)}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-ink">{request.contact.phone}</span>
                <span className="shrink-0 tabular-nums text-muted">
                  {formatDateTime(request.createdAt)}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function StatusBadge({ status }: { status: ConsultationStatus }) {
  return (
    <span className="shrink-0 border border-line bg-canvas px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
      {statusLabels[status]}
    </span>
  );
}

type EditableRequestUpdate = Pick<ConsultationRequest, "selectedServiceSlugs" | "contact">;

function RequestStatusSelect({
  status,
  saving,
  onStatus,
}: {
  status: ConsultationStatus;
  saving: boolean;
  onStatus: (status: ConsultationStatus) => void;
}) {
  return (
    <label className="block max-w-xs">
      <span className="mb-2 block text-sm font-semibold text-ink">Stato richiesta</span>
      <select
        data-admin-request-status-select
        value={status}
        disabled={saving}
        onChange={(event) => onStatus(event.target.value as ConsultationStatus)}
        className="min-h-12 w-full border border-line bg-canvas px-3 text-base font-medium text-ink outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-55"
      >
        {(Object.entries(statusLabels) as Array<[ConsultationStatus, string]>).map(
          ([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

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
  const [editing, setEditing] = useState(false);
  const [contactDraft, setContactDraft] = useState<ConsultationContact>(request.contact);
  const [complementaryDraft, setComplementaryDraft] = useState<string[]>(
    request.selectedServiceSlugs.filter((slug) => slug !== request.serviceSlug),
  );

  useEffect(() => {
    setNoteDraft(request.note);
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
  const answerEntries = Object.entries(request.answers);
  const noteDirty = noteDraft !== request.note;

  function resetEditDraft() {
    setContactDraft(request.contact);
    setComplementaryDraft(
      request.selectedServiceSlugs.filter((slug) => slug !== request.serviceSlug),
    );
  }

  function openEdit() {
    resetEditDraft();
    setEditing(true);
  }

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

  async function saveNote() {
    if (!noteDirty || saving) return;
    await onNote(noteDraft);
  }

  return (
    <div className="min-w-0">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur-sm sm:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2
                id="request-detail-heading"
                className="truncate font-display text-[2rem] leading-none text-ink sm:text-[2.25rem]"
              >
                {request.contact.name}
              </h2>
              <span className="text-sm tabular-nums text-muted">
                {formatDateTime(request.createdAt)}
              </span>
            </div>
            <p className="mt-1 truncate text-base text-muted">
              {mainTreatment?.name ?? request.serviceSlug}
              {selectedTreatments.length > 1 ? ` + ${selectedTreatments.length - 1}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-3 max-w-xs">
          <RequestStatusSelect status={request.status} saving={saving} onStatus={onStatus} />
        </div>
      </header>

      <div className="divide-y divide-line">
        <section className="grid xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="px-4 py-5 sm:px-5 xl:border-r xl:border-line">
            <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-accent">
              Servizi richiesti
            </p>
            <div className="mt-2 flex items-baseline justify-between gap-4">
              <p className="font-display text-2xl leading-tight text-ink">
                {mainTreatment?.name ?? request.serviceSlug}
              </p>
              {mainTreatment ? (
                <span className="shrink-0 text-base font-medium text-muted">
                  {mainTreatment.priceLabel}
                </span>
              ) : null}
            </div>
            {selectedTreatments.length > 1 ? (
              <ul className="mt-3 divide-y divide-line border-t border-line text-base">
                {selectedTreatments.slice(1).map((treatment) => (
                  <li key={treatment.slug} className="flex items-center justify-between gap-4 py-2">
                    <span className="min-w-0 truncate text-ink">+ {treatment.name}</span>
                    <span className="shrink-0 text-sm text-muted">{treatment.priceLabel}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-base text-muted">Nessun servizio aggiuntivo.</p>
            )}
          </div>

          <div className="px-4 py-5 sm:px-5">
            <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-accent">
              Contatti e preferenze
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 text-base">
              <ContactValue
                label="Telefono"
                value={request.contact.phone}
                href={`tel:${request.contact.phone}`}
                icon={<Phone aria-hidden size={16} strokeWidth={1.7} />}
                className="col-span-2 sm:col-span-1"
              />
              <ContactValue
                label="Email"
                value={request.contact.email || ""}
                href={request.contact.email ? `mailto:${request.contact.email}` : undefined}
                icon={<Mail aria-hidden size={16} strokeWidth={1.7} />}
                emptyLabel="—"
                className="col-span-2 sm:col-span-1"
              />
              <div className="min-w-0">
                <dt className="text-sm font-medium text-muted">Giorno</dt>
                <dd className="mt-1 text-base font-semibold text-ink">
                  {request.contact.preferredDate
                    ? formatDate(request.contact.preferredDate)
                    : "Non indicato"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-sm font-medium text-muted">Fascia</dt>
                <dd className="mt-1 text-base font-semibold text-ink">
                  {request.contact.preferredWindow}
                </dd>
              </div>
              <div className="col-span-2 min-w-0 sm:col-span-1">
                <dt className="text-sm font-medium text-muted">Canale</dt>
                <dd className="mt-1 text-base font-semibold text-ink">
                  {preferredContactLabel(request.contact.preferredContact)}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="grid xl:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]">
          <div className="px-4 py-5 sm:px-5 xl:border-r xl:border-line">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-accent">
                Risposte del cliente
              </p>
              <span className="text-sm font-medium text-muted">{answerEntries.length}</span>
            </div>
            <dl className="mt-4 divide-y divide-line border-t border-line">
              {answerEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-1.5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.85fr)] sm:gap-6"
                >
                  <dt className="text-sm leading-relaxed text-muted">
                    {mainTreatment
                      ? (getConsultationQuestion(mainTreatment.category, key)?.prompt ?? key)
                      : key}
                  </dt>
                  <dd className="text-base font-semibold leading-relaxed text-ink sm:text-right">
                    {mainTreatment
                      ? getConsultationAnswerLabel(mainTreatment.category, key, value)
                      : value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="px-4 py-5 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-accent">
                Nota interna
              </p>
              <span className="text-sm tabular-nums text-muted">{noteDraft.length} / 600</span>
            </div>
            <label className="mt-3 block">
              <span className="sr-only">Nota interna</span>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                maxLength={600}
                rows={3}
                placeholder="Aggiungi una nota operativa…"
                className="min-h-24 w-full resize-y border border-line bg-canvas p-3 text-base leading-relaxed text-ink outline-none focus:border-accent"
              />
            </label>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-sm text-muted">
                {noteDirty
                  ? "Modifiche non salvate"
                  : request.note
                    ? "Nota salvata"
                    : "Nessuna nota"}
              </span>
              <button
                type="button"
                disabled={saving || !noteDirty}
                onClick={() => void saveNote()}
                className="action-primary inline-flex min-h-12 items-center justify-center border border-ink bg-ink px-5 text-base font-semibold text-white disabled:opacity-40"
              >
                {saving && noteDirty ? "Salvataggio…" : "Salva nota"}
              </button>
            </div>
          </div>
        </section>

        <section
          data-admin-management-actions
          className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5"
        >
          <div className="max-w-2xl">
            <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-accent">
              Gestione richiesta
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Modifica i dati operativi oppure elimina definitivamente la richiesta. Per conservarne
              lo storico, usa lo stato Archiviata.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={openEdit}
              disabled={saving}
              className="interactive-control inline-flex min-h-11 items-center justify-center gap-2 border border-line px-3 text-sm font-medium text-ink hover:border-ink disabled:opacity-50"
            >
              <Pencil aria-hidden size={15} strokeWidth={1.7} />
              Modifica richiesta
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  disabled={saving}
                  className="interactive-control inline-flex min-h-11 items-center justify-center gap-2 px-3 text-sm text-accent-strong hover:text-accent disabled:opacity-50"
                >
                  <Trash2 aria-hidden size={15} strokeWidth={1.7} />
                  Elimina richiesta
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-line bg-canvas text-ink sm:rounded-none">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display text-2xl font-normal">
                    Eliminare questa richiesta?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="leading-relaxed text-muted">
                    Questa operazione rimuove definitivamente la richiesta di {request.contact.name}
                    . Non può essere annullata.
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
          </div>
        </section>
      </div>

      <Dialog
        open={editing}
        onOpenChange={(open) => {
          if (open) resetEditDraft();
          setEditing(open);
        }}
      >
        <DialogContent className="max-h-[92dvh] overflow-hidden rounded-none border-line bg-canvas p-4 text-ink sm:max-w-4xl sm:p-6">
          <DialogHeader className="sr-only">
            <DialogTitle>Modifica richiesta</DialogTitle>
            <DialogDescription>
              Aggiorna i dati operativi senza modificare le risposte originali.
            </DialogDescription>
          </DialogHeader>
          <RequestEditForm
            request={request}
            contact={contactDraft}
            complementarySlugs={complementaryDraft}
            saving={saving}
            onContact={setContactDraft}
            onToggleComplementary={toggleComplementary}
            onSave={() => void saveEdit()}
          />
        </DialogContent>
      </Dialog>
    </div>
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
  const [serviceQuery, setServiceQuery] = useState("");
  const mainTreatment = getTreatment(request.serviceSlug);
  const complementaryOptions = treatments.filter(
    (treatment) => treatment.slug !== request.serviceSlug,
  );
  const selectedOptions = complementaryOptions.filter((treatment) =>
    complementarySlugs.includes(treatment.slug),
  );
  const normalizedQuery = serviceQuery.trim().toLocaleLowerCase("it");
  const availableOptions = complementaryOptions.filter(
    (treatment) =>
      !complementarySlugs.includes(treatment.slug) &&
      (!normalizedQuery || treatment.name.toLocaleLowerCase("it").includes(normalizedQuery)),
  );
  const selectionLimitReached = complementarySlugs.length >= MAX_CONSULTATION_SELECTED_SERVICES - 1;

  function renderServiceOption(treatment: (typeof treatments)[number], active: boolean) {
    const disabled = !active && selectionLimitReached;
    return (
      <label
        key={treatment.slug}
        className={cn(
          "flex min-h-12 items-center justify-between gap-3 border px-3 py-2.5 text-base",
          active ? "border-accent bg-surface" : "border-line bg-canvas",
          disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            disabled={disabled}
            onChange={() => onToggleComplementary(treatment.slug)}
            className="h-4 w-4 shrink-0 accent-accent"
          />
          <span className="min-w-0 truncate">{treatment.name}</span>
        </span>
        <span className="shrink-0 text-sm text-muted">{treatment.priceLabel}</span>
      </label>
    );
  }

  return (
    <section
      aria-labelledby="edit-request-heading"
      className="flex max-h-[calc(92dvh-2rem)] min-h-0 flex-col sm:max-h-[calc(92dvh-3rem)]"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <div className="flex items-start justify-between gap-4 pr-8">
          <div>
            <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-accent">
              Modifica
            </p>
            <h3 id="edit-request-heading" className="mt-2 font-display text-3xl text-ink">
              Dati operativi
            </h3>
          </div>
          <span className="hidden max-w-56 pt-1 text-right text-sm leading-relaxed text-muted sm:block">
            Le risposte originali restano invariate.
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted sm:hidden">
          Le risposte originali restano invariate.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-5">
          <label className="col-span-2 block">
            <span className="text-base font-medium text-ink">Nome e cognome</span>
            <input
              value={contact.name}
              onChange={(event) => onContact({ ...contact, name: event.target.value })}
              className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-base text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="col-span-2 block sm:col-span-1">
            <span className="text-base font-medium text-ink">Telefono</span>
            <input
              value={contact.phone}
              onChange={(event) => onContact({ ...contact, phone: event.target.value })}
              inputMode="tel"
              className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-base text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="col-span-2 block sm:col-span-1">
            <span className="text-base font-medium text-ink">Email</span>
            <input
              type="email"
              value={contact.email ?? ""}
              onChange={(event) => onContact({ ...contact, email: event.target.value })}
              className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-base text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block min-w-0">
            <span className="text-base font-medium text-ink">Canale preferito</span>
            <select
              value={contact.preferredContact}
              onChange={(event) =>
                onContact({ ...contact, preferredContact: event.target.value as PreferredContact })
              }
              className="mt-2 min-h-12 w-full border border-line bg-canvas px-3 text-base text-ink outline-none focus:border-accent sm:px-4"
            >
              <option value="phone">Telefono</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>
          </label>
          <label className="block min-w-0">
            <span className="text-base font-medium text-ink">Giorno preferito</span>
            <input
              type="date"
              value={contact.preferredDate ?? ""}
              onChange={(event) => onContact({ ...contact, preferredDate: event.target.value })}
              className="mt-2 min-h-12 w-full border border-line bg-canvas px-3 text-base text-ink outline-none focus:border-accent sm:px-4"
            />
          </label>
          <label className="col-span-2 block">
            <span className="text-base font-medium text-ink">Fascia preferita</span>
            <select
              value={contact.preferredWindow}
              onChange={(event) => onContact({ ...contact, preferredWindow: event.target.value })}
              className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-base text-ink outline-none focus:border-accent"
            >
              {consultationWindows.map((windowLabel) => (
                <option key={windowLabel} value={windowLabel}>
                  {windowLabel}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <p className="text-base font-semibold text-ink">Servizi richiesti</p>
          <div className="mt-2 flex items-center justify-between gap-4 border border-line bg-surface px-4 py-3 text-base">
            <span className="min-w-0 truncate">{mainTreatment?.name ?? request.serviceSlug}</span>
            {mainTreatment ? (
              <span className="shrink-0 text-muted">{mainTreatment.priceLabel}</span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Il servizio principale resta invariato. Puoi aggiornare soltanto i servizi aggiunti,
            fino al limite previsto per il percorso.
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.1em] text-accent">
                Selezionati
              </p>
              <span className="text-sm tabular-nums text-muted">
                {complementarySlugs.length} / {MAX_CONSULTATION_SELECTED_SERVICES - 1}
              </span>
            </div>
            {selectedOptions.length ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {selectedOptions.map((treatment) => renderServiceOption(treatment, true))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">Nessun servizio aggiunto.</p>
            )}
          </div>

          <div className="mt-5 border-t border-line pt-5">
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.1em] text-accent">
                Aggiungi altri servizi
              </span>
              <input
                type="search"
                value={serviceQuery}
                onChange={(event) => setServiceQuery(event.target.value)}
                placeholder="Cerca servizio…"
                className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-base text-ink outline-none focus:border-accent"
              />
            </label>

            {selectionLimitReached ? (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Hai raggiunto il numero massimo di servizi aggiunti. Deselezionane uno per
                sostituirlo.
              </p>
            ) : null}

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {availableOptions.length ? (
                availableOptions.map((treatment) => renderServiceOption(treatment, false))
              ) : (
                <p className="py-3 text-base text-muted sm:col-span-2">
                  {normalizedQuery
                    ? "Nessun servizio trovato."
                    : "Tutti i servizi sono già selezionati."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-line bg-canvas pt-3">
        <span className="text-sm text-muted">{complementarySlugs.length} servizi aggiunti</span>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="action-primary inline-flex min-h-12 items-center justify-center border border-ink bg-ink px-5 text-base font-semibold text-white hover:border-accent-strong hover:bg-accent-strong disabled:opacity-50"
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
  className,
}: {
  label: string;
  value: string;
  href?: string;
  icon: ReactNode;
  emptyLabel?: string;
  className?: string;
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
    <div className={cn("min-w-0", className)}>
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="mt-1 flex min-w-0 items-center gap-2">
        {value && href ? (
          <a
            href={href}
            className="inline-flex min-w-0 max-w-full items-center gap-2 text-base font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent motion-reduce:transition-none"
          >
            <span className="shrink-0 text-accent">{icon}</span>
            <span className="min-w-0 break-words">{value}</span>
          </a>
        ) : (
          <span className="text-base font-medium text-ink">{value || emptyLabel}</span>
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
