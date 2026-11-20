# PingCue

Email chaser for freelancers who send payment links by email or WhatsApp and don't use a full invoicing suite.

## V1 Scope

- Invoice CRUD with per-invoice currency (`INR`, `USD`, `EUR`, `GBP`) and optional client WhatsApp number
- Escalating email reminders (`-3d`, `0d`, `+3d`, `+7d`, `+14d`, `+30d`; friendly → firm → final notice), editable per invoice
- `paused_until` date + 1-click **Pause** button
- **Send test email to me** button per invoice
- Zero-API **Send on WhatsApp** (`https://wa.me/...`) prefilled nudge link per invoice
- Manual partial/full payment tracking (`unpaid` / `partial` / `paid`) with dashboard totals grouped by currency
- Daily reminder cron (`/api/cron/reminders`) protected by `CRON_SECRET`
- Dodo Payments $19 one-time Founding Pass checkout + idempotent, signature-verified webhook (`/api/webhooks/dodo`)

## Stack

- **Framework:** Next.js (App Router, TypeScript, Tailwind CSS, ESLint)
- **Database & Auth:** Supabase (Postgres + Auth)
- **Email:** Resend (with freelancer email as `Reply-To`)
- **Payments:** Dodo Payments
- **Hosting & Cron:** Vercel

## Local Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
