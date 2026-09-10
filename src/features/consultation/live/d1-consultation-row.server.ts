import { consultationRequestSchema } from "../schemas.ts";
import type { ConsultationRequest } from "../types.ts";

export type ConsultationRow = {
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

export type InvalidConsultationRowDiagnostic = {
  event: "consultation.invalid_legacy_row";
  classification: "DATA_VALIDATION_FAILURE";
  rowFingerprint: string;
  createdAt?: string;
  version?: number;
  issues: string[];
};

type InvalidRowReporter = (diagnostic: InvalidConsultationRowDiagnostic) => void | Promise<void>;

export class ConsultationRowDataValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super("Stored consultation row failed domain validation.");
    this.name = "ConsultationRowDataValidationError";
    this.issues = issues;
  }
}

function parseStoredJson(raw: string, field: string) {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new ConsultationRowDataValidationError([`${field}:invalid_json`]);
  }
}

export function parseConsultationRow(row: ConsultationRow): ConsultationRequest {
  const parsed = consultationRequestSchema.safeParse({
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
    serviceSlug: row.service_slug,
    answers: parseStoredJson(row.answers_json, "answers_json"),
    recommendedSlugs: parseStoredJson(row.recommended_slugs_json, "recommended_slugs_json"),
    selectedServiceSlugs: parseStoredJson(row.selected_slugs_json, "selected_slugs_json"),
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

  if (!parsed.success) {
    throw new ConsultationRowDataValidationError(
      parsed.error.issues.map((issue) => `${issue.path.join(".")}:${issue.code}`).sort(),
    );
  }

  return parsed.data;
}

async function rowFingerprint(row: ConsultationRow) {
  const bytes = new TextEncoder().encode(`${row.id}\u0000${row.submission_key}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest).slice(0, 16), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}

function safeCreatedAt(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) &&
    Number.isFinite(Date.parse(value))
    ? value
    : undefined;
}

async function createInvalidRowDiagnostic(
  row: ConsultationRow,
  error: ConsultationRowDataValidationError,
): Promise<InvalidConsultationRowDiagnostic> {
  const createdAt = safeCreatedAt(row.created_at);
  const version = Number.isInteger(row.version) && row.version > 0 ? row.version : undefined;
  return {
    event: "consultation.invalid_legacy_row",
    classification: "DATA_VALIDATION_FAILURE",
    rowFingerprint: await rowFingerprint(row),
    ...(createdAt ? { createdAt } : {}),
    ...(version ? { version } : {}),
    issues: error.issues,
  };
}

function reportInvalidRow(diagnostic: InvalidConsultationRowDiagnostic) {
  console.warn(JSON.stringify(diagnostic));
}

export async function listValidConsultationRows(
  loadRows: () => Promise<ConsultationRow[]>,
  report: InvalidRowReporter = reportInvalidRow,
): Promise<ConsultationRequest[]> {
  const rows = await loadRows();
  if (!Array.isArray(rows)) throw new Error("D1 consultation query returned an invalid result.");

  const validRows: ConsultationRequest[] = [];
  for (const row of rows) {
    try {
      validRows.push(parseConsultationRow(row));
    } catch (error) {
      if (!(error instanceof ConsultationRowDataValidationError)) throw error;
      await report(await createInvalidRowDiagnostic(row, error));
    }
  }
  return validRows;
}
