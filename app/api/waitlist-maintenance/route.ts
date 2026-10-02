import { timingSafeEqual } from "node:crypto";

import { createWaitlistPool } from "@/lib/waitlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PURGE_EXPIRED_SQL = "DELETE FROM waitlist_records WHERE expires_at <= now()";

function isAuthorized(header: string | null, secret: string | undefined): boolean {
  if (secret === undefined || secret === "" || header === null) {
    return false;
  }
  // TextEncoder yields ArrayBuffer-backed bytes, which timingSafeEqual's typings accept.
  const encoder = new TextEncoder();
  const expected = encoder.encode(`Bearer ${secret}`);
  const received = encoder.encode(header);
  if (expected.length !== received.length) {
    return false;
  }
  return timingSafeEqual(expected, received);
}

function cleanupFailed(): Response {
  // Fixed, sanitized line: no SQL, driver, or error text.
  console.error("waitlist maintenance cleanup failed");
  return Response.json({ error: "cleanup-failed" }, { status: 500 });
}

export async function GET(request: Request): Promise<Response> {
  if (!isAuthorized(request.headers.get("authorization"), process.env["CRON_SECRET"])) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const connectionString = process.env["DATABASE_URL"];
  if (connectionString === undefined || connectionString === "") {
    return cleanupFailed();
  }

  const pool = createWaitlistPool(connectionString);
  try {
    const result = await pool.query(PURGE_EXPIRED_SQL);
    return Response.json({ deleted: result.rowCount ?? 0 });
  } catch {
    return cleanupFailed();
  } finally {
    try {
      await pool.end();
    } catch {
      // Pool shutdown must not change the response.
    }
  }
}
