-- InCTRL drop waitlist: the only waitlist table.
-- Holds durable consented entries and transient, digest-only rate-limit records.
-- Apply once per Neon environment (for example, in the Neon SQL editor) before accepting signups.
-- gen_random_uuid() is built into PostgreSQL 13+.

BEGIN;

CREATE TABLE IF NOT EXISTS waitlist_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_kind text NOT NULL
    CHECK (record_kind IN ('entry', 'source_limit', 'email_limit')),

  -- Entry fields (record_kind = 'entry').
  normalized_email text,
  consent_version text,
  consented_at timestamptz,

  -- Limiter fields (record_kind IN ('source_limit', 'email_limit')).
  -- rate_limit_key is a 64-character HMAC-SHA-256 hex digest; no raw source or email is stored.
  rate_limit_key char(64),
  window_started_at timestamptz,
  attempt_count smallint,

  created_at timestamptz NOT NULL DEFAULT now(),
  -- Entries: created_at + 12 months. Limiter rows: end of the anchored ten-minute window.
  expires_at timestamptz NOT NULL,

  CONSTRAINT waitlist_records_shape CHECK (
    (
      record_kind = 'entry'
      AND normalized_email IS NOT NULL
      AND char_length(normalized_email) BETWEEN 3 AND 254
      AND btrim(normalized_email) = normalized_email
      AND consent_version IS NOT NULL
      AND consented_at IS NOT NULL
      AND rate_limit_key IS NULL
      AND window_started_at IS NULL
      AND attempt_count IS NULL
    )
    OR
    (
      record_kind IN ('source_limit', 'email_limit')
      AND normalized_email IS NULL
      AND consent_version IS NULL
      AND consented_at IS NULL
      AND rate_limit_key IS NOT NULL
      AND window_started_at IS NOT NULL
      AND attempt_count IS NOT NULL
      AND attempt_count > 0
    )
  )
);

-- Sole authority for email uniqueness among entries.
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_records_entry_email_unique
  ON waitlist_records (normalized_email)
  WHERE record_kind = 'entry';

-- One limiter row per digest key and limiter kind.
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_records_limit_key_unique
  ON waitlist_records (record_kind, rate_limit_key)
  WHERE record_kind IN ('source_limit', 'email_limit');

-- Retention and limiter cleanup.
CREATE INDEX IF NOT EXISTS waitlist_records_expiry
  ON waitlist_records (expires_at);

COMMIT;
