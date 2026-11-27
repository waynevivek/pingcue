import Link from "next/link";
import { Check, Minus } from "lucide-react";
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

const PATH = "/compare/pingcue-vs-invoicing-suites";
const HEADLINE =
  "PingCue vs Full Invoicing Suites vs Manual Reminders: Which Fits Your Freelance Workflow?";
const DESCRIPTION =
  "Compare PingCue ($19 one-time payment-link chaser) with full accounting suites and manual reminders—including when each fits your freelance workflow.";

export const metadata = buildPageMetadata({
  title: "PingCue vs Invoicing Suites & Manual Reminders",
  description: DESCRIPTION,
  path: PATH,
  type: "article",
  publishedTime: SEO_CONTENT_LAST_MODIFIED,
  modifiedTime: SEO_CONTENT_LAST_MODIFIED,
  keywords: [
    "PingCue vs invoicing software",
    "lightweight invoice reminder tool",
    "invoice chaser without accounting suite",
    "one-time payment invoice reminder app",
    "freelance payment link follow up tool",
  ],
});

const COMPARISON_ROWS = [
  {
    feature: "Primary job",
    pingcue: "Automate polite-to-firm reminders for payment links you already send",
    suites: "Full billing, invoice generation, bookkeeping, and tax accounting",
    manual: "Writing emails & calendar reminders by hand",
  },
  {
    feature: "Works with any payment link (Stripe, Wise, PayPal, UPI, Razorpay, bank)",
    pingcue: "Yes — zero gateway lock-in",
    suites: "Usually tied to built-in checkout or selected integrations",
    manual: "Yes — manual copy/paste",
  },
  {
    feature: "Escalating email cadence (-3d to +30d)",
    pingcue: "Automated & editable per invoice",
    suites: "Available on mid/higher monthly plans",
    manual: "Manual tracking",
  },
  {
    feature: "1-click Pause when client promises a date",
    pingcue: "Built-in per invoice",
    suites: "Varies by platform",
    manual: "Manual calendar rescheduling",
  },
  {
    feature: "Zero-API WhatsApp payment nudges (wa.me)",
    pingcue: "1-click prefilled message + history",
    suites: "Rarely built in without API add-ons",
    manual: "Typed manually each time",
  },
  {
    feature: "Partial payment remaining-balance tracking",
    pingcue: "Yes, separately in USD, EUR, GBP & INR",
    suites: "Yes, often with ledger & FX complexity",
    manual: "Manual spreadsheets",
  },
  {
    feature: "PDF invoice generation & tax/GST filing",
    pingcue: "Not included in V1 (by design)",
    suites: "Core strength",
    manual: "Separate document templates",
  },
  {
    feature: "Pricing model",
    pingcue: "Free (1 active invoice) or $19 one-time Founding Pass",
    suites: "Recurring monthly SaaS subscription",
    manual: "Free, costs your time & mental load",
  },
] as const;

const FAQS = [
  {
    q: "Who is PingCue built for?",
    a: "PingCue is built for solo freelancers and independent studios who already send payment links (Stripe links, Wise, PayPal, UPI, Razorpay, or bank transfer details) by email or WhatsApp and want automated follow-ups without paying monthly for a full accounting suite.",
  },
  {
    q: "When should I use a full accounting or invoicing suite instead of PingCue?",
    a: "Use a full accounting suite if you need automated PDF invoice creation, double-entry bookkeeping, GST/VAT tax reports, payroll, or multi-user finance permissions. PingCue intentionally avoids accounting bloat so setup takes under two minutes.",
  },
  {
    q: "Does PingCue process client payments or charge transaction fees?",
    a: "No. Clients pay directly through whatever payment link you paste (Stripe, Wise, PayPal, UPI, Razorpay, or bank transfer). PingCue takes 0% of your invoices.",
  },
] as const;

export default function ComparePingCuePage() {
  const siteUrl = getSiteUrl();
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "PingCue vs Invoicing Suites", path: PATH },
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
          <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-[#FFD7DC] px-3 py-1 text-xs font-semibold text-[#5C232B]">
            Comparison · Honest fit guide
          </span>
          <h1 className="mt-4 font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#111111] sm:text-[44px]">
            {HEADLINE}
          </h1>
          <ArticleMetaBar
            publishedDate={SEO_CONTENT_LAST_MODIFIED}
            updatedDate={SEO_CONTENT_LAST_MODIFIED}
          />
          <p className="mt-4 text-[16px] leading-[1.65] text-[#52525B] sm:text-[17px]">
            Not every freelancer needs full accounting software—and not every
            business should rely on a lightweight reminder tool. Here is a
            transparent breakdown so you can choose the option that matches how
            you actually bill clients.
          </p>
        </header>

        {/* Side-by-side comparison table */}
        <section
          aria-labelledby="comparison-table-heading"
          className="mt-8 rounded-[24px] border border-black/[0.08] bg-white p-5 sm:p-6"
        >
          <h2
            id="comparison-table-heading"
            className="font-sans text-[20px] font-semibold tracking-[-0.025em] text-[#111111]"
          >
            Feature &amp; workflow comparison
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-black/[0.08] text-[#52525B]">
                  <th className="py-3 pr-4 font-semibold">Criterion</th>
                  <th className="rounded-t-xl bg-[#FFFBEB] px-3 py-3 font-semibold text-[#111111]">
                    PingCue
                  </th>
                  <th className="px-3 py-3 font-semibold">
                    Full Invoicing Suites
                  </th>
                  <th className="py-3 pl-3 font-semibold">Manual Reminders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] text-[#27272A]">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <th
                      scope="row"
                      className="py-3 pr-4 font-semibold text-[#111111]"
                    >
                      {row.feature}
                    </th>
                    <td className="bg-[#FFFBEB]/60 px-3 py-3 font-medium text-[#111111]">
                      {row.pingcue}
                    </td>
                    <td className="px-3 py-3">{row.suites}</td>
                    <td className="py-3 pl-3">{row.manual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Honest fit cards */}
        <section
          aria-label="Decision guide"
          className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          <div className="rounded-[24px] border border-black/[0.08] bg-[#D6F7A3] p-6">
            <h2 className="font-sans text-[20px] font-semibold tracking-[-0.02em] text-[#111111]">
              Choose PingCue when…
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-[#28420C]">
              {[
                "You already send Stripe, Wise, PayPal, UPI, Razorpay, or bank transfer payment links.",
                "You want polite-to-firm automated follow-ups without learning a full accounting tool.",
                "Client replies and receipts must stay in your own email inbox.",
                "You prefer a $19 one-time purchase over another recurring monthly subscription.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#111111]"
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-black/[0.08] bg-white p-6">
            <h2 className="font-sans text-[20px] font-semibold tracking-[-0.02em] text-[#111111]">
              Choose a full accounting suite when…
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-[#3F3F46]">
              {[
                "You need automated PDF invoice templates and sequential tax invoice numbering.",
                "You require double-entry bookkeeping, expense tracking, or GST/VAT tax filing.",
                "You manage a multi-person finance team with approval roles and client portals.",
                "You want your accounting software itself to host credit-card payment checkout.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F4F4F5] text-[#52525B]"
                  >
                    <Minus className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Payment-link compatibility & cost framing */}
        <section
          aria-labelledby="pairing-heading"
          className="mt-10 rounded-[24px] border border-black/[0.08] bg-white p-5 sm:p-6"
        >
          <h2
            id="pairing-heading"
            className="font-sans text-[20px] font-semibold tracking-[-0.025em] text-[#111111]"
          >
            How PingCue pairs with payment links you already use
          </h2>
          <p className="mt-2 text-[14.5px] leading-[1.65] text-[#3F3F46]">
            Most solo freelancers already have a preferred way to receive funds—such
            as{" "}
            <a
              href="https://docs.stripe.com/payment-links"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#111111] underline hover:text-[#52525B]"
            >
              Stripe Payment Links
            </a>
            ,{" "}
            <a
              href="https://wise.com/help/articles/2977976/how-do-i-request-money"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#111111] underline hover:text-[#52525B]"
            >
              Wise payment requests
            </a>
            ,{" "}
            <a
              href="https://www.paypal.com/us/digital-wallet/send-receive-money/paypal-me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#111111] underline hover:text-[#52525B]"
            >
              PayPal.Me
            </a>
            , UPI/Razorpay links, or direct bank transfer instructions—and pair
            them with{" "}
            <a
              href="https://faq.whatsapp.com/5913398998672934"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#111111] underline hover:text-[#52525B]"
            >
              WhatsApp Click to Chat
            </a>{" "}
            when clients prefer messaging. Full accounting tools typically charge
            a recurring monthly subscription ($15–$40/month, or $180–$480/year)
            and lock automated reminders to higher tiers. PingCue focuses solely
            on the follow-up gap: free forever for 1 active invoice, or a{" "}
            <strong className="font-mono font-semibold text-[#111111]">
              $19
            </strong>{" "}
            one-time Founding Pass with 0% transaction fees.
          </p>
        </section>

        {/* Related resources cross-links */}
        <section
          aria-label="Related guides"
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
            href="/guides/how-to-chase-unpaid-invoices"
            className="rounded-[22px] border border-black/[0.08] bg-[#D9E6FF] p-5 transition-transform duration-150 hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold text-[#1E335C]">Next resource</p>
            <p className="mt-1 text-[17px] font-semibold text-[#111111]">
              Read the 6-step overdue invoice playbook →
            </p>
          </Link>
        </section>

        <section aria-labelledby="compare-faq-heading" className="mt-14">
          <h2
            id="compare-faq-heading"
            className="font-sans text-[26px] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[32px]"
          >
            Comparison FAQ
          </h2>
          <div className="mt-6">
            <OpenFaqList items={FAQS} />
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}
