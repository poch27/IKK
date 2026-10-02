// Browser-safe submission-state contract shared by the waitlist form and server action.
// Must not import server-only code.

import { brand } from "@/lib/brand";

/** Set in lib/brand.ts; bump it whenever the consent or privacy wording changes. */
export const CONSENT_VERSION = brand.consentVersion;

export type SubmissionKind =
  | "idle"
  | "loading"
  | "success"
  | "duplicate"
  | "validation-error"
  | "rate-limited"
  | "service-error";

export type FieldName = "email" | "consent";

export interface SubmissionState {
  readonly kind: SubmissionKind;
  readonly message: string;
  readonly emailValue: string;
  readonly consentChecked: boolean;
  readonly fieldErrors?: Readonly<Partial<Record<FieldName, string>>>;
  readonly retryAfterMinutes?: number;
  readonly requestId?: string;
}

export const initialSubmissionState: SubmissionState = {
  kind: "idle",
  message: "",
  emailValue: "",
  consentChecked: false,
};
