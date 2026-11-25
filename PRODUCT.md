# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary user:** Solo freelancers in India and abroad who bill clients via payment links sent over email or WhatsApp and do not use a full invoicing or accounting suite.
- **Situation and job:** Often checking in on a phone between client calls, they need a low-friction way to log an invoice once and let polite, predictable follow-ups chase unpaid balances until the client settles.

## Product Purpose

PingCue is an automated invoice email chaser. A freelancer enters the client, amount, currency, due date, and payment link, and PingCue automatically sends escalating reminders (`-3d`, `0d`, `+3d`, `+7d`, `+14d`, `+30d`; shifting from friendly to firm to final notice) until paid.

- **Primary conversion goal:** Purchase the **$19 one-time Founding Pass** via Dodo Payments.

## Positioning

Built specifically for link-based solo freelancers rather than teams migrating into a full invoicing or accounting suite:

- **No gateway lock-in:** Works with any `https://` payment link (UPI, Razorpay, Wise, PayPal, bank transfer).
- **Direct client thread:** Sends emails signed with the freelancer's configured name/studio (`display_name`) and sets the freelancer's email as `Reply-To`, keeping client replies and receipts in the freelancer's own inbox.
- **Control without awkwardness:** Includes 1-click Pause (`paused_until`), interactive multi-step in-app email previews, "Send test email to me", 2-step manual "Send reminder now", customizable reminder day offsets per invoice, reschedule-safe due-date edits, and zero-API `https://wa.me/...` WhatsApp nudges (with copy + history logging).
- **Multi-currency clarity without FX guesswork:** Tracks `INR`, `USD`, `EUR`, and `GBP` separately, updating remaining balances as partial payments are recorded.

## Operating Context

- **Device reality:** Mobile-first phone ergonomics (card lists on mobile, tables on desktop) for quick status checks, logging partial payments, pausing reminders when a client promises a date, or triggering a WhatsApp nudge; also used on desktop browsers.
- **Workflow cadence:** Freelancers configure their sender name, default currency, and daily send digest preference in `/settings`, add an invoice, preview tone in-app or via test email, and let Vercel's daily reminder cron (`/api/cron/reminders`) handle paginated, bounce-protected email dispatches.

## Capabilities and Constraints

- **Application stack:** Next.js 16 (App Router, Cache Components + Partial Prefetching, TypeScript), Tailwind CSS 4, `shadcn/ui` primitives (`components/ui/*`), Supabase (Postgres + Auth with PKCE callback and password reset), Resend (transactional email + delivery/bounce suppression webhook `/api/webhooks/resend`), Dodo Payments (Merchant of Record, `/api/checkout` + signature-verified, idempotent unlock/refund/dispute webhook `/api/webhooks/dodo`), and Vercel hosting + daily cron.
- **Pricing tiers:**
  - **Free plan (`$0`):** 1 active invoice at a time (enforced atomically at the Postgres boundary), full escalating email schedule (`-3d` to `+30d`), custom schedule, 1-click Pause, inline & test email previews, and per-currency dashboard totals.
  - **Founding Pass (`$19` one-time):** Unlimited active invoices, zero-API 1-click WhatsApp nudges (with Copy & history logging), 12 months of upcoming V1.5 Document Chaser, and a 7-day no-questions-asked refund guarantee.
- **Explicit V1 boundaries:** No currency FX conversion, no WhatsApp Business API automation, no invoice PDF generation, no accounting/tax/GST exports, no full client CRM, no hourly per-timezone cron, and no `$49` Year-end Pass tier yet.
- **Explicitly undecided facts:** Ship date for V1.5 Document Chaser; whether currencies beyond `INR`, `USD`, `EUR`, and `GBP` will be added later.

## Brand Commitments

- **Name and support contact:** `PingCue` (centralized via `lib/site-config.ts` / `NEXT_PUBLIC_SUPPORT_EMAIL`, defaulting to `pingcue.support@gmail.com` until custom domain routing is attached).
- **Tone and voice:** Approachable, crisp, trustworthy, polite but firm—never corporate or spammy.
- **Binding visual and copy guardrails:**
  - No stock photos.
  - No purple gradients.
  - No emoji in UI labels (custom vector die-cut stickers and Lucide icons only).

## Evidence on Hand

- **Implemented V1 foundation:** Complete production routes (`/`, `/login`, `/auth/callback`, `/auth/reset-password`, `/dashboard`, `/invoices`, `/invoices/new`, `/invoices/[id]`, `/settings`, `/terms`, `/privacy`, `/refund`), hardened API endpoints (`/api/checkout`, `/api/cron/reminders`, `/api/events`, `/api/webhooks/dodo`, `/api/webhooks/resend`), and automated unit tests (`npm test`).
- **Synthetic demo material:** The landing page's interactive invoice preview (`Northstar Design Retainer` / `Priya`) is clearly labeled synthetic demonstration data.
- **Confirmed absences (must not be fabricated):** No real customer testimonials, user counts, collection-rate benchmarks, case studies, or press logos exist yet.

## Product Principles

1. **Protect client goodwill:** Reminders start polite, escalate predictably, and pause in one click whenever a client commits to a date.
2. **Fit link-based freelancers without suite bloat:** Accept any payment link and require zero accounting migration.
3. **Scannable on a phone in seconds:** Remaining balance, overdue state, and next action lead over secondary metadata.
4. **Exact money, zero guesswork:** Keep `INR`, `USD`, `EUR`, and `GBP` separate and chase only unpaid balances.

## Accessibility & Inclusion

- Mobile-first phone usability with comfortable touch targets and legible currency totals on narrow viewports.
- Clear keyboard focus indicators and `prefers-reduced-motion` compliance.
- Invoice and escalation states communicated with explicit text labels alongside color—never color alone.
