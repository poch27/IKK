"use server";

import { headers } from "next/headers";

import { handleWaitlistSubmission } from "@/lib/waitlist";
import type { SubmissionState } from "@/lib/waitlist-state";

/**
 * Waitlist form server action. All validation, abuse control, persistence, and
 * logging live in `lib/waitlist.ts`; this stays a thin request adapter.
 */
export async function submitWaitlist(
  _previous: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const requestId = crypto.randomUUID();
  const startedAt = performance.now();
  const requestHeaders = await headers();
  return handleWaitlistSubmission({ formData, requestHeaders, requestId, startedAt });
}
