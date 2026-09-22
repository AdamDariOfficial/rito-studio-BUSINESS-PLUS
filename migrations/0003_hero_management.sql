CREATE TABLE hero_slides (
  id TEXT PRIMARY KEY NOT NULL,
  eyebrow TEXT NOT NULL,
  title TEXT NOT NULL,
  accent TEXT NOT NULL,
  trailing TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  image_ref TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  primary_cta_json TEXT NOT NULL,
  secondary_cta_json TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  starts_at TEXT NOT NULL DEFAULT '',
  ends_at TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1)
);

CREATE INDEX idx_hero_slides_status_order
  ON hero_slides(status, sort_order);

INSERT INTO hero_slides (
  id, eyebrow, title, accent, trailing, body, image_ref, image_alt,
  primary_cta_json, secondary_cta_json, status, starts_at, ends_at,
  sort_order, created_at, updated_at, version
) VALUES
(
  'hero-ritmo',
  'Beauty & Care Atelier · Padova',
  'La bellezza,',
  'nel suo ritmo.',
  '',
  'Un atelier contemporaneo dedicato a capelli, pelle e benessere. Trattamenti su misura, gesti precisi e il tempo necessario per ascoltarti.',
  '/images/rito/rito-hero-main.webp',
  'Professionista durante un trattamento viso in atelier',
  '{"label":"Inizia la consulenza","target":"consultation"}',
  '{"label":"Scopri i trattamenti","target":"treatments"}',
  'published',
  '2000-01-01T00:00:00.000Z',
  '',
  0,
  '2000-01-01T00:00:00.000Z',
  '2000-01-01T00:00:00.000Z',
  1
),
(
  'hero-hair',
  'Hair · Forma · Movimento',
  'Il taglio segue,',
  'la tua identità.',
  '',
  'Taglio, colore e texture costruiti con ascolto e precisione, per un risultato leggibile anche nella quotidianità.',
  '/images/rito/rito-gallery-professional-01.webp',
  'Applicazione professionale del colore sui capelli',
  '{"label":"Trova il tuo percorso","target":"consultation"}',
  '{"label":"Vedi i trattamenti","target":"treatments"}',
  'published',
  '2000-01-01T00:00:00.000Z',
  '',
  1,
  '2000-01-01T00:00:00.000Z',
  '2000-01-01T00:00:00.000Z',
  1
),
(
  'hero-skin',
  'Skin · Rituals · Care',
  'Prendersi cura,',
  'senza fretta.',
  '',
  'Rituali essenziali per pelle e benessere, pensati per rallentare, ascoltare l''esigenza e scegliere solo ciò che serve.',
  '/images/rito/rito-gallery-skin-01.webp',
  'Trattamento viso eseguito con un gesto delicato',
  '{"label":"Inizia la consulenza","target":"consultation"}',
  '{"label":"Scopri lo studio","target":"studio"}',
  'published',
  '2000-01-01T00:00:00.000Z',
  '',
  2,
  '2000-01-01T00:00:00.000Z',
  '2000-01-01T00:00:00.000Z',
  1
);
