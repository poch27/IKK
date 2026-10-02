# Drop Waitlist Template

A one-page, mobile-first pre-launch site for a clothing drop: brand hero, product preview with prices, brand idea, how-it-works steps, and an email waitlist. Built with Next.js 16 (App Router), React 19, and strict TypeScript. Signups are stored in Neon Postgres. Deploys to Vercel.

The sample content is InCTRL Drop 01. Replace it with your brand.

## Start a new brand

1. On GitHub, open this repo and click **Use this template → Create a new repository** (keep it private).
2. Clone it and install:

   ```sh
   git clone https://github.com/poch27/<new-repo>.git
   cd <new-repo>
   npm install
   cp .env.example .env.local
   npm run dev
   ```

3. Edit the brand-specific files:

   | File | What to change |
   |---|---|
   | `lib/brand.ts` | Name, wordmark, all copy, colors, products and prices, currency/locale, messages. Change `consentVersion` too (e.g. `newbrand-drop-v1`). |
   | `lib/fonts.ts` | Typefaces (any Google Font; keep the three CSS variable names). |
   | `public/images/drop/` | Hero and product images, 1200 × 1500 (4:5). Update paths in `lib/brand.ts` if filenames change. |
   | `package.json` | `name` |

   Layout and spacing live in `app/page.module.css` if you want a different structure, but most brands only need the files above.

4. Run `npm run check` (typecheck, lint, build).

## Deploy (per brand)

Each brand gets its own Vercel project, Neon database, and secrets. Never share a waitlist database between brands: subscribers consented to one brand only.

1. Create a Neon Postgres database, AWS Asia Pacific (Singapore) region, via the Vercel Marketplace (Storage → Neon) or neon.tech. Functions run in `sin1` (see `vercel.json`).
2. In the Neon SQL Editor, run `migrations/0001_waitlist_records.sql`.
3. In Vercel, import the GitHub repo, then set these environment variables:
   - `APP_ORIGIN`: exact URL visitors use, e.g. `https://brand.com` (no trailing slash). Signups from any other origin are rejected.
   - `APPROVED_INSTAGRAM_URL`: the brand's Instagram profile, e.g. `https://www.instagram.com/brand`.
   - `PRIVACY_CONTACT_EMAIL`: a monitored inbox (not `example.com`).
   - `DATABASE_URL`: Neon's pooled connection string (`sslmode=require`).
   - `RATE_LIMIT_SECRET` and `CRON_SECRET`: generate each with `openssl rand -base64 32`.
4. Deploy. The production build fails on purpose if `APP_ORIGIN`, the Instagram URL, or the privacy email is missing or invalid.
5. Sign up with your own email and confirm it arrived (query below).

A daily Vercel Cron (`0 3 * * *` UTC, the Hobby plan limit) calls `/api/waitlist-maintenance` to delete expired rows. Vercel sends `CRON_SECRET` automatically.

## View signups

In the Neon SQL Editor:

```sql
SELECT normalized_email, created_at
FROM waitlist_records
WHERE record_kind = 'entry'
ORDER BY created_at;
```

## Deletion requests

Verify the requester controls the address, then run in the Neon SQL Editor (use the lowercase, trimmed address):

```sql
PREPARE delete_waitlist_entry(text) AS
  DELETE FROM waitlist_records
  WHERE record_kind = 'entry' AND normalized_email = $1;
EXECUTE delete_waitlist_entry('person@example.com');
DEALLOCATE delete_waitlist_entry;
```

Reply within 30 calendar days.

## How signups work

- Email + explicit consent checkbox; email only is stored, normalized and unique.
- Rate limits: 5 attempts per visitor and 3 per email every 10 minutes, stored as keyed hashes (no raw IPs).
- A hidden honeypot field blocks basic bots.
- Entries expire 12 months after signup.
- Each submission writes one sanitized log line to Vercel Logs (no email or IP).
