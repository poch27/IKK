"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { brand } from "@/lib/brand";
import { CONSENT_VERSION, initialSubmissionState } from "@/lib/waitlist-state";
import type { SubmissionState } from "@/lib/waitlist-state";

import { submitWaitlist } from "./actions";
import rawStyles from "./waitlist-form.module.css";

// CSS modules are typed as an index signature; name the classes so strict
// `noPropertyAccessFromIndexSignature` allows dot access and typos fail to compile.
type ClassName =
  | "form"
  | "field"
  | "label"
  | "input"
  | "consentRow"
  | "checkboxHit"
  | "checkbox"
  | "consentText"
  | "fieldError"
  | "privacy"
  | "link"
  | "honeypot"
  | "submit"
  | "feedbackGroup"
  | "feedback"
  | "pending"
  | "success"
  | "error"
  | "retryNote";
const styles = rawStyles as Readonly<Record<ClassName, string>>;

const SUBMIT_TEXT = brand.form.submit;
const PENDING_TEXT = brand.form.pending;

const EMAIL_ID = "waitlist-email";
const EMAIL_ERROR_ID = "waitlist-email-error";
const CONSENT_ID = "waitlist-consent";
const CONSENT_ERROR_ID = "waitlist-consent-error";
const PRIVACY_ID = "waitlist-privacy";

const STATUS_KINDS: ReadonlySet<SubmissionState["kind"]> = new Set(["success", "duplicate"]);
const ALERT_KINDS: ReadonlySet<SubmissionState["kind"]> = new Set([
  "validation-error",
  "rate-limited",
  "service-error",
]);

function describedBy(errorId: string | undefined): string {
  return errorId === undefined ? PRIVACY_ID : `${errorId} ${PRIVACY_ID}`;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={styles.submit}
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? PENDING_TEXT : SUBMIT_TEXT}
    </button>
  );
}

/** Always-present live regions so assistive technology hears every outcome. */
function Feedback({ state }: { state: SubmissionState }) {
  const { pending } = useFormStatus();
  const showStatus = !pending && STATUS_KINDS.has(state.kind);
  // Clearing the alert while pending lets a repeated error be announced again.
  const showAlert = !pending && ALERT_KINDS.has(state.kind);

  const statusClass = pending
    ? `${styles.feedback} ${styles.pending}`
    : showStatus
      ? `${styles.feedback} ${styles.success}`
      : styles.feedback;

  return (
    <div className={styles.feedbackGroup}>
      <p role="status" aria-live="polite" className={statusClass}>
        {pending ? PENDING_TEXT : showStatus ? state.message : null}
      </p>
      <div
        role="alert"
        className={showAlert ? `${styles.feedback} ${styles.error}` : styles.feedback}
      >
        {showAlert ? (
          <>
            <span>{state.message}</span>
            {state.kind === "service-error" ? (
              <span className={styles.retryNote}>Try again.</span>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

export function WaitlistForm({ privacyContactEmail }: { privacyContactEmail: string }) {
  const [state, formAction] = useActionState(submitWaitlist, initialSubmissionState, "/");
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const isValidationError = state.kind === "validation-error";
  const emailError = isValidationError ? state.fieldErrors?.email : undefined;
  const consentError = isValidationError ? state.fieldErrors?.consent : undefined;

  useEffect(() => {
    if (state.kind !== "validation-error") {
      return;
    }
    if (state.fieldErrors?.email !== undefined) {
      emailRef.current?.focus();
    } else if (state.fieldErrors?.consent !== undefined) {
      consentRef.current?.focus();
    }
  }, [state]);

  return (
    <form
      // React 19 resets the form after each action. Re-keying remounts it so
      // error states restore submitted values and success/duplicate clear them.
      key={state.requestId ?? `${state.kind}:${state.emailValue}:${String(state.consentChecked)}`}
      action={formAction}
      aria-labelledby="waitlist-heading"
      noValidate
      className={styles.form}
    >
      <div className={styles.field}>
        <label htmlFor={EMAIL_ID} className={styles.label}>
          Email address
        </label>
        <input
          ref={emailRef}
          id={EMAIL_ID}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          required
          className={styles.input}
          defaultValue={state.emailValue}
          aria-invalid={emailError !== undefined}
          aria-describedby={describedBy(emailError === undefined ? undefined : EMAIL_ERROR_ID)}
          autoFocus={emailError !== undefined}
        />
        {emailError !== undefined ? (
          <p id={EMAIL_ERROR_ID} className={styles.fieldError}>
            {emailError}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor={CONSENT_ID} className={styles.consentRow}>
          <span className={styles.checkboxHit}>
            <input
              ref={consentRef}
              id={CONSENT_ID}
              name="consent"
              type="checkbox"
              value="yes"
              required
              className={styles.checkbox}
              defaultChecked={state.consentChecked}
              aria-invalid={consentError !== undefined}
              aria-describedby={describedBy(
                consentError === undefined ? undefined : CONSENT_ERROR_ID,
              )}
              autoFocus={emailError === undefined && consentError !== undefined}
            />
          </span>
          <span className={styles.consentText}>{brand.form.consentLabel}</span>
        </label>
        {consentError !== undefined ? (
          <p id={CONSENT_ERROR_ID} className={styles.fieldError}>
            {consentError}
          </p>
        ) : null}
      </div>

      <p id={PRIVACY_ID} className={styles.privacy}>
        {brand.form.privacyBeforeEmail}{" "}
        <a href={`mailto:${privacyContactEmail}`} className={styles.link}>
          {privacyContactEmail}
        </a>
        {brand.form.privacyAfterEmail}
      </p>

      <input type="hidden" name="consentVersion" value={CONSENT_VERSION} />

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="waitlist-company">Company</label>
        <input
          id="waitlist-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <SubmitButton />
      <Feedback state={state} />
    </form>
  );
}
