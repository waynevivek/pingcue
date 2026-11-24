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
- **Direct client thread:** Sends emails with the freelancer's address in `Reply-To`, keeping client replies and receipts in the freelancer's own inbox.
- **Control without awkwardness:** Includes 1-click Pause (`paused_until`), "Send test email to me" previewing, customizable reminder day offsets per invoice, and zero-API `https://wa.me/...` WhatsApp nudges.
- **Multi-currency clarity without FX guesswork:** Tracks `INR`, `USD`, `EUR`, and `GBP` separately, updating remaining balances as partial payments are recorded.

## Operating Context

- **Device reality:** Mobile-first phone ergonomics for quick status checks, logging partial payments, pausing reminders when a client promises a date, or triggering a WhatsApp nudge; also used on desktop browsers.
- **Workflow cadence:** Freelancers add an invoice (title, client name/email, optional WhatsApp number, currency, amount, due date, optional payment link, and editable offset schedule), verify tone via test email, and let Vercel's daily reminder cron (`/api/cron/reminders`) handle email dispatches.

## Capabilities and Constraints

- **Application stack:** Next.js 16 (App Router, TypeScript), Tailwind CSS 4, Supabase (Postgres + Auth), Resend (transactional email with freelancer `Reply-To`), Dodo Payments (Merchant of Record, `/api/checkout` + signature-verified webhook `/api/webhooks/dodo`), and Vercel hosting + daily cron.
- **UI component commitment:** Target component layer is `shadcn/ui` on Tailwind CSS (confirmed for upcoming builds; not yet installed in `package.json`, and existing UI in `app/` is a temporary draft).
- **Pricing tiers:**
  - **Free plan (`$0`):** 1 active invoice at a time, full escalating email schedule (`-3d` to `+30d`), custom schedule, 1-click Pause, test email sends, and per-currency dashboard totals.
  - **Founding Pass (`$19` one-time):** Unlimited active invoices, zero-API 1-click WhatsApp nudges, 12 months of upcoming V1.5 Document Chaser, and a 7-day no-questions-asked refund guarantee.
- **Explicit V1 boundaries:** No currency FX conversion, no WhatsApp Business API automation, no invoice PDF generation, no accounting/tax/GST exports, no full client CRM, no hourly per-timezone cron, and no `$49` Year-end Pass tier yet.
- **Explicitly undecided facts:** Ship date for V1.5 Document Chaser; whether currencies beyond `INR`, `USD`, `EUR`, and `GBP` will be added later.

## Brand Commitments

- **Name and support contact:** `PingCue` (`pingcue.support@gmail.com`).
- **Tone and voice:** Calm, trustworthy, polite but firm, finance-adjacent without corporate stiffness.
- **Binding visual and copy guardrails:**
  - No stock photos.
  - No purple gradients.
  - No emoji in UI labels.
- **Incumbent UI status:** Existing styles and components in `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, and `app/(app)/*` are a temporary draft to be replaced by the visual direction seeded in `DESIGN.md`.

## Evidence on Hand

- **Implemented V1 foundation:** Working routes (`/`, `/login`, `/dashboard`, `/invoices`, `/terms`, `/privacy`, `/refund`) and unit-tested domain logic (`lib/invoices.test.ts`, `lib/reminders.test.ts`, `lib/dodo.test.ts`).
- **Synthetic demo material:** The landing page's invoice preview (`Northstar Design Retainer` / `Priya`) is synthetic demonstration data.
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
