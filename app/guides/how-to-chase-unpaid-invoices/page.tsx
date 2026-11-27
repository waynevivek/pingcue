import Link from "next/link";
import { ArticleMetaBar } from "@/app/components/ArticleMetaBar";
import { JsonLd } from "@/app/components/JsonLd";
import { MarketingShell } from "@/app/components/MarketingShell";
import { OpenFaqList } from "@/app/components/OpenFaqList";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import { SEO_CONTENT_LAST_MODIFIED } from "@/lib/seo-routes";
import { getSiteUrl } from "@/lib/site-config";

const PATH = "/guides/how-to-chase-unpaid-invoices";
const HEADLINE =
  "How to Chase Unpaid Invoices as a Freelancer Without Damaging Client Goodwill";
const DESCRIPTION =
  "Follow a 6-step freelance invoice cadence (-3d to +30d) covering partial payments, client promises, and WhatsApp nudges without awkwardness.";

export const metadata = buildPageMetadata({
  title: "How to Chase Unpaid Freelance Invoices",
  description: DESCRIPTION,
  path: PATH,
  type: "article",
  publishedTime: SEO_CONTENT_LAST_MODIFIED,
  modifiedTime: SEO_CONTENT_LAST_MODIFIED,
  keywords: [
    "how to chase unpaid invoices",
    "freelancer overdue invoice workflow",
    "follow up on unpaid invoice politely",
    "client late payment freelancer",
    "automated payment reminder schedule",
  ],
});

const PLAYBOOK_STEPS = [
  {
    name: "Confirm the exact due date and payment link upfront",
    text: "Every payment chase starts before the invoice is late. Include the exact due date, total amount, currency, and a single clickable HTTPS payment link (Stripe, Wise, PayPal, UPI, Razorpay, or bank transfer instructions) when you first send the invoice.",
  },
  {
    name: "Send a friendly heads-up 3 days before the due date (-3d)",
    text: "A short reminder three days early catches busy founders and finance teams before their weekly payment run closes—removing the awkwardness of chasing after a missed deadline.",
  },
  {
    name: "Follow a predictable escalation curve (0d, +3d, +7d, +14d, +30d)",
    text: "Keep 0d and +3d warm and helpful (assuming an oversight). At +7d and +14d, shift to firm, concise follow-ups that request either payment or a confirmed settlement date. Reserve +30d for a calm final notice.",
  },
  {
    name: "Pause immediately whenever a client commits to a date",
    text: "Nothing damages trust faster than an automated reminder arriving after a client already emailed saying 'Paying next Friday.' Pause reminders until the promised date so follow-ups resume only if that date passes unpaid.",
  },
  {
    name: "Update remaining balances immediately on partial payments",
    text: "If a client pays a deposit or partial installment, record the exact amount received so subsequent reminders acknowledge what arrived and chase only the remaining balance—in the original currency without FX guesswork.",
  },
  {
    name: "Use a brief WhatsApp nudge when email threads stall",
    text: "If two emails go unanswered with a client you regularly message on WhatsApp, send one concise 2-line WhatsApp check-in containing the remaining balance and direct payment link during business hours.",
  },
] as const;

const FAQS = [
  {
    q: "How long should a freelancer wait before following up on an unpaid invoice?",
    a: "Do not wait until an invoice is weeks overdue. Send a polite heads-up 3 days before the due date, a due-today reminder on day 0, and your first overdue check-in at +3 days.",
  },
  {
    q: "Why do clients ignore payment reminders even when they intend to pay?",
    a: "The three most common reasons are buried emails, missing payment links that require digging through old threads, and unclear ownership inside a small team. Putting the exact remaining amount and clickable payment link in every message removes those blockers.",
  },
  {
    q: "Should freelancers automate invoice reminders?",
    a: "Yes—automation removes emotional hesitation and ensures consistent timing, as long as you can preview every email beforehand, keep your own Reply-To inbox on the thread, and pause in one click when a client replies with a payment date.",
  },
] as const;

export default function HowToChaseUnpaidInvoicesPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "How to Chase Unpaid Invoices", path: PATH },
  ] as const;

  return (
    <MarketingShell breadcrumbs={breadcrumbs}>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbs, siteUrl)} />
      <JsonLd
        data={buildArticleJsonLd({
          headline: HEADLINE,
          description: DESCRIPTION,
          path: PATH,
          datePublished: SEO_CONTENT_LAST_MODIFIED,
          dateModified: SEO_CONTENT_LAST_MODIFIED,
          siteUrl,
        })}
      />
      <JsonLd data={buildFaqJsonLd(FAQS)} />

      <article>
        <header className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-[#D9E6FF] px-3 py-1 text-xs font-semibold text-[#1E335C]">
            Playbook · 6 steps
          </span>
          <h1 className="mt-4 font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#111111] sm:text-[44px]">
            {HEADLINE}
          </h1>
          <ArticleMetaBar
            publishedDate={SEO_CONTENT_LAST_MODIFIED}
            updatedDate={SEO_CONTENT_LAST_MODIFIED}
          />
          <p className="mt-4 text-[16px] leading-[1.65] text-[#52525B] sm:text-[17px]">
            Chasing overdue client invoices feels awkward when every follow-up
            has to be drafted from scratch. Treating follow-ups as a calm,
            standard operating rhythm keeps client relationships warm while
            protecting your cash flow.
          </p>
        </header>

        {/* Direct answer box */}
        <section
          aria-labelledby="tldr-heading"
          className="mt-8 rounded-[24px] border border-black/[0.08] bg-white p-5 sm:p-6"
        >
          <h2
            id="tldr-heading"
            className="font-sans text-[18px] font-semibold tracking-[-0.02em] text-[#111111]"
          >
            Short answer: how to follow up on an unpaid freelance invoice
          </h2>
          <p className="mt-2 text-[14.5px] leading-[1.65] text-[#27272A]">
            Send a polite pre-due reminder at{" "}
            <strong className="font-mono">-3d</strong>, follow an escalating
            schedule (<strong className="font-mono">0d</strong>,{" "}
            <strong className="font-mono">+3d</strong>,{" "}
            <strong className="font-mono">+7d</strong>,{" "}
            <strong className="font-mono">+14d</strong>,{" "}
            <strong className="font-mono">+30d</strong>) that moves from
            friendly to firm to final notice, include your direct payment link
            in every message, update balances on partial payments, and pause the
            sequence immediately whenever the client commits to a payment date.
          </p>
        </section>

        {/* 6 Numbered Steps */}
        <ol className="mt-8 space-y-4">
          {PLAYBOOK_STEPS.map((step, index) => (
            <li
              key={step.name}
              id={`step-${index + 1}`}
              className="rounded-[24px] border border-black/[0.08] bg-white p-5 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.12)] sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#C3F584] font-mono text-xs font-bold text-[#111111] tabular-nums"
                >
                  0{index + 1}
                </span>
                <div>
                  <h2 className="font-sans text-[19px] font-semibold leading-snug tracking-[-0.02em] text-[#111111] sm:text-[21px]">
                    {step.name}
                  </h2>
                  <p className="mt-2 text-[14.5px] leading-[1.65] text-[#3F3F46]">
                    {step.text}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Real-world edge cases */}
        <section
          aria-labelledby="edge-cases-heading"
          className="mt-10 rounded-[24px] border border-black/[0.08] bg-white p-5 sm:p-6"
        >
          <h2
            id="edge-cases-heading"
            className="font-sans text-[22px] font-semibold tracking-[-0.025em] text-[#111111]"
          >
            Handling three tricky freelance payment edge cases
          </h2>
          <div className="mt-4 space-y-4 text-[14.5px] leading-[1.65] text-[#3F3F46]">
            <div>
              <h3 className="font-semibold text-[#111111]">
                1. The client paid 50% upfront, then stalled on the final balance
              </h3>
              <p className="mt-1">
                Never resend the original invoice total. Open your follow-up by
                acknowledging the exact amount already received, state only the
                remaining balance in the original currency (USD, EUR, GBP, or
                INR), and attach a direct payment link—for example via{" "}
                <a
                  href="https://docs.stripe.com/payment-links"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#111111] underline hover:text-[#52525B]"
                >
                  Stripe Payment Links
                </a>{" "}
                or{" "}
                <a
                  href="https://wise.com/help/articles/2977976/how-do-i-request-money"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#111111] underline hover:text-[#52525B]"
                >
                  Wise
                </a>
                —matching the unpaid remainder.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#111111]">
                2. The client goes completely silent after day +14
              </h3>
              <p className="mt-1">
                Switch channels once: send a short 2-line{" "}
                <a
                  href="https://faq.whatsapp.com/5913398998672934"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#111111] underline hover:text-[#52525B]"
                >
                  WhatsApp Click to Chat
                </a>{" "}
                message asking only &ldquo;Could you confirm when this transfer
                is scheduled?&rdquo; If you have ongoing retainer work, state
                calmly that new milestones pause until the overdue balance
                clears.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#111111]">
                3. Your reminder email bounces or lands in spam
              </h3>
              <p className="mt-1">
                If a client changed company domains or mistyped their billing
                address, repeated sends hurt sender reputation. Check bounce
                alerts immediately, confirm the active billing contact on
                WhatsApp or LinkedIn, and update the client record before
                re-sending.
              </p>
            </div>
          </div>
        </section>

        {/* Internal cross-links */}
        <section
          aria-label="Related templates"
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Link
            href="/templates/invoice-payment-reminder-emails"
            className="rounded-[22px] border border-black/[0.08] bg-[#FFF1A8] p-5 transition-transform duration-150 hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold text-[#4B4116]">Next resource</p>
            <p className="mt-1 text-[17px] font-semibold text-[#111111]">
              Copy all 8 invoice reminder email templates →
            </p>
          </Link>
          <Link
            href="/templates/whatsapp-payment-reminder-messages"
            className="rounded-[22px] border border-black/[0.08] bg-[#D6F7A3] p-5 transition-transform duration-150 hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold text-[#28420C]">Next resource</p>
            <p className="mt-1 text-[17px] font-semibold text-[#111111]">
              Copy polite WhatsApp payment nudge templates →
            </p>
          </Link>
        </section>

        <section aria-labelledby="playbook-faq-heading" className="mt-14">
          <h2
            id="playbook-faq-heading"
            className="font-sans text-[26px] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[32px]"
          >
            Frequently asked questions
          </h2>
          <div className="mt-6">
            <OpenFaqList items={FAQS} />
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}
