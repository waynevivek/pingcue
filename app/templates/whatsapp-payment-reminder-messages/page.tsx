import Link from "next/link";
import { ArticleMetaBar } from "@/app/components/ArticleMetaBar";
import { CopyableTemplateCard } from "@/app/components/CopyableTemplateCard";
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

const PATH = "/templates/whatsapp-payment-reminder-messages";
const HEADLINE =
  "Polite WhatsApp Payment Reminder Message Templates for Freelancers";
const DESCRIPTION =
  "Copy 5 polite WhatsApp payment reminder messages for Stripe, Wise, PayPal, UPI, or bank links, plus wa.me URL formatting tips for freelancers.";

export const metadata = buildPageMetadata({
  title: "WhatsApp Payment Reminder Templates",
  description: DESCRIPTION,
  path: PATH,
  type: "article",
  publishedTime: SEO_CONTENT_LAST_MODIFIED,
  modifiedTime: SEO_CONTENT_LAST_MODIFIED,
  keywords: [
    "WhatsApp payment reminder message",
    "polite payment reminder on WhatsApp",
    "freelance invoice WhatsApp template",
    "wa.me payment reminder link",
    "ask client for payment on WhatsApp",
  ],
});

const WHATSAPP_TEMPLATES = [
  {
    id: "wa-minus-3d",
    offsetLabel: "-3d",
    tone: "Friendly" as const,
    title: "Early heads-up on WhatsApp",
    whenToUse:
      "Ideal for clients you already chat with on WhatsApp. Keep it to two lines so it reads naturally on a phone screen.",
    body: `Hi [Client Name], quick heads-up that [Amount] for [Project Name] is due on [Due Date]. Sharing the payment link here whenever convenient: [Payment Link]`,
  },
  {
    id: "wa-0d",
    offsetLabel: "0d",
    tone: "Friendly" as const,
    title: "Due-today gentle nudge",
    whenToUse:
      "Use on the due date when email threads tend to get buried under client notifications.",
    body: `Hi [Client Name], friendly reminder that [Amount] for [Project Name] is due today ([Due Date]). Payment link: [Payment Link]`,
  },
  {
    id: "wa-plus-7d",
    offsetLabel: "+7d",
    tone: "Firm" as const,
    title: "One week overdue — polite but direct",
    whenToUse:
      "Ask a clear yes/date question so the client can answer in five seconds instead of leaving the message unread.",
    body: `Hi [Client Name], following up on [Amount] for [Project Name] (7 days past the [Due Date] due date). Could you confirm when this will be settled? [Payment Link]`,
  },
  {
    id: "wa-partial",
    offsetLabel: "Partial",
    tone: "Friendly" as const,
    title: "Partial payment — remaining balance check-in",
    whenToUse:
      "Acknowledge the first installment and mention only the remaining unpaid amount.",
    body: `Hi [Client Name], thanks again for the [Amount Paid] received on [Project Name]. Checking in on the remaining [Remaining Amount]—here is the link again: [Payment Link]`,
  },
  {
    id: "wa-plus-30d",
    offsetLabel: "+30d",
    tone: "Final notice" as const,
    title: "Final WhatsApp check-in (30 days overdue)",
    whenToUse:
      "Short, calm, and clear—avoid exclamation marks or guilt-tripping language.",
    body: `Hi [Client Name], final check-in that [Amount] for [Project Name] is now 30 days overdue. Please settle via [Payment Link] or reply today with the transfer date.`,
  },
];

const FAQS = [
  {
    q: "Is it professional to send a payment reminder on WhatsApp?",
    a: "Yes—provided you already communicate with that client on WhatsApp and keep the message short, polite, and free of pressure. Many solo freelancers get faster responses from a 2-line WhatsApp nudge than a third follow-up email.",
  },
  {
    q: "Do I need the WhatsApp Business API to send payment nudges?",
    a: "No. Standard https://wa.me/<phone>?text=<message> links open WhatsApp directly with your prefilled reminder and payment link already typed out, so you can review and tap Send in one step with zero API setup or per-message fees.",
  },
  {
    q: "How should I format phone numbers for wa.me links?",
    a: "Use digits only with the country code and no leading plus sign, spaces, or dashes (for example, 14155550199 for US numbers or 919876543210 for India). PingCue normalizes client WhatsApp numbers automatically.",
  },
] as const;

export default function WhatsappTemplatesPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "WhatsApp Payment Reminder Templates", path: PATH },
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
          <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-[#D6F7A3] px-3 py-1 text-xs font-semibold text-[#28420C]">
            WhatsApp templates · Zero-API wa.me
          </span>
          <h1 className="mt-4 font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#111111] sm:text-[44px]">
            {HEADLINE}
          </h1>
          <ArticleMetaBar
            publishedDate={SEO_CONTENT_LAST_MODIFIED}
            updatedDate={SEO_CONTENT_LAST_MODIFIED}
          />
          <p className="mt-4 text-[16px] leading-[1.65] text-[#52525B] sm:text-[17px]">
            A good WhatsApp payment reminder fits in a single phone preview:
            state the project, the exact remaining balance, the due date, and
            your payment link. Copy any template below or trigger prefilled{" "}
            <code className="rounded bg-[#F4F4F5] px-1.5 py-0.5 font-mono text-[0.9em] text-[#111111]">
              wa.me
            </code>{" "}
            nudges in one click from PingCue.
          </p>
        </header>

        {/* Quick best-practice rules */}
        <section
          aria-labelledby="wa-rules-heading"
          className="mt-8 rounded-[24px] border border-black/[0.08] bg-white p-5 sm:p-6"
        >
          <h2
            id="wa-rules-heading"
            className="font-sans text-[20px] font-semibold tracking-[-0.025em] text-[#111111]"
          >
            4 rules for polite WhatsApp payment nudges
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 text-[14px] leading-[1.6] text-[#27272A] sm:grid-cols-2">
            <li className="rounded-2xl border border-black/[0.06] bg-[#FAFAFA] p-4">
              <strong className="block font-semibold text-[#111111]">
                Keep it under 3 lines
              </strong>
              Long paragraphs feel tense in chat apps. Stick to amount, project,
              due date, and link.
            </li>
            <li className="rounded-2xl border border-black/[0.06] bg-[#FAFAFA] p-4">
              <strong className="block font-semibold text-[#111111]">
                Pair with email, don&apos;t spam
              </strong>
              Let scheduled emails handle the routine timeline; use WhatsApp
              selectively when an invoice needs a quick human nudge.
            </li>
            <li className="rounded-2xl border border-black/[0.06] bg-[#FAFAFA] p-4">
              <strong className="block font-semibold text-[#111111]">
                Put the payment link inside the message
              </strong>
              Whether you use{" "}
              <a
                href="https://docs.stripe.com/payment-links"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#111111] underline hover:text-[#52525B]"
              >
                Stripe
              </a>
              ,{" "}
              <a
                href="https://wise.com/help/articles/2977976/how-do-i-request-money"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#111111] underline hover:text-[#52525B]"
              >
                Wise
              </a>
              ,{" "}
              <a
                href="https://www.paypal.com/us/digital-wallet/send-receive-money/paypal-me"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#111111] underline hover:text-[#52525B]"
              >
                PayPal
              </a>
              , UPI, Razorpay, or bank transfer details, include the link so the
              client can pay immediately.
            </li>
            <li className="rounded-2xl border border-black/[0.06] bg-[#FAFAFA] p-4">
              <strong className="block font-semibold text-[#111111]">
                Send during normal business hours
              </strong>
              Avoid late-night or weekend payment pings; weekday mornings
              produce the fastest replies.
            </li>
          </ul>
        </section>

        {/* Copyable Templates */}
        <section
          aria-labelledby="wa-templates-heading"
          className="mt-10 space-y-5"
        >
          <h2
            id="wa-templates-heading"
            className="font-sans text-[24px] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[28px]"
          >
            Copy-ready WhatsApp payment reminder messages
          </h2>
          {WHATSAPP_TEMPLATES.map((template) => (
            <CopyableTemplateCard
              key={template.id}
              id={template.id}
              title={template.title}
              offsetLabel={template.offsetLabel}
              tone={template.tone}
              channel="whatsapp"
              body={template.body}
              whenToUse={template.whenToUse}
            />
          ))}
        </section>

        {/* Concrete wa.me URL encoding reference */}
        <section
          aria-labelledby="wame-encoding-heading"
          className="mt-10 rounded-[24px] border border-black/[0.08] bg-white p-5 sm:p-6"
        >
          <h2
            id="wame-encoding-heading"
            className="font-sans text-[20px] font-semibold tracking-[-0.025em] text-[#111111]"
          >
            How to build a prefilled wa.me link (no WhatsApp API needed)
          </h2>
          <p className="mt-2 text-[14.5px] leading-[1.65] text-[#3F3F46]">
            WhatsApp&apos;s official{" "}
            <a
              href="https://faq.whatsapp.com/5913398998672934"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#111111] underline hover:text-[#52525B]"
            >
              Click to Chat specification
            </a>{" "}
            lets you open a prefilled chat with any client using a plain HTTPS
            URL: strip <code className="font-mono">+</code>, spaces, parentheses,
            and leading zeroes from the phone number, then URL-encode the
            message text after <code className="font-mono">?text=</code>.
          </p>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.07] bg-[#FAFAFA] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#52525B]">
              Example prefilled wa.me link
            </p>
            <code className="mt-2 block break-all font-mono text-[12.5px] leading-relaxed text-[#111111]">
              https://wa.me/14155550199?text=Hi%20Maya%2C%20friendly%20reminder%20that%20%241%2C200%20for%20Brand%20Sprint%20is%20due%20today.%20Link%3A%20https%3A%2F%2Fbuy.stripe.com%2Fexample
            </code>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-[13.5px] text-[#3F3F46] sm:grid-cols-3">
            <div className="rounded-xl border border-black/[0.06] bg-[#FAFAFA] p-3.5">
              <p className="font-semibold text-[#111111]">United States / Canada</p>
              <p className="mt-1 font-mono text-xs text-[#52525B]">
                +1 (415) 555-0199 → <strong className="text-[#111111]">14155550199</strong>
              </p>
            </div>
            <div className="rounded-xl border border-black/[0.06] bg-[#FAFAFA] p-3.5">
              <p className="font-semibold text-[#111111]">United Kingdom</p>
              <p className="mt-1 font-mono text-xs text-[#52525B]">
                +44 07700 900123 → <strong className="text-[#111111]">447700900123</strong>
              </p>
            </div>
            <div className="rounded-xl border border-black/[0.06] bg-[#FAFAFA] p-3.5">
              <p className="font-semibold text-[#111111]">India</p>
              <p className="mt-1 font-mono text-xs text-[#52525B]">
                +91 98765 43210 → <strong className="text-[#111111]">919876543210</strong>
              </p>
            </div>
          </div>
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

        <section aria-labelledby="wa-faq-heading" className="mt-14">
          <h2
            id="wa-faq-heading"
            className="font-sans text-[26px] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[32px]"
          >
            WhatsApp payment reminder FAQ
          </h2>
          <div className="mt-6">
            <OpenFaqList items={FAQS} />
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}
