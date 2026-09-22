import { heroCtaSchema, heroSlideSchema, type HeroSlide } from "../model";
import {
  requireLiveBinding,
  type D1DatabaseBinding,
} from "../../consultation/live/cloudflare-env.server";

const SELECT_COLUMNS = `
  id, eyebrow, title, accent, trailing, body, image_ref, image_alt,
  primary_cta_json, secondary_cta_json, status, starts_at, ends_at,
  sort_order, version
`;

type HeroRow = {
  id: string;
  eyebrow: string;
  title: string;
  accent: string;
  trailing: string;
  body: string;
  image_ref: string;
  image_alt: string;
  primary_cta_json: string;
  secondary_cta_json: string | null;
  status: "draft" | "published" | "archived";
  starts_at: string;
  ends_at: string;
  sort_order: number;
  version: number;
};

function database() {
  return requireLiveBinding("CONSULTATION_DB") as D1DatabaseBinding;
}

function parseRow(row: HeroRow) {
  return heroSlideSchema.parse({
    id: row.id,
    eyebrow: row.eyebrow,
    title: row.title,
    accent: row.accent,
    trailing: row.trailing,
    body: row.body,
    imageRef: row.image_ref,
    imageAlt: row.image_alt,
    primaryCta: heroCtaSchema.parse(JSON.parse(row.primary_cta_json)),
    secondaryCta: row.secondary_cta_json
      ? heroCtaSchema.parse(JSON.parse(row.secondary_cta_json))
      : null,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    order: Number(row.sort_order),
    version: Number(row.version),
  });
}

async function listAdminRows() {
  const result = await database()
    .prepare(`SELECT ${SELECT_COLUMNS} FROM hero_slides ORDER BY sort_order ASC, id ASC LIMIT 5`)
    .all<HeroRow>();
  if (!Array.isArray(result.results)) throw new Error("D1 hero query returned an invalid result.");
  return result.results.map(parseRow);
}

async function getById(id: string) {
  const row = await database()
    .prepare(`SELECT ${SELECT_COLUMNS} FROM hero_slides WHERE id = ? LIMIT 1`)
    .bind(id)
    .first<HeroRow>();
  return row ? parseRow(row) : null;
}

async function countOtherPublished(id: string) {
  const row = await database()
    .prepare("SELECT COUNT(*) AS count FROM hero_slides WHERE status = 'published' AND id <> ?")
    .bind(id)
    .first<{ count: number }>();
  return Number(row?.count ?? 0);
}

export const d1HeroRepository = {
  async listAdmin() {
    return listAdminRows();
  },

  async listPublic(nowIso: string) {
    const result = await database()
      .prepare(
        `SELECT ${SELECT_COLUMNS}
         FROM hero_slides
         WHERE status = 'published'
           AND starts_at <> ''
           AND starts_at <= ?
           AND (ends_at = '' OR ends_at > ?)
         ORDER BY sort_order ASC, id ASC
         LIMIT 5`,
      )
      .bind(nowIso, nowIso)
      .all<HeroRow>();
    if (!Array.isArray(result.results))
      throw new Error("D1 public hero query returned an invalid result.");
    return result.results.map(parseRow);
  },

  async create(input: Omit<HeroSlide, "id" | "order" | "version">) {
    const db = database();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const result = await db
      .prepare(
        `INSERT INTO hero_slides (
          id, eyebrow, title, accent, trailing, body, image_ref, image_alt,
          primary_cta_json, secondary_cta_json, status, starts_at, ends_at,
          sort_order, created_at, updated_at, version
        )
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
               COALESCE((SELECT MAX(sort_order) + 1 FROM hero_slides), 0), ?, ?, 1
        WHERE (SELECT COUNT(*) FROM hero_slides) < 5`,
      )
      .bind(
        id,
        input.eyebrow,
        input.title,
        input.accent,
        input.trailing,
        input.body,
        input.imageRef,
        input.imageAlt,
        JSON.stringify(input.primaryCta),
        input.secondaryCta ? JSON.stringify(input.secondaryCta) : null,
        input.status,
        input.startsAt,
        input.endsAt,
        now,
        now,
      )
      .run();
    if ((result.meta?.changes ?? 0) === 0) {
      throw new Error("Puoi gestire al massimo 5 schermate hero.");
    }
    const created = await getById(id);
    if (!created) throw new Error("La schermata hero non è stata persistita.");
    return created;
  },

  async update(
    id: string,
    expectedVersion: number,
    input: Omit<HeroSlide, "id" | "order" | "version">,
  ) {
    const db = database();
    const current = await getById(id);
    if (!current) throw new Error("Schermata hero non trovata.");
    if (current.version !== expectedVersion) {
      throw new Error("La hero è stata aggiornata da un altro dispositivo. Ricarica e riprova.");
    }

    const now = new Date().toISOString();
    const result = await db
      .prepare(
        `UPDATE hero_slides
         SET eyebrow = ?, title = ?, accent = ?, trailing = ?, body = ?,
             image_ref = ?, image_alt = ?, primary_cta_json = ?, secondary_cta_json = ?,
             status = ?, starts_at = ?, ends_at = ?, updated_at = ?, version = version + 1
         WHERE id = ? AND version = ?
           AND (
             status <> 'published'
             OR ? = 'published'
             OR (SELECT COUNT(*) FROM hero_slides WHERE status = 'published' AND id <> ?) > 0
           )`,
      )
      .bind(
        input.eyebrow,
        input.title,
        input.accent,
        input.trailing,
        input.body,
        input.imageRef,
        input.imageAlt,
        JSON.stringify(input.primaryCta),
        input.secondaryCta ? JSON.stringify(input.secondaryCta) : null,
        input.status,
        input.startsAt,
        input.endsAt,
        now,
        id,
        expectedVersion,
        input.status,
        id,
      )
      .run();
    if ((result.meta?.changes ?? 0) === 0) {
      const existing = await getById(id);
      if (!existing) throw new Error("Schermata hero non trovata.");
      if (existing.version !== expectedVersion) {
        throw new Error("La hero è stata aggiornata da un altro dispositivo. Ricarica e riprova.");
      }
      if (
        existing.status === "published" &&
        input.status !== "published" &&
        (await countOtherPublished(id)) === 0
      ) {
        throw new Error("Pubblica un'altra schermata prima di archiviare l'ultima pubblicata.");
      }
      throw new Error("La schermata hero non è stata aggiornata.");
    }
    const updated = await getById(id);
    if (!updated) throw new Error("Schermata hero non trovata dopo l'aggiornamento.");
    return updated;
  },

  async delete(id: string, expectedVersion: number) {
    const db = database();
    const result = await db
      .prepare(
        `DELETE FROM hero_slides
         WHERE id = ? AND version = ?
           AND (SELECT COUNT(*) FROM hero_slides) > 1
           AND (
             status <> 'published'
             OR (SELECT COUNT(*) FROM hero_slides WHERE status = 'published') > 1
           )`,
      )
      .bind(id, expectedVersion)
      .run();
    if ((result.meta?.changes ?? 0) > 0) return;

    const existing = await getById(id);
    if (!existing) throw new Error("Schermata hero non trovata.");
    if (existing.version !== expectedVersion) {
      throw new Error("La hero è stata aggiornata da un altro dispositivo. Ricarica e riprova.");
    }
    const rows = await listAdminRows();
    if (rows.length <= 1) throw new Error("La hero deve mantenere almeno una schermata.");
    if (existing.status === "published" && (await countOtherPublished(id)) === 0) {
      throw new Error("Pubblica un'altra schermata prima di eliminare l'ultima pubblicata.");
    }
    throw new Error("La schermata hero non è stata eliminata.");
  },

  async saveOrder(items: Array<{ id: string; order: number; expectedVersion: number }>) {
    const db = database();
    const orders = [...items.map((item) => item.order)].sort((a, b) => a - b);
    if (
      items.length < 1 ||
      items.length > 5 ||
      new Set(items.map((item) => item.id)).size !== items.length ||
      orders.some((order, index) => order !== index)
    ) {
      throw new Error("Ordine hero non valido.");
    }

    const now = new Date().toISOString();
    const cases = items.map(() => "WHEN ? THEN ?").join(" ");
    const idPlaceholders = items.map(() => "?").join(", ");
    const versionGuards = items.map(() => "(id = ? AND version = ?)").join(" OR ");
    const bindings: unknown[] = [];
    for (const item of items) bindings.push(item.id, item.order);
    bindings.push(now);
    for (const item of items) bindings.push(item.id);
    bindings.push(items.length);
    for (const item of items) bindings.push(item.id, item.expectedVersion);
    bindings.push(items.length);

    const result = await db
      .prepare(
        `UPDATE hero_slides
         SET sort_order = CASE id ${cases} ELSE sort_order END,
             updated_at = ?, version = version + 1
         WHERE id IN (${idPlaceholders})
           AND (SELECT COUNT(*) FROM hero_slides) = ?
           AND (
             SELECT COUNT(*) FROM hero_slides
             WHERE ${versionGuards}
           ) = ?`,
      )
      .bind(...bindings)
      .run();
    if ((result.meta?.changes ?? 0) !== items.length) {
      throw new Error("La hero è stata aggiornata da un altro dispositivo. Ricarica e riprova.");
    }
    return listAdminRows();
  },
};
