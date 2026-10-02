import "server-only";

import { createHmac } from "node:crypto";
import { isIP } from "node:net";

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

import { brand } from "@/lib/brand";
import { siteConfig } from "@/lib/site";
import { CONSENT_VERSION } from "@/lib/waitlist-state";
import type { FieldName, SubmissionState } from "@/lib/waitlist-state";

// Server-only waitlist workflow: origin and source gates, validation, keyed
// rate limiting, idempotent entry insert, and one sanitized log event.

const SOURCE_LIMIT_MAX = 5;
const EMAIL_LIMIT_MAX = 3;
const HONEYPOT_RETRY_MINUTES = 10;
const MAX_EMAIL_CODE_POINTS = 254;
const MAX_SOURCE_LENGTH = 64;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

const MESSAGES = {
  emailRequired: "Enter your email address.",
  emailInvalid: "Enter a valid email address, like name@example.com.",
  consentRequired: brand.messages.consentRequired,
  consentStale: "Please reload the page and try again.",
  validation: "Check the highlighted field.",
  success: brand.messages.success,
  duplicate: brand.messages.duplicate,
} as const;

const DELETE_EXPIRED_LIMITERS_SQL = `DELETE FROM waitlist_records
WHERE record_kind IN ('source_limit','email_limit') AND expires_at <= now()`;

const UPSERT_LIMITER_SQL = `INSERT INTO waitlist_records (record_kind, rate_limit_key, window_started_at, attempt_count, expires_at)
VALUES ($1, $2, now(), 1, now() + interval '10 minutes')
ON CONFLICT (record_kind, rate_limit_key) WHERE record_kind IN ('source_limit','email_limit')
DO UPDATE SET
  window_started_at = CASE WHEN waitlist_records.expires_at <= now() THEN now() ELSE waitlist_records.window_started_at END,
  attempt_count = CASE WHEN waitlist_records.expires_at <= now() THEN 1 ELSE LEAST(waitlist_records.attempt_count + 1, 32000) END,
  expires_at = CASE WHEN waitlist_records.expires_at <= now() THEN now() + interval '10 minutes' ELSE waitlist_records.expires_at END
RETURNING attempt_count, GREATEST(1, CEIL(EXTRACT(EPOCH FROM (expires_at - now())) / 60))::int AS retry_minutes`;

const INSERT_ENTRY_SQL = `INSERT INTO waitlist_records (record_kind, normalized_email, consent_version, consented_at, expires_at)
VALUES ('entry', $1, $2, now(), now() + interval '12 months')
ON CONFLICT (normalized_email) WHERE record_kind = 'entry' DO NOTHING
RETURNING id`;

const DELETE_ENTRY_SQL = `DELETE FROM waitlist_records WHERE record_kind = 'entry' AND normalized_email = $1`;

export interface HeaderReader {
  get(name: string): string | null;
}

export interface WaitlistSubmissionInput {
  readonly formData: FormData;
  readonly requestHeaders: HeaderReader;
  readonly requestId: string;
  readonly startedAt: number;
}

type Outcome =
  | "success"
  | "duplicate"
  | "validation-error"
  | "rate-limited"
  | "automated-rejection"
  | "service-error";

type Dependency = "abuse-control" | "database";

interface Evaluation {
  readonly state: SubmissionState;
  readonly outcome: Outcome;
  readonly dependency?: Dependency;
}

interface SubmittedFields {
  readonly email: string;
  readonly consent: string;
  readonly consentVersion: string;
  readonly company: string;
}

type PersistResult =
  | { readonly kind: "created" }
  | { readonly kind: "duplicate" }
  | { readonly kind: "rate-limited"; readonly retryMinutes: number }
  | { readonly kind: "failed"; readonly dependency: Dependency };

interface LimiterRow {
  readonly attempt_count: number | string;
  readonly retry_minutes: number | string;
}

interface QueryRunner {
  query<R extends Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: R[]; rowCount: number | null }>;
}

// ---------------------------------------------------------------------------
// Database access

/** Creates a Neon pool; callers must always `end()` it. */
export function createWaitlistPool(connectionString: string): Pool {
  if (typeof globalThis.WebSocket === "undefined") {
    neonConfig.webSocketConstructor = ws;
  }
  return new Pool({ connectionString });
}

// Capacity-one mutex: one database section per server instance at a time.
let mutexTail: Promise<void> = Promise.resolve();

async function acquireMutex(): Promise<() => void> {
  const previous = mutexTail;
  let release: (() => void) | undefined;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  mutexTail = previous.then(() => current);
  await previous;
  return () => {
    release?.();
  };
}

/** Returns retry minutes when the limit is exceeded, otherwise `undefined`. */
async function checkLimit(
  client: QueryRunner,
  kind: "source_limit" | "email_limit",
  key: string,
  max: number,
): Promise<number | undefined> {
  const result = await client.query<Record<string, unknown> & LimiterRow>(UPSERT_LIMITER_SQL, [
    kind,
    key,
  ]);
  const row = result.rows[0];
  if (row === undefined) {
    throw new Error("limiter upsert returned no row");
  }
  if (Number(row.attempt_count) <= max) {
    return undefined;
  }
  const minutes = Math.ceil(Number(row.retry_minutes));
  return Number.isFinite(minutes) && minutes >= 1 ? minutes : 1;
}

async function persistSubmission(
  connectionString: string,
  sourceKey: string,
  emailKey: string,
  normalizedEmail: string,
): Promise<PersistResult> {
  const pool = createWaitlistPool(connectionString);
  try {
    const client = await pool.connect();
    let phase: Dependency = "database";
    try {
      await client.query("BEGIN");
      phase = "abuse-control";
      await client.query(DELETE_EXPIRED_LIMITERS_SQL);

      const sourceRetry = await checkLimit(client, "source_limit", sourceKey, SOURCE_LIMIT_MAX);
      if (sourceRetry !== undefined) {
        await client.query("COMMIT");
        return { kind: "rate-limited", retryMinutes: sourceRetry };
      }
      const emailRetry = await checkLimit(client, "email_limit", emailKey, EMAIL_LIMIT_MAX);
      if (emailRetry !== undefined) {
        await client.query("COMMIT");
        return { kind: "rate-limited", retryMinutes: emailRetry };
      }

      phase = "database";
      const insert = await client.query(INSERT_ENTRY_SQL, [normalizedEmail, CONSENT_VERSION]);
      await client.query("COMMIT");
      return insert.rows.length > 0 ? { kind: "created" } : { kind: "duplicate" };
    } catch {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Rollback failures are swallowed; the connection is discarded below.
      }
      return { kind: "failed", dependency: phase };
    } finally {
      client.release();
    }
  } catch {
    return { kind: "failed", dependency: "database" };
  } finally {
    try {
      await pool.end();
    } catch {
      // Pool shutdown must not change the submission outcome.
    }
  }
}

// ---------------------------------------------------------------------------
// Request gates, validation, and state

function isProduction(): boolean {
  return process.env["NODE_ENV"] === "production";
}

function isAllowedOrigin(origin: string | null): boolean {
  if (isProduction()) {
    return origin === siteConfig.appOrigin;
  }
  if (origin === null) {
    return true;
  }
  try {
    return LOCAL_HOSTNAMES.has(new URL(origin).hostname);
  } catch {
    return false;
  }
}

/** Resolves the trusted request source. Never log or store the returned value. */
function resolveTrustedSource(requestHeaders: HeaderReader): string | undefined {
  if (process.env["VERCEL"] === "1") {
    const forwarded = requestHeaders.get("x-vercel-forwarded-for");
    if (forwarded === null || forwarded.includes(",")) {
      return undefined;
    }
    const trimmed = forwarded.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_SOURCE_LENGTH || isIP(trimmed) === 0) {
      return undefined;
    }
    return trimmed;
  }
  return isProduction() ? undefined : "local-development";
}

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function readFields(formData: FormData): SubmittedFields {
  return {
    email: readField(formData, "email"),
    consent: readField(formData, "consent"),
    consentVersion: readField(formData, "consentVersion"),
    company: readField(formData, "company"),
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().normalize("NFC").toLowerCase();
}

function validateFields(
  fields: SubmittedFields,
  normalized: string,
): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  if (normalized === "") {
    errors.email = MESSAGES.emailRequired;
  } else if ([...normalized].length > MAX_EMAIL_CODE_POINTS || !EMAIL_PATTERN.test(normalized)) {
    errors.email = MESSAGES.emailInvalid;
  }
  if (fields.consent !== "yes") {
    errors.consent = MESSAGES.consentRequired;
  } else if (fields.consentVersion !== CONSENT_VERSION) {
    errors.consent = MESSAGES.consentStale;
  }
  return errors;
}

function preservedValues(fields: SubmittedFields): Pick<SubmissionState, "emailValue" | "consentChecked"> {
  return { emailValue: fields.email.trim(), consentChecked: fields.consent === "yes" };
}

function retryMessage(minutes: number): string {
  return `Too many attempts. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`;
}

function rateLimitedState(fields: SubmittedFields, minutes: number): SubmissionState {
  return {
    kind: "rate-limited",
    message: retryMessage(minutes),
    retryAfterMinutes: minutes,
    ...preservedValues(fields),
  };
}

function serviceError(
  fields: SubmittedFields,
  requestId: string,
  dependency?: Dependency,
): Evaluation {
  const state: SubmissionState = {
    kind: "service-error",
    message: `We couldn't add you right now. Try again. Reference: ${requestId}.`,
    requestId,
    ...preservedValues(fields),
  };
  return dependency === undefined
    ? { state, outcome: "service-error" }
    : { state, outcome: "service-error", dependency };
}

function hmacHex(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value, "utf8").digest("hex");
}

async function evaluateSubmission(input: WaitlistSubmissionInput): Promise<Evaluation> {
  const { formData, requestHeaders, requestId } = input;
  const fields = readFields(formData);

  if (!isAllowedOrigin(requestHeaders.get("origin"))) {
    return serviceError(fields, requestId);
  }
  const source = resolveTrustedSource(requestHeaders);
  if (source === undefined) {
    return serviceError(fields, requestId);
  }

  if (fields.company !== "") {
    return {
      state: rateLimitedState(fields, HONEYPOT_RETRY_MINUTES),
      outcome: "automated-rejection",
    };
  }

  const normalized = normalizeEmail(fields.email);
  const fieldErrors = validateFields(fields, normalized);
  if (fieldErrors.email !== undefined || fieldErrors.consent !== undefined) {
    return {
      state: {
        kind: "validation-error",
        message: MESSAGES.validation,
        fieldErrors,
        ...preservedValues(fields),
      },
      outcome: "validation-error",
    };
  }

  const connectionString = process.env["DATABASE_URL"];
  if (connectionString === undefined || connectionString === "") {
    return serviceError(fields, requestId, "database");
  }
  const secret = process.env["RATE_LIMIT_SECRET"];
  if (secret === undefined || secret === "") {
    return serviceError(fields, requestId, "abuse-control");
  }

  const sourceId = hmacHex(secret, `source-id:${source}`);
  const sourceKey = hmacHex(secret, `source-limit:${sourceId}`);
  const emailKey = hmacHex(secret, `email-limit:${normalized}`);

  const release = await acquireMutex();
  let result: PersistResult;
  try {
    result = await persistSubmission(connectionString, sourceKey, emailKey, normalized);
  } finally {
    release();
  }

  switch (result.kind) {
    case "created":
      return {
        state: { kind: "success", message: MESSAGES.success, emailValue: "", consentChecked: false },
        outcome: "success",
      };
    case "duplicate":
      return {
        state: { kind: "duplicate", message: MESSAGES.duplicate, emailValue: "", consentChecked: false },
        outcome: "duplicate",
      };
    case "rate-limited":
      return { state: rateLimitedState(fields, result.retryMinutes), outcome: "rate-limited" };
    case "failed":
      return serviceError(fields, requestId, result.dependency);
  }
}

function logCompletion(requestId: string, startedAt: number, evaluation: Evaluation): void {
  try {
    const event = {
      event: "waitlist.submission.completed",
      timestamp: new Date().toISOString(),
      environment: process.env["VERCEL_ENV"] ?? process.env["NODE_ENV"] ?? "development",
      requestId,
      outcome: evaluation.outcome,
      durationMs: Math.round(performance.now() - startedAt),
      ...(evaluation.dependency ? { dependency: evaluation.dependency } : {}),
    };
    // eslint-disable-next-line no-console -- structured Vercel log event
    console.info(JSON.stringify(event));
  } catch {
    // Logging must never change the submission response.
  }
}

/** Runs one waitlist submission and emits exactly one terminal log event. */
export async function handleWaitlistSubmission(
  input: WaitlistSubmissionInput,
): Promise<SubmissionState> {
  let evaluation: Evaluation;
  try {
    evaluation = await evaluateSubmission(input);
  } catch {
    evaluation = serviceError(readFields(input.formData), input.requestId, "database");
  }
  logCompletion(input.requestId, input.startedAt, evaluation);
  return evaluation.state;
}

/**
 * Operator deletion runbook helper: removes the entry for one email address.
 * Returns the number of deleted rows. Not exposed through any route or UI.
 */
export async function deleteWaitlistEntryByEmail(email: string): Promise<number> {
  const connectionString = process.env["DATABASE_URL"];
  if (connectionString === undefined || connectionString === "") {
    throw new Error("DATABASE_URL is not configured.");
  }
  const pool = createWaitlistPool(connectionString);
  try {
    const result = await pool.query(DELETE_ENTRY_SQL, [normalizeEmail(email)]);
    return result.rowCount ?? 0;
  } finally {
    await pool.end();
  }
}
