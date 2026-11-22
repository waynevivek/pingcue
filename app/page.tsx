import Link from "next/link";
import { isDodoConfigured, isDodoLiveMode } from "@/lib/dodo";
import { FoundingPassButton } from "./components/FoundingPassButton";

const SCHEDULE_STEPS = [
  { offset: "-3d", tone: "Friendly" },
  { offset: "0d", tone: "Friendly" },
  { offset: "+3d", tone: "Friendly" },
  { offset: "+7d", tone: "Firm" },
  { offset: "+14d", tone: "Firm" },
  { offset: "+30d", tone: "Final" },
] as const;

const FEATURES = [
  {
    title: "Escalating reminders you control",
    body: "Default schedule runs at -3d, 0d, +3d, +7d, +14d, and +30d, shifting cleanly from friendly to firm to final notice. Edit any step per invoice.",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "1-click Pause & test email",
    body: "Client promised to pay next Friday? Hit Pause and set a date so PingCue stays quiet. Preview with \"Send test email to me\" before anything goes out.",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M10 7v10m4-10v10M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Zero-API WhatsApp nudges",
    body: "Need a quick ping on WhatsApp? One click opens WhatsApp with a polite, prefilled message and payment link—no WhatsApp Business API setup required.",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Partial payments & multi-currency",
    body: "Track INR, USD, EUR, and GBP separately without FX guesswork. Log an amount received—reminders chase only the remaining balance and stop once paid.",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 7h16M4 12h10M4 17h7m5 0 2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

const FAQS = [
  {
    q: "Do I need an invoicing suite or Stripe to use PingCue?",
    a: "No. PingCue is built specifically for freelancers who send UPI, Razorpay, Wise, PayPal, or bank-transfer payment links by email or WhatsApp. Just paste your link and due date.",
  },
  {
    q: "Where do client replies go?",
    a: "Every reminder sets your email as the Reply-To address, so when a client replies with a payment receipt or question, it lands directly in your inbox.",
  },
  {
    q: "What happens when a client pays half now and half later?",
    a: "Enter the amount received to mark the invoice partial. PingCue automatically updates the remaining balance in future reminders and stops chasing the moment the balance reaches zero.",
  },
  {
    q: "Is the $19 Founding Pass really a one-time payment?",
    a: "Yes—$19 once, no recurring subscription. It unlocks unlimited active invoices, 1-click WhatsApp nudges, and includes the upcoming V1.5 Document Chaser for 12 months.",
  },
] as const;

export default function HomePage() {
  const checkoutLive = isDodoConfigured() && isDodoLiveMode();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Sticky Frosted-Glass Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-xs">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-4.5 w-4.5"
              >
                <path
                  d="M3.5 10.5 8 15l8.5-9.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-display text-xl tracking-tight">PingCue</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a
              href="#how-it-works"
              className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Sign in
            </Link>
            <FoundingPassButton
              source="nav"
              variant="compact"
              label="Founding Pass — $19"
              checkoutLive={checkoutLive}
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-blue-50/60 via-background to-background">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-8 lg:py-24">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1 text-xs font-medium text-blue-800 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
                <span>For freelancers who send payment links</span>
              </div>

              <h1 className="mt-5 font-display text-4xl leading-[1.12] tracking-tight text-slate-900 sm:text-5xl">
                Stop awkwardly chasing unpaid invoices.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                You already send payment links over email or WhatsApp—you don&apos;t
                need a bloated accounting suite. Add the client, due date, and link;
                PingCue sends polite reminders that get firmer as an invoice goes
                overdue.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <FoundingPassButton
                  source="hero"
                  variant="accent"
                  checkoutLive={checkoutLive}
                />
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
                >
                  See the reminder schedule
                </a>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-blue-600">
                    <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Free for 1 active invoice
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-blue-600">
                    <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  INR · USD · EUR · GBP
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-blue-600">
                    <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  No subscription ($19 one-time)
                </span>
              </div>
            </div>

            {/* Interactive-feel Product Preview Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70 sm:p-6">
                {/* Preview header */}
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        Northstar Design Retainer
                      </span>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-mono text-xs font-medium text-amber-800">
                        Partial
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      priya@northstar.co · Due 14 Nov · Reply-To: you@studio.com
                    </p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="font-mono text-lg font-semibold text-slate-900">
                      ₹20,000 <span className="text-xs font-normal text-slate-500">left</span>
                    </p>
                    <p className="font-mono text-xs text-slate-500">
                      ₹25,000 of ₹45,000 INR paid
                    </p>
                  </div>
                </div>

                {/* Schedule pills */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span>Escalating reminder cadence</span>
                    <span className="font-mono text-blue-700">Next: +7d Firm</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {SCHEDULE_STEPS.map((step, index) => (
                      <div
                        key={step.offset}
                        className={`rounded-lg border px-2 py-2 text-center ${
                          index < 3
                            ? "border-slate-200 bg-slate-50 text-slate-500"
                            : index === 3
                              ? "border-blue-500 bg-blue-50/70 text-slate-900 ring-1 ring-blue-500/20"
                              : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <div className="font-mono text-xs font-semibold">
                          {step.offset}
                        </div>
                        <div className="mt-0.5 text-[11px] leading-tight">
                          {index < 3 ? "Sent" : step.tone}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email tone preview */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      Subject: Quick follow-up — ₹20,000 remaining (7 days overdue)
                    </span>
                    <span className="shrink-0 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[11px] text-amber-800">
                      Firm
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    &ldquo;Hi Priya, thanks for the ₹25,000 received so far. Just a
                    quick reminder that the remaining balance of ₹20,000 is now 7
                    days past due. You can settle it directly using the link
                    below...&rdquo;
                  </p>
                </div>

                {/* Action strip mirroring V1 controls */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
                    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-slate-500">
                      <path d="M6 4v8m4-8v8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                    Pause reminders
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
                    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-blue-600">
                      <path d="M2.5 4.5h11v7h-11v-7Zm0 .5L8 8.75 13.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Send test email to me
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800">
                    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                      <path d="M13.5 7.75a5.5 5.5 0 0 1-8.1 4.85L2 13.5l1.05-3.35a5.5 5.5 0 1 1 10.45-2.4Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Send on WhatsApp
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-blue-700">
              How PingCue works
            </p>
            <h2 className="mt-2 font-display text-3xl text-slate-900 sm:text-4xl">
              Three steps. Zero awkward follow-up emails.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Add the invoice details",
                desc: "Enter client name, email, optional WhatsApp number, amount in INR/USD/EUR/GBP, due date, and your payment link.",
              },
              {
                step: "02",
                title: "Let the cadence do the nudging",
                desc: "PingCue emails your client at -3d, 0d, +3d, +7d, +14d, and +30d—moving smoothly from friendly to firm to final notice.",
              },
              {
                step: "03",
                title: "Mark partial or full payments",
                desc: "Update amount received anytime. Future reminders reflect only what is still owed and stop automatically once marked paid.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs"
              >
                <span className="font-mono text-xs font-semibold text-blue-700">
                  STEP {item.step}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="border-y border-slate-200/80 bg-white py-16 sm:py-20"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-mono text-xs font-medium uppercase tracking-wider text-blue-700">
                Simple Pricing
              </p>
              <h2 className="mt-2 font-display text-3xl text-slate-900 sm:text-4xl">
                Pay once. Chase invoices all year.
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Start free with your first active invoice, or grab the one-time
                Founding Pass with zero monthly subscription.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {/* Free Plan */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-7">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Free</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Try PingCue on a real invoice before paying a rupee.
                  </p>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl text-slate-900">$0</span>
                    <span className="text-sm text-slate-600">forever</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm text-slate-700">
                    {[
                      "1 active invoice at a time",
                      "Full escalating email schedule (-3d to +30d)",
                      "Custom schedule & 1-click Pause button",
                      "Send test email to yourself",
                      "INR, USD, EUR & GBP dashboard totals",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-2.5">
                        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-blue-600">
                          <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/login"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-2xs transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Start free with 1 invoice →
                </Link>
              </div>

              {/* Founding Pass */}
              <div className="relative flex flex-col justify-between rounded-2xl border-2 border-[#2563EB] bg-white p-7 shadow-lg shadow-blue-100/70">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Founding Pass
                    </h3>
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-700">
                      One-time · No subscription
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Built for solo freelancers chasing multiple clients every month.
                  </p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="font-display text-4xl text-slate-900">$19</span>
                    <span className="text-sm text-slate-600">one-time payment</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm text-slate-700">
                    {[
                      "Unlimited active invoices",
                      "Everything in Free (escalating emails, Pause, test sends)",
                      "Zero-API 1-click \"Send on WhatsApp\" prefilled nudges",
                      "Includes upcoming V1.5 Document Chaser for 12 months",
                      "7-day no-questions-asked refund guarantee",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-2.5">
                        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-[#C2410C]">
                          <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <FoundingPassButton
                    source="pricing"
                    variant="accent"
                    className="w-full"
                    checkoutLive={checkoutLive}
                  />
                  <p className="mt-2.5 text-center text-xs text-slate-500">
                    Secure checkout powered by Dodo Payments (Merchant of Record).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-blue-700">
              FAQ
            </p>
            <h2 className="mt-2 font-display text-3xl text-slate-900">
              Straight answers
            </h2>
          </div>

          <dl className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6">
            {FAQS.map((item) => (
              <div key={item.q} className="py-5">
                <dt className="text-base font-semibold text-slate-900">
                  {item.q}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-slate-900 px-6 py-12 text-center text-white sm:px-12">
            <h2 className="font-display text-3xl sm:text-4xl">
              Get paid faster without writing another follow-up.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Lock in the $19 Founding Pass today—unlimited invoices, WhatsApp
              nudges, and 12 months of V1.5 Document Chaser with zero monthly fees.
            </p>
            <div className="mt-7 flex justify-center">
              <FoundingPassButton
                source="footer"
                variant="accent"
                checkoutLive={checkoutLive}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Dodo Payments Compliance Links & Contact */}
      <footer id="contact" className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <span className="font-display text-base text-slate-900">PingCue</span>
            <span className="ml-2 text-xs text-slate-500">
              Built for independent freelancers.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
            <Link
              href="/terms"
              className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/refund"
              className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
            >
              Refund Policy
            </Link>
            <a
              href="mailto:pingcue.support@gmail.com"
              className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
            >
              Contact: pingcue.support@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
