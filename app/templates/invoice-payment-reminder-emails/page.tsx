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

const PATH = "/templates/invoice-payment-reminder-emails";
const HEADLINE =
  "Invoice Payment Reminder Email Templates: Polite to Final Notice (-3d to +30d)";
const DESCRIPTION =
  "Copy 8 polite-to-final invoice payment reminder email templates (-3d to +30d), partial-payment scripts, and pause notes for freelance payment links.";

export const metadata = buildPageMetadata({
  title: "Invoice Reminder Email Templates (-3d to +30d)",
  description: DESCRIPTION,
  path: PATH,
  type: "article",
  publishedTime: SEO_CONTENT_LAST_MODIFIED,
  modifiedTime: SEO_CONTENT_LAST_MODIFIED,
  keywords: [
    "invoice payment reminder email template",
    "polite overdue invoice email",
    "freelance payment follow up email",
    "final notice unpaid invoice email",
    "partial payment reminder email",
  ],
});

const EMAIL_TEMPLATES = [
  {
    id: "email-minus-3d",
    offsetLabel: "-3d",
    tone: "Friendly" as const,
    title: "3 days before due date — early heads-up",
    whenToUse:
      "Send 3 days before the invoice is due so the client can slot it into their weekly payment run before it ever becomes overdue.",
    subject: "Heads up — [Project Name] invoice due [Due Date] ([Amount])",
    body: `Hi [Client Name],

Quick heads-up that the invoice for [Project Name] ([Amount]) is due on [Due Date].

Whenever convenient, you can settle it directly using the payment link below:
[Payment Link]

Feel free to reply here if you need any extra details for your records.

Best,
[Your Name]`,
  },
  {
    id: "email-0d",
    offsetLabel: "0d",
    tone: "Friendly" as const,
    title: "On the due date — gentle same-day nudge",
    whenToUse:
      "Send on the morning of the due date. Keep it brief and assume the client simply needs the payment link back at the top of their inbox.",
    subject: "Due today — [Project Name] ([Amount])",
    body: `Hi [Client Name],

Hope your week is going well. Just a quick reminder that the [Amount] balance for [Project Name] is due today ([Due Date]).

Here is the payment link again for quick access:
[Payment Link]

If you've already initiated payment, please ignore this note—and feel free to reply with the receipt if helpful.

Best,
[Your Name]`,
  },
  {
    id: "email-plus-3d",
    offsetLabel: "+3d",
    tone: "Friendly" as const,
    title: "3 days overdue — polite check-in",
    whenToUse:
      "Most late freelance invoices are caused by busy inboxes, not bad intent. Keep day +3 warm and give the client an easy way to reply.",
    subject: "Checking in — [Project Name] ([Amount], 3 days past due)",
    body: `Hi [Client Name],

Checking in on the [Amount] invoice for [Project Name], which passed its due date on [Due Date] (3 days ago).

You can settle it directly here whenever you have a moment:
[Payment Link]

Let me know if anything is missing on my side or if payment is already in transit.

Best,
[Your Name]`,
  },
  {
    id: "email-plus-7d",
    offsetLabel: "+7d",
    tone: "Firm" as const,
    title: "7 days overdue — clear firm follow-up",
    whenToUse:
      "At one week overdue, shift from casual check-in to a clear ask: settle now or reply with a confirmed payment date.",
    subject: "Follow-up — [Amount] for [Project Name] (7 days overdue)",
    body: `Hi [Client Name],

Following up on the [Amount] invoice for [Project Name], which is now 7 days past the [Due Date] due date.

Please complete payment using the link below, or reply to this email with the date payment is scheduled:
[Payment Link]

Thanks for taking care of this promptly.

Best,
[Your Name]`,
  },
  {
    id: "email-plus-14d",
    offsetLabel: "+14d",
    tone: "Firm" as const,
    title: "14 days overdue — direct overdue notice",
    whenToUse:
      "At two weeks overdue, remove filler language and ask for same-day confirmation so you know whether there is a billing blocker.",
    subject: "Overdue invoice — [Amount] now 14 days past due",
    body: `Hi [Client Name],

This is a follow-up that the [Amount] balance for [Project Name] (due [Due Date]) is now 14 days overdue.

Please settle the balance today via the payment link below, or reply today to confirm when transfer will clear:
[Payment Link]

Regards,
[Your Name]`,
  },
  {
    id: "email-plus-30d",
    offsetLabel: "+30d",
    tone: "Final notice" as const,
    title: "30 days overdue — final automated reminder",
    whenToUse:
      "Use at 30 days overdue as a calm, unambiguous boundary before pausing ongoing work or escalating manually.",
    subject: "Final notice — [Amount] for [Project Name] (30 days overdue)",
    body: `Hi [Client Name],

The [Amount] invoice for [Project Name] (originally due [Due Date]) is now 30 days overdue.

This is my final automated reminder. Please clear the balance via the link below or reply today with confirmation of transfer:
[Payment Link]

Regards,
[Your Name]`,
  },
  {
    id: "email-partial",
    offsetLabel: "Partial",
    tone: "Friendly" as const,
    title: "Partial payment received — remaining balance follow-up",
    whenToUse:
      "Always thank the client for the amount already received and state only the remaining unpaid balance so there is zero confusion.",
    subject:
      "Checking in — [Remaining Amount] remaining on [Project Name]",
    body: `Hi [Client Name],

Thanks again for the [Amount Paid] received so far on [Project Name].

Following up on the remaining balance of [Remaining Amount] (originally due [Due Date]). You can settle the remainder directly here:
[Payment Link]

Please reply if you have any questions or need an updated confirmation.

Best,
[Your Name]`,
  },
  {
    id: "email-paused-promise",
    offsetLabel: "Paused",
    tone: "Neutral" as const,
    title: "Client promised a payment date — pause confirmation",
    whenToUse:
      "When a client replies with a specific date, confirm it in writing and pause automated reminders until that date so you protect goodwill.",
    subject: "Re: [Project Name] — noted for [Promised Date]",
    body: `Hi [Client Name],

Thanks for the update—I've noted [Promised Date] and paused reminders until then.

Here is the payment link again for convenience when you process it:
[Payment Link]

Best,
[Your Name]`,
  },
];

const FAQS = [
  {
    q: "What is the best schedule for sending invoice payment reminders?",
    a: "A predictable 6-step schedule works well for most solo freelancers: 3 days before the due date (-3d), on the due date (0d), and at +3, +7, +14, and +30 days overdue. Early reminders stay warm and helpful; reminders at +7d and beyond shift to clear, firm asks.",
  },
  {
    q: "Should I include my payment link in every reminder email?",
    a: "Yes. Clients often open a reminder on their phone or between meetings. Putting your exact Stripe, Wise, PayPal, UPI, Razorpay, or bank transfer link directly inside every reminder removes the friction of hunting through older threads.",
  },
  {
    q: "How should automated reminders handle client replies?",
    a: "Automated reminder emails should always set your own email address as the Reply-To header so receipts, bank transfer confirmations, or date requests land directly in your inbox instead of a no-reply mailbox.",
  },
  {
    q: "What should I do if a client only pays part of the invoice?",
    a: "Log the amount received immediately and update future follow-ups to reference only the unpaid remaining balance. Chasing the original full amount after a client already paid half erodes trust.",
  },
] as const;

export default function InvoiceEmailTemplatesPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Invoice Reminder Email Templates", path: PATH },
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
          <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-[#FFF1A8] px-3 py-1 text-xs font-semibold text-[#4B4116]">
            Email templates · Copy &amp; paste
          </span>
          <h1 className="mt-4 font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#111111] sm:text-[44px]">
            {HEADLINE}
          </h1>
          <ArticleMetaBar
            publishedDate={SEO_CONTENT_LAST_MODIFIED}
            updatedDate={SEO_CONTENT_LAST_MODIFIED}
          />
          <p className="mt-4 text-[16px] leading-[1.65] text-[#52525B] sm:text-[17px]">
            The cleanest way to chase an unpaid freelance invoice is a calm,
            predictable escalation: friendly before and right after the due
            date, firm once it hits a week overdue, and direct at 30 days. Copy
            any script below or let PingCue run the entire schedule
            automatically.
          </p>
        </header>

        {/* Answer-first cadence summary table */}
        <section
          aria-labelledby="cadence-overview"
          className="mt-8 rounded-[24px] border border-black/[0.08] bg-white p-5 sm:p-6"
        >
          <h2
            id="cadence-overview"
            className="font-sans text-[20px] font-semibold tracking-[-0.025em] text-[#111111]"
          >
            Recommended invoice reminder cadence at a glance
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-black/[0.08] text-[#52525B]">
                  <th className="py-2.5 pr-4 font-semibold">Timing</th>
                  <th className="py-2.5 pr-4 font-semibold">Tone</th>
                  <th className="py-2.5 pr-4 font-semibold">Purpose</th>
                  <th className="py-2.5 font-semibold">Jump to</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] text-[#27272A]">
                {[
                  {
                    offset: "-3d",
                    tone: "Friendly",
                    purpose: "Early heads-up before due date",
                    id: "#email-minus-3d",
                  },
                  {
                    offset: "0d",
                    tone: "Friendly",
                    purpose: "Same-day reminder with payment link",
                    id: "#email-0d",
                  },
                  {
                    offset: "+3d",
                    tone: "Friendly",
                    purpose: "Warm check-in after due date passes",
                    id: "#email-plus-3d",
                  },
                  {
                    offset: "+7d",
                    tone: "Firm",
                    purpose: "Request payment or confirmed date",
                    id: "#email-plus-7d",
                  },
                  {
                    offset: "+14d",
                    tone: "Firm",
                    purpose: "Clear overdue notice asking for update",
                    id: "#email-plus-14d",
                  },
                  {
                    offset: "+30d",
                    tone: "Final notice",
                    purpose: "Final automated reminder before manual action",
                    id: "#email-plus-30d",
                  },
                ].map((row) => (
                  <tr key={row.offset}>
                    <td className="py-2.5 pr-4 font-mono font-semibold text-[#111111] tabular-nums">
                      {row.offset}
                    </td>
                    <td className="py-2.5 pr-4 font-medium">{row.tone}</td>
                    <td className="py-2.5 pr-4">{row.purpose}</td>
                    <td className="py-2.5">
                      <a
                        href={row.id}
                        className="font-semibold text-[#111111] underline hover:text-[#52525B]"
                      >
                        Template
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Copyable Templates */}
        <section
          aria-labelledby="email-templates-heading"
          className="mt-10 space-y-5"
        >
          <h2
            id="email-templates-heading"
            className="font-sans text-[24px] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[28px]"
          >
            Copy-ready invoice payment reminder email templates
          </h2>
          {EMAIL_TEMPLATES.map((template) => (
            <CopyableTemplateCard
              key={template.id}
              id={template.id}
              title={template.title}
              offsetLabel={template.offsetLabel}
              tone={template.tone}
              channel="email"
              subject={template.subject}
              body={template.body}
              whenToUse={template.whenToUse}
            />
          ))}
        </section>

        {/* Deliverability & payment-link checklist */}
        <section
          aria-labelledby="email-checklist-heading"
          className="mt-10 rounded-[24px] border border-black/[0.08] bg-white p-5 sm:p-6"
        >
          <h2
            id="email-checklist-heading"
            className="font-sans text-[20px] font-semibold tracking-[-0.025em] text-[#111111]"
          >
            Before hitting send: subject lines, Reply-To, and payment links
          </h2>
          <ul className="mt-4 space-y-2.5 text-[14.5px] leading-[1.65] text-[#27272A]">
            <li>
              <strong className="font-semibold text-[#111111]">
                Keep the exact amount and project name in the subject line:
              </strong>{" "}
              Finance leads search inboxes by vendor or dollar/rupee figure;
              avoid vague subjects like &ldquo;Following up&rdquo;.
            </li>
            <li>
              <strong className="font-semibold text-[#111111]">
                Route replies to your real inbox:
              </strong>{" "}
              Never send reminders from a dead{" "}
              <code className="rounded bg-[#F4F4F5] px-1.5 py-0.5 font-mono text-[0.9em]">
                no-reply@
              </code>{" "}
              address—clients frequently reply with wire confirmations, tax
              forms, or a promised payment date.
            </li>
            <li>
              <strong className="font-semibold text-[#111111]">
                Link directly to a live checkout URL:
              </strong>{" "}
              Whether you bill with{" "}
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
              , or{" "}
              <a
                href="https://www.paypal.com/us/digital-wallet/send-receive-money/paypal-me"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#111111] underline hover:text-[#52525B]"
              >
                PayPal.Me
              </a>
              , test that the URL opens cleanly on mobile before scheduling.
            </li>
            <li>
              <strong className="font-semibold text-[#111111]">
                If a client goes silent past +14d:
              </strong>{" "}
              Send one brief WhatsApp check-in or pause upcoming deliverables
              rather than firing angry follow-ups—calm, documented reminders
              give you a clean paper trail if you later escalate.
            </li>
          </ul>
        </section>

        {/* Related resources cross-links */}
        <section
          aria-label="Related guides"
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Link
            href="/templates/whatsapp-payment-reminder-messages"
            className="rounded-[22px] border border-black/[0.08] bg-[#D6F7A3] p-5 transition-transform duration-150 hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold text-[#28420C]">Next resource</p>
            <p className="mt-1 text-[17px] font-semibold text-[#111111]">
              Copy polite WhatsApp payment nudge templates →
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

        {/* Open FAQ */}
        <section aria-labelledby="email-faq-heading" className="mt-14">
          <h2
            id="email-faq-heading"
            className="font-sans text-[26px] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[32px]"
          >
            Common questions about invoice reminder emails
          </h2>
          <div className="mt-6">
            <OpenFaqList items={FAQS} />
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}
