import { consultationRequestSchema } from "../schemas";
import type { ConsultationRequest } from "../types";
import type {
  ConsultationCreateInput,
  ConsultationEditInput,
  ConsultationRepository,
  ConsultationUpdateInput,
} from "./contracts";
import { requireLiveBinding, type D1DatabaseBinding } from "./cloudflare-env.server";

type ConsultationRow = {
  id: string;
  submission_key: string;
  created_at: string;
  updated_at: string;
  version: number;
  status: string;
  service_slug: string;
  answers_json: string;
  recommended_slugs_json: string;
  selected_slugs_json: string;
  name: string;
  phone: string;
  email: string;
  preferred_contact: string;
  preferred_date: string;
  preferred_window: string;
  consent_at: string;
  privacy_version: string;
  note: string;
};

const SELECT_COLUMNS = `
  id, submission_key, created_at, updated_at, version, status, service_slug,
  answers_json, recommended_slugs_json, selected_slugs_json,
  name, phone, email, preferred_contact, preferred_date, preferred_window,
  consent_at, privacy_version, note
`;

function database() {
  return requireLiveBinding("CONSULTATION_DB") as D1DatabaseBinding;
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mapRow(row: ConsultationRow): ConsultationRequest {
  return consultationRequestSchema.parse({
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
    serviceSlug: row.service_slug,
    answers: parseJson(row.answers_json, {}),
    recommendedSlugs: parseJson(row.recommended_slugs_json, []),
    selectedServiceSlugs: parseJson(row.selected_slugs_json, []),
    contact: {
      name: row.name,
      phone: row.phone,
      email: row.email,
      preferredContact: row.preferred_contact,
      preferredDate: row.preferred_date,
      preferredWindow: row.preferred_window,
    },
    consent: true,
    status: row.status,
    note: row.note,
    source: "live",
  });
}

async function getById(db: D1DatabaseBinding, id: string) {
  const row = await db
    .prepare(`SELECT ${SELECT_COLUMNS} FROM consultation_requests WHERE id = ? LIMIT 1`)
    .bind(id)
    .first<ConsultationRow>();
  return row ? mapRow(row) : null;
}

async function getBySubmissionKey(db: D1DatabaseBinding, submissionKey: string) {
  const row = await db
    .prepare(`SELECT ${SELECT_COLUMNS} FROM consultation_requests WHERE submission_key = ? LIMIT 1`)
    .bind(submissionKey)
    .first<ConsultationRow>();
  return row ? mapRow(row) : null;
}

async function requireUpdatedRecord(
  db: D1DatabaseBinding,
  id: string,
  expectedVersion: number,
  changes: number,
) {
  if (changes > 0) {
    const request = await getById(db, id);
    if (!request) throw new Error("Richiesta non trovata dopo l'aggiornamento.");
    return request;
  }

  const existing = await getById(db, id);
  if (!existing) throw new Error("Richiesta non trovata.");
  if (existing.version !== expectedVersion) {
    throw new Error("La richiesta è stata aggiornata da un altro dispositivo. Ricarica e riprova.");
  }
  throw new Error("La richiesta non è stata aggiornata.");
}

export const d1ConsultationRepository: ConsultationRepository = {
  async create({ submissionKey, submission, consentAt, privacyVersion }) {
    const db = database();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const result = await db
      .prepare(
        `INSERT INTO consultation_requests (
          id, submission_key, created_at, updated_at, version, status, service_slug,
          answers_json, recommended_slugs_json, selected_slugs_json,
          name, phone, email, preferred_contact, preferred_date, preferred_window,
          consent_at, privacy_version, note
        ) VALUES (?, ?, ?, ?, 1, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '')
        ON CONFLICT(submission_key) DO NOTHING`,
      )
      .bind(
        id,
        submissionKey,
        now,
        now,
        submission.serviceSlug,
        JSON.stringify(submission.answers),
        JSON.stringify(submission.recommendedSlugs),
        JSON.stringify(submission.selectedServiceSlugs),
        submission.contact.name,
        submission.contact.phone,
        submission.contact.email ?? "",
        submission.contact.preferredContact,
        submission.contact.preferredDate ?? "",
        submission.contact.preferredWindow,
        consentAt,
        privacyVersion,
      )
      .run();

    const request = await getBySubmissionKey(db, submissionKey);
    if (!request) throw new Error("La richiesta non è stata persistita.");
    return { request, created: (result.meta?.changes ?? 0) > 0 };
  },

  async list() {
    const result = await database()
      .prepare(
        `SELECT ${SELECT_COLUMNS} FROM consultation_requests ORDER BY created_at DESC LIMIT 1000`,
      )
      .all<ConsultationRow>();
    return (result.results ?? []).map(mapRow);
  },

  async get(id) {
    return getById(database(), id);
  },

  async getBySubmissionKey(submissionKey) {
    return getBySubmissionKey(database(), submissionKey);
  },

  async update(input: ConsultationUpdateInput) {
    const db = database();
    const current = await getById(db, input.id);
    if (!current) throw new Error("Richiesta non trovata.");
    if (current.version !== input.expectedVersion) {
      throw new Error(
        "La richiesta è stata aggiornata da un altro dispositivo. Ricarica e riprova.",
      );
    }

    const status = input.status ?? current.status;
    const note = input.note ?? current.note;
    const updatedAt = new Date().toISOString();
    const result = await db
      .prepare(
        `UPDATE consultation_requests
         SET status = ?, note = ?, updated_at = ?, version = version + 1
         WHERE id = ? AND version = ?`,
      )
      .bind(status, note, updatedAt, input.id, input.expectedVersion)
      .run();

    return requireUpdatedRecord(db, input.id, input.expectedVersion, result.meta?.changes ?? 0);
  },

  async edit(input: ConsultationEditInput) {
    const db = database();
    const current = await getById(db, input.id);
    if (!current) throw new Error("Richiesta non trovata.");
    if (current.version !== input.expectedVersion) {
      throw new Error(
        "La richiesta è stata aggiornata da un altro dispositivo. Ricarica e riprova.",
      );
    }
    if (!input.selectedServiceSlugs.includes(current.serviceSlug)) {
      throw new Error("Il servizio principale originale non può essere rimosso.");
    }

    const updatedAt = new Date().toISOString();
    const result = await db
      .prepare(
        `UPDATE consultation_requests
         SET selected_slugs_json = ?, name = ?, phone = ?, email = ?, preferred_contact = ?,
             preferred_date = ?, preferred_window = ?, updated_at = ?, version = version + 1
         WHERE id = ? AND version = ?`,
      )
      .bind(
        JSON.stringify(input.selectedServiceSlugs),
        input.contact.name,
        input.contact.phone,
        input.contact.email ?? "",
        input.contact.preferredContact,
        input.contact.preferredDate ?? "",
        input.contact.preferredWindow,
        updatedAt,
        input.id,
        input.expectedVersion,
      )
      .run();

    return requireUpdatedRecord(db, input.id, input.expectedVersion, result.meta?.changes ?? 0);
  },

  async delete(id, expectedVersion) {
    const db = database();
    const result = await db
      .prepare("DELETE FROM consultation_requests WHERE id = ? AND version = ?")
      .bind(id, expectedVersion)
      .run();
    if ((result.meta?.changes ?? 0) > 0) return;

    const existing = await getById(db, id);
    if (!existing) throw new Error("Richiesta non trovata.");
    throw new Error("La richiesta è stata aggiornata da un altro dispositivo. Ricarica e riprova.");
  },
};
