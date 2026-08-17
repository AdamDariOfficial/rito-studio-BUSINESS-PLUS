CREATE TABLE consultation_requests (
  id TEXT PRIMARY KEY NOT NULL,
  submission_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'archived')),
  service_slug TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  recommended_slugs_json TEXT NOT NULL,
  selected_slugs_json TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  preferred_contact TEXT NOT NULL CHECK (preferred_contact IN ('phone', 'whatsapp', 'email')),
  preferred_date TEXT NOT NULL DEFAULT '',
  preferred_window TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_consultation_requests_created_at
  ON consultation_requests(created_at DESC);

CREATE INDEX idx_consultation_requests_status_created_at
  ON consultation_requests(status, created_at DESC);
