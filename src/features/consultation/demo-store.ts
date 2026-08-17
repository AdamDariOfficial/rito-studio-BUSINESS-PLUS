import { getTreatment } from "@/data/treatments";
import {
  consultationRequestListSchema,
  consultationRequestSchema,
  consultationSubmissionSchema,
} from "./schemas";
import type { ConsultationRequest, ConsultationStatus, ConsultationSubmission } from "./types";

const REQUESTS_KEY = "rito-business-plus:consultation-requests:v1";
const SNAPSHOT_KEY = "rito-business-plus:consultation-snapshot:v1";
const CHANGE_EVENT = "rito-business-plus:consultation-change";

const demoSeed: ConsultationRequest[] = [
  {
    id: "demo-giulia",
    createdAt: "2026-08-09T09:15:00.000Z",
    updatedAt: "2026-08-09T09:15:00.000Z",
    version: 1,
    serviceSlug: "rituale-viso",
    answers: { goal: "cura", pace: "completo", timing: "due-settimane" },
    recommendedSlugs: ["trattamento-illuminante"],
    selectedServiceSlugs: ["rituale-viso", "trattamento-illuminante"],
    contact: {
      name: "Giulia Demo",
      phone: "+39 333 000 0001",
      email: "giulia.demo@example.test",
      preferredContact: "phone",
      preferredDate: "2026-08-18",
      preferredWindow: "Tardo pomeriggio",
    },
    consent: true,
    status: "new",
    note: "",
    source: "demo",
  },
  {
    id: "demo-elena",
    createdAt: "2026-08-08T13:40:00.000Z",
    updatedAt: "2026-08-08T13:40:00.000Z",
    version: 1,
    serviceSlug: "taglio-essenziale",
    answers: { goal: "mantenimento", pace: "essenziale", timing: "presto" },
    recommendedSlugs: ["trattamento-texture"],
    selectedServiceSlugs: ["taglio-essenziale"],
    contact: {
      name: "Elena Demo",
      phone: "+39 333 000 0002",
      email: "",
      preferredContact: "whatsapp",
      preferredDate: "2026-08-14",
      preferredWindow: "Primo pomeriggio",
    },
    consent: true,
    status: "contacted",
    note: "Fixture dimostrativa.",
    source: "demo",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function emitChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function readRaw(): ConsultationRequest[] {
  if (!isBrowser()) return demoSeed;
  const raw = window.localStorage.getItem(REQUESTS_KEY);

  if (!raw) {
    writeRaw(demoSeed);
    return demoSeed;
  }

  try {
    return consultationRequestListSchema.parse(JSON.parse(raw));
  } catch {
    writeRaw(demoSeed);
    return demoSeed;
  }
}

function writeRaw(requests: ConsultationRequest[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export function listDemoConsultations() {
  return readRaw().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createDemoConsultation(input: ConsultationSubmission) {
  const parsed = consultationSubmissionSchema.parse(input);
  const record = consultationRequestSchema.parse({
    ...parsed,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    status: "new",
    note: "",
    source: "demo",
  });

  writeRaw([record, ...readRaw()]);
  emitChange();
  return record;
}

export function updateDemoConsultation(
  id: string,
  update: { status?: ConsultationStatus; note?: string },
) {
  const next = readRaw().map((request) =>
    request.id === id
      ? consultationRequestSchema.parse({
          ...request,
          ...update,
          updatedAt: new Date().toISOString(),
          version: request.version + 1,
        })
      : request,
  );
  writeRaw(next);
  emitChange();
  return next.find((request) => request.id === id);
}

export function editDemoConsultation(
  id: string,
  update: Pick<ConsultationRequest, "selectedServiceSlugs" | "contact">,
) {
  const next = readRaw().map((request) =>
    request.id === id
      ? consultationRequestSchema.parse({
          ...request,
          ...update,
          updatedAt: new Date().toISOString(),
          version: request.version + 1,
        })
      : request,
  );
  writeRaw(next);
  emitChange();
  return next.find((request) => request.id === id);
}

export function deleteDemoConsultation(id: string) {
  const current = readRaw();
  const next = current.filter((request) => request.id !== id);
  if (next.length === current.length) return false;
  writeRaw(next);
  emitChange();
  return true;
}

export function subscribeDemoConsultations(callback: () => void) {
  if (!isBrowser()) return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === REQUESTS_KEY || event.key === SNAPSHOT_KEY) callback();
  };
  const onChange = () => callback();

  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function saveDemoSnapshot() {
  if (!isBrowser()) return false;
  window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(readRaw()));
  emitChange();
  return true;
}

export function restoreDemoSnapshot() {
  if (!isBrowser()) return false;
  const raw = window.localStorage.getItem(SNAPSHOT_KEY);
  if (!raw) return false;

  try {
    const parsed = consultationRequestListSchema.parse(JSON.parse(raw));
    writeRaw(parsed);
    emitChange();
    return true;
  } catch {
    return false;
  }
}

export function resetDemoConsultations() {
  writeRaw(demoSeed);
  emitChange();
}

export function exportDemoState() {
  return JSON.stringify({ requests: readRaw() }, null, 2);
}

export function importDemoState(raw: string) {
  const parsed = JSON.parse(raw) as unknown;
  const requests = consultationRequestListSchema.parse(
    typeof parsed === "object" && parsed !== null && "requests" in parsed
      ? (parsed as { requests: unknown }).requests
      : parsed,
  );
  writeRaw(requests);
  emitChange();
}

export function getConsultationServiceLabel(request: ConsultationRequest) {
  return getTreatment(request.serviceSlug)?.name ?? request.serviceSlug;
}
