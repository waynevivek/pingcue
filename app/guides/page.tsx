import Link from "next/link";
import { ArrowRight, BookOpen, Mail, MessageCircle, Scale } from "lucide-react";
import { JsonLd } from "@/app/components/JsonLd";
import { MarketingShell } from "@/app/components/MarketingShell";
import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  toAbsoluteUrl,
} from "@/lib/seo";
import { getSiteUrl, SITE_NAME } from "@/lib/site-config";

const PATH = "/guides";

export const metadata = buildPageMetadata({
  title: "Freelance Invoice Reminder Guides & Templates",
  description:
    "Copy-ready invoice reminder email templates, polite WhatsApp nudges, an overdue follow-up playbook, and an honest comparison vs invoicing suites.",
  path: PATH,
  keywords: [
    "invoice payment reminder templates",
    "freelance overdue invoice guide",
    "WhatsApp payment reminder message",
    "PingCue guides",
    "automated invoice chaser",
  ],
});

const RESOURCE_CARDS = [
  {
    href: "/templates/invoice-payment-reminder-emails",
    tag: "Email templates · 8 scripts",
    title: "Invoice payment reminder email templates (-3d to +30d)",
    description:
      "Polite, firm, and final-notice email templates you can copy immediately—including partial-payment reminders and payment-promise confirmations.",
    surface: "bg-[#FFF1A8]",
    textTint: "text-[#4B4116]",
    icon: Mail,
  },
  {
    href: "/templates/whatsapp-payment-reminder-messages",
    tag: "WhatsApp templates · wa.me",
    title: "Polite WhatsApp payment reminder message templates",
    description:
      "Short, respectful WhatsApp nudges built for freelancers sending Stripe, Wise, PayPal, UPI, Razorpay, or bank transfer links—without sounding pushy.",
    surface: "bg-[#D6F7A3]",
    textTint: "text-[#28420C]",
    icon: MessageCircle,
  },
  {
    href: "/guides/how-to-chase-unpaid-invoices",
    tag: "Step-by-step playbook",
    title: "How to chase unpaid invoices without awkwardness",
    description:
      "A practical 6-step cadence covering pre-due reminders, escalating tone shifts, handling partial payments, and pausing when a client commits to a date.",
    surface: "bg-[#D9E6FF]",
    textTint: "text-[#1E335C]",
    icon: BookOpen,
  },
  {
    href: "/compare/pingcue-vs-invoicing-suites",
    tag: "Honest comparison",
    title: "PingCue vs full invoicing suites & manual reminders",
    description:
      "Clear breakdown of when a lightweight $19 one-time payment-link chaser beats heavy accounting software—and when you genuinely need a full accounting suite.",
    surface: "bg-[#FFD7DC]",
    textTint: "text-[#5C232B]",
    icon: Scale,
  },
] as const;

const SCENARIO_ROUTES = [
  {
    situation: "An invoice is overdue right now and you need wording fast",
    recommendation: "Start with the escalating email scripts (-3d to +30d)",
    href: "/templates/invoice-payment-reminder-emails",
    cta: "Open email templates",
  },
  {
    situation: "Your client replies faster on WhatsApp than email",
    recommendation: "Use a 2-line prefilled wa.me payment nudge",
    href: "/templates/whatsapp-payment-reminder-messages",
    cta: "Open WhatsApp templates",
  },
  {
    situation: "You want a repeatable system for partial payments & client promises",
    recommendation: "Read the 6-step overdue invoice follow-up playbook",
    href: "/guides/how-to-chase-unpaid-invoices",
    cta: "Read the playbook",
  },
  {
    situation: "You are deciding between PingCue and a full accounting tool",
    recommendation: "Review the side-by-side workflow and cost breakdown",
    href: "/compare/pingcue-vs-invoicing-suites",
    cta: "See comparison",
  },
] as const;

export default function GuidesHubPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Guides & Templates", path: PATH },
  ] as const;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Freelance Invoice Reminder Guides & Templates — ${SITE_NAME}`,
    description:
      "Copy-ready invoice reminder templates, overdue follow-up playbooks, and tool comparisons for solo freelancers.",
    url: toAbsoluteUrl(PATH, siteUrl),
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: RESOURCE_CARDS.map((card, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: card.title,
        description: card.description,
        url: toAbsoluteUrl(card.href, siteUrl),
      })),
    },
  };

  return (
    <MarketingShell breadcrumbs={breadcrumbs}>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbs, siteUrl)} />
      <JsonLd data={collectionJsonLd} />

      <header className="max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white px-3 py-1 text-xs font-semibold text-[#111111]">
          Resources for independent freelancers
        </span>
        <h1 className="mt-4 font-sans text-[34px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#111111] sm:text-[46px]">
          Invoice reminder guides &amp; copy-ready templates
        </h1>
        <p className="mt-4 text-[16px] leading-[1.65] text-[#52525B] sm:text-[17px]">
          Practical follow-up scripts and workflows for solo freelancers who
          bill via payment links over email or WhatsApp. Copy any script
          directly, or automate the entire cadence inside PingCue.
        </p>
      </header>

      <section
        aria-label="Resource directory"
        className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2"
      >
        {RESOURCE_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`group flex flex-col justify-between rounded-[28px] border border-black/[0.06] ${card.surface} p-6 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:p-7`}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[12px] font-semibold text-[#111111]">
                    {card.tag}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#111111]"
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                </div>

                <h2 className="mt-4 font-sans text-[22px] font-semibold leading-tight tracking-[-0.025em] text-[#111111]">
                  {card.title}
                </h2>
                <p
                  className={`mt-2.5 text-[14.5px] leading-[1.6] ${card.textTint}`}
                >
                  {card.description}
                </p>
              </div>

              <span className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#111111]">
                <span>Read guide</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          );
        })}
      </section>

      <section
        aria-labelledby="choose-guide-heading"
        className="mt-12 rounded-[24px] border border-black/[0.08] bg-white p-6 sm:p-7"
      >
        <h2
          id="choose-guide-heading"
          className="font-sans text-[22px] font-semibold tracking-[-0.025em] text-[#111111]"
        >
          Pick the right resource for your situation
        </h2>
        <p className="mt-2 max-w-[64ch] text-[14.5px] leading-[1.65] text-[#52525B]">
          Every script in this library is written for link-based freelancers
          using Stripe payment links, Wise, PayPal, UPI, Razorpay, or bank
          transfers—keeping tone polite early and unambiguous only when an
          invoice genuinely slips.
        </p>

        <div className="mt-5 divide-y divide-black/[0.06]">
          {SCENARIO_ROUTES.map((row) => (
            <div
              key={row.href}
              className="flex flex-col gap-2 py-4 first:pt-1 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div>
                <p className="text-[14.5px] font-semibold text-[#111111]">
                  {row.situation}
                </p>
                <p className="mt-0.5 text-[13.5px] text-[#52525B]">
                  {row.recommendation}
                </p>
              </div>
              <Link
                href={row.href}
                className="inline-flex shrink-0 items-center gap-1 text-[13.5px] font-semibold text-[#111111] underline hover:text-[#52525B]"
              >
                <span>{row.cta}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
