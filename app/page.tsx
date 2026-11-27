import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  Mail,
  MessageCircle,
  Pause,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isDodoCheckoutEnabled } from "@/lib/dodo";
import { buildHomeJsonLd } from "@/lib/seo";
import { SUPPORT_EMAIL } from "@/lib/site-config";
import { EscalationCadenceDemo } from "./components/EscalationCadenceDemo";
import { FaqAccordion } from "./components/FaqAccordion";
import { FoundingPassButton } from "./components/FoundingPassButton";
import { HeaderAuthLink } from "./components/HeaderAuthLink";
import { JsonLd } from "./components/JsonLd";
import heroStyles from "./components/HeroEscalation.module.css";
import {
  ChimeBellSticker,
  DollarCoinSticker,
  InlineEnvelopeSticker,
  InlinePaidBadgeSticker,
  InteractiveSticker,
  PaidStampSticker,
  PaperPlaneSticker,
  PerchedPingMascot,
  PlayfulBrandMark,
  SparkleSticker,
  StarBuddySticker,
} from "./components/HeroStickers";

const WORKFLOW_ITEMS = [
  {
    tag: "-3d to +30d",
    title: "Escalating reminders you control",
    body: "Default schedule runs at -3d, 0d, +3d, +7d, +14d, and +30d, shifting cleanly from friendly to firm to final notice. Edit any step per invoice.",
  },
  {
    tag: "Pause & preview",
    title: "1-click Pause and test email preview",
    body: "Client promised to pay next Friday? Hit Pause and set a date so PingCue stays quiet. Preview with \"Send test email to me\" before anything goes out.",
  },
  {
    tag: "wa.me link",
    title: "Zero-API WhatsApp nudges",
    body: "Need a quick ping on WhatsApp? One tap opens WhatsApp with a polite, prefilled message and your payment link—no WhatsApp Business API setup required.",
  },
  {
    tag: "USD · EUR · GBP · INR",
    title: "Partial payments across four currencies",
    body: "Track USD, EUR, GBP, and INR separately without FX guesswork. Log an amount received—reminders chase only the remaining balance and stop once paid.",
  },
] as const;

const FAQS = [
  {
    q: "Do I need an invoicing suite or Stripe to use PingCue?",
    a: "No. PingCue is built specifically for freelancers who send Stripe payment links, Wise, PayPal, or bank-transfer links by email or WhatsApp. Paste your link and due date.",
  },
  {
    q: "Where do client replies go?",
    a: "Every reminder sets your email as the Reply-To address, so when a client replies with a payment receipt or question, it lands directly in your inbox.",
  },
  {
    q: "What happens when a client pays half now and half later?",
    a: "Enter the amount received to mark the invoice partial. PingCue automatically updates the remaining balance in future reminders and stops chasing once the balance reaches zero.",
  },
  {
    q: "Is the $19 Founding Pass really a one-time payment?",
    a: "Yes—$19 once, with no recurring subscription. It unlocks unlimited active invoices, 1-click WhatsApp nudges, and includes the upcoming V1.5 Document Chaser for 12 months.",
  },
] as const;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const checkoutLive = isDodoCheckoutEnabled();

  return (
    <div id="top" className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#111111]">
      <JsonLd data={buildHomeJsonLd(FAQS)} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-[9px] focus:bg-[#111111] focus:px-3.5 focus:py-2 focus:text-xs font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C3F584]"
      >
        Skip to main content
      </a>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
          >
            <PlayfulBrandMark size="sm" />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-0.5 rounded-full border border-black/[0.07] bg-[#F4F4F5]/85 p-1 text-[13.5px] font-medium text-[#52525B] md:flex"
          >
            <a
              href="#how-it-works"
              className="rounded-full px-3.5 py-1.5 transition-all duration-150 hover:bg-white hover:text-[#111111] hover:shadow-[0_1px_2px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="rounded-full px-3.5 py-1.5 transition-all duration-150 hover:bg-white hover:text-[#111111] hover:shadow-[0_1px_2px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="rounded-full px-3.5 py-1.5 transition-all duration-150 hover:bg-white hover:text-[#111111] hover:shadow-[0_1px_2px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              FAQ
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <HeaderAuthLink />
            <FoundingPassButton
              source="nav"
              variant="compact"
              label="Founding Pass — $19"
              mobileLabel="Pass — $19"
              checkoutLive={checkoutLive}
              className="h-9 rounded-full bg-[#111111] px-3 text-xs font-semibold text-white shadow-[0_4px_14px_-6px_rgba(17,17,17,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#262626] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-4 sm:text-[13px]"
            />
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {/* Hero */}
        <section className="relative overflow-x-clip border-b border-black/[0.06] bg-[#FFFFFF]">
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-16">
            {/* Editorial Copy Stage + Floating Die-Cut Vector Stickers */}
            <div className="relative mx-auto max-w-[960px] text-center">
              {/* Left-flank die-cut vinyl stickers (desktop) */}
              <div
                className={`${heroStyles.stickerPop} ${heroStyles.stickerDelay1} absolute left-0 top-1 hidden lg:block`}
              >
                <InteractiveSticker tiltClass="-rotate-[10deg] hover:-rotate-[4deg]">
                  <PaperPlaneSticker className="h-[68px] w-[76px]" />
                </InteractiveSticker>
              </div>
              <div
                className={`${heroStyles.stickerPop} ${heroStyles.stickerDelay2} absolute -left-4 top-[148px] hidden lg:block`}
              >
                <InteractiveSticker tiltClass="-rotate-[8deg] hover:rotate-[2deg]">
                  <ChimeBellSticker className="h-[72px] w-[72px]" />
                </InteractiveSticker>
              </div>
              <div
                className={`${heroStyles.stickerPop} ${heroStyles.stickerDelay3} absolute left-10 top-[266px] hidden lg:block`}
              >
                <InteractiveSticker tiltClass="rotate-[9deg] hover:rotate-[2deg]">
                  <DollarCoinSticker className="h-[64px] w-[64px]" />
                </InteractiveSticker>
              </div>

              {/* Right-flank die-cut vinyl stickers (desktop) */}
              <div
                className={`${heroStyles.stickerPop} ${heroStyles.stickerDelay4} absolute right-0 top-0 hidden lg:block`}
              >
                <InteractiveSticker tiltClass="rotate-[8deg] hover:rotate-[2deg]">
                  <PaidStampSticker className="h-[68px] w-[82px]" />
                </InteractiveSticker>
              </div>
              <div
                className={`${heroStyles.stickerPop} ${heroStyles.stickerDelay5} absolute -right-3 top-[144px] hidden lg:block`}
              >
                <InteractiveSticker tiltClass="rotate-[10deg] hover:rotate-[0deg]">
                  <StarBuddySticker className="h-[76px] w-[76px]" />
                </InteractiveSticker>
              </div>
              <div
                className={`${heroStyles.stickerPop} ${heroStyles.stickerDelay6} absolute right-10 top-[262px] hidden lg:block`}
              >
                <InteractiveSticker tiltClass="-rotate-[7deg] hover:rotate-[3deg]">
                  <SparkleSticker className="h-[68px] w-[72px]" />
                </InteractiveSticker>
              </div>

              {/* Centered Headline with Inline Die-Cut Stickers */}
              <h1
                className={`${heroStyles.heroRise} ${heroStyles.delay1} mx-auto max-w-[16ch] font-sans text-[38px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#111111] sm:text-[54px] lg:text-[64px] lg:leading-[1.06] text-balance`}
              >
                Stop awkwardly{" "}
                <InlineEnvelopeSticker className="mx-0.5 h-[0.86em] w-auto -rotate-[6deg] transition-transform duration-200 hover:rotate-[4deg] hover:scale-110" />{" "}
                chasing unpaid invoices.{" "}
                <InlinePaidBadgeSticker className="ml-0.5 h-[0.82em] w-auto rotate-[8deg] transition-transform duration-200 hover:-rotate-[4deg] hover:scale-110" />
              </h1>

              {/* Centered Subtitle with dusk.bot-style Inline Channel Pills */}
              <p
                className={`${heroStyles.heroRise} ${heroStyles.delay2} mx-auto mt-5 max-w-[58ch] text-[16px] leading-[1.65] tracking-[-0.01em] text-[#52525B] sm:text-[18px]`}
              >
                Built for freelancers who send payment links over{" "}
                <span className="mx-0.5 inline-flex items-center gap-1 rounded-lg border border-black/[0.08] bg-[#F4F4F5] px-2 py-0.5 align-baseline text-[0.92em] font-medium text-[#111111]">
                  <Mail
                    className="h-3.5 w-3.5 text-[#3B82F6]"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  email
                </span>{" "}
                or{" "}
                <span className="mx-0.5 inline-flex items-center gap-1 rounded-lg border border-black/[0.08] bg-[#F4F4F5] px-2 py-0.5 align-baseline text-[0.92em] font-medium text-[#111111]">
                  <MessageCircle
                    className="h-3.5 w-3.5 text-[#16A34A]"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  WhatsApp
                </span>
                . Add the client, due date, and link; PingCue sends polite
                reminders that get firmer as an invoice goes overdue.
              </p>

              {/* Centered Pill CTAs */}
              <div
                className={`${heroStyles.heroRise} ${heroStyles.delay3} mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center`}
              >
                <FoundingPassButton
                  source="hero"
                  variant="primary"
                  checkoutLive={checkoutLive}
                  className="h-12 rounded-full bg-[#111111] px-6 text-[15px] font-semibold tracking-[-0.01em] text-white shadow-[0_8px_22px_-8px_rgba(17,17,17,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#262626] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                />
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-black/[0.08] bg-[#F4F4F5] px-6 text-[15px] font-semibold tracking-[-0.01em] text-[#111111] shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-black/15 hover:bg-[#EAEAEF] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <Link href="/login">Start free with 1 invoice</Link>
                </Button>
              </div>

              {/* Compact Colored-Dot Proof Strip */}
              <div
                className={`${heroStyles.heroRise} ${heroStyles.delay4} mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-[#52525B]`}
              >
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-[#22C55E]"
                  />
                  Free for 1 active invoice
                </span>
                <span className="inline-flex items-center gap-2 whitespace-nowrap tabular-nums">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-[#60A5FA]"
                  />
                  USD · EUR · GBP · INR
                </span>
                <span className="inline-flex items-center gap-2 whitespace-nowrap tabular-nums">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-[#FBBF24]"
                  />
                  $19 one-time · No subscription
                </span>
              </div>
            </div>

            {/* Framed Live Demo Stage + Pastel Bento Escalation Showcase */}
            <div className="mt-12 sm:mt-14">
              <EscalationCadenceDemo />
            </div>
          </div>
        </section>

        {/* How It Works — stickitupx.com Pastel Bento Grid + dusk.bot Inline Pills */}
        <section
          id="how-it-works"
          className="scroll-mt-20 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#111111] sm:text-[44px] text-balance">
              Polite at first. Firm when it slips.
            </h2>
            <p className="mx-auto mt-4 max-w-[58ch] text-[15px] leading-[1.7] text-[#52525B] sm:text-[17px]">
              You already send{" "}
              <span className="mx-0.5 inline-flex items-center rounded-lg border border-black/[0.08] bg-[#F4F4F5] px-2 py-0.5 text-[0.9em] font-medium text-[#111111]">
                Stripe links
              </span>
              ,{" "}
              <span className="mx-0.5 inline-flex items-center rounded-lg border border-black/[0.08] bg-[#F4F4F5] px-2 py-0.5 text-[0.9em] font-medium text-[#111111]">
                Wise
              </span>
              ,{" "}
              <span className="mx-0.5 inline-flex items-center rounded-lg border border-black/[0.08] bg-[#F4F4F5] px-2 py-0.5 text-[0.9em] font-medium text-[#111111]">
                PayPal
              </span>
              , or bank links directly to clients. PingCue keeps those exact
              links moving forward without pulling you into an accounting suite.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-12">
            {/* Bento 1: Butter Yellow — Escalating reminders */}
            <article className="relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#FFF1A8] p-6 sm:p-8 md:col-span-7">
              <div>
                <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[12px] font-semibold text-[#111111] tabular-nums shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  {WORKFLOW_ITEMS[0].tag}
                </span>
                <h3 className="mt-4 text-[22px] font-semibold leading-tight tracking-[-0.025em] text-[#111111] sm:text-[24px]">
                  {WORKFLOW_ITEMS[0].title}
                </h3>
                <p className="mt-2.5 max-w-[48ch] text-[14px] leading-[1.6] text-[#4B4116] sm:text-[15px]">
                  {WORKFLOW_ITEMS[0].body}
                </p>
              </div>

              {/* Tactile Mini Cadence Preview + Sticker */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { step: "-3d", label: "Friendly", dot: "bg-[#8CE668]" },
                    { step: "+7d", label: "Firm", dot: "bg-[#FACC15]" },
                    { step: "+30d", label: "Final", dot: "bg-[#FB7185]" },
                  ].map((pill) => (
                    <span
                      key={pill.step}
                      className="inline-flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-3 py-2 text-[12px] font-semibold text-[#111111] shadow-[0_3px_0_rgba(17,17,17,0.08)]"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 rounded-full ${pill.dot}`}
                      />
                      <span className="tabular-nums">{pill.step}</span>
                      <span className="font-medium text-[#52525B]">
                        {pill.label}
                      </span>
                    </span>
                  ))}
                </div>
                <ChimeBellSticker className="hidden h-14 w-14 -rotate-[8deg] shrink-0 sm:block" />
              </div>
            </article>

            {/* Bento 2: Soft Coral — Pause & preview */}
            <article className="relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#FFD7DC] p-6 sm:p-8 md:col-span-5">
              <div>
                <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[12px] font-semibold text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  {WORKFLOW_ITEMS[1].tag}
                </span>
                <h3 className="mt-4 text-[22px] font-semibold leading-tight tracking-[-0.025em] text-[#111111] sm:text-[24px]">
                  {WORKFLOW_ITEMS[1].title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-[1.6] text-[#5C232B] sm:text-[15px]">
                  {WORKFLOW_ITEMS[1].body}
                </p>
              </div>

              {/* Tactile 3D Keycap Preview */}
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3.5 py-2 text-[12px] font-semibold text-[#111111] shadow-[0_3px_0_rgba(17,17,17,0.12)]">
                  <Pause
                    className="h-3.5 w-3.5 text-[#111111]"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Pause
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-[#111111] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_3px_0_rgba(17,17,17,0.28)]">
                  <Send
                    className="h-3.5 w-3.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Send test email to me
                </span>
              </div>
            </article>

            {/* Bento 3: Mint Lime — Zero-API WhatsApp nudges */}
            <article className="relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#D6F7A3] p-6 sm:p-8 md:col-span-5">
              <div>
                <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[12px] font-semibold text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  {WORKFLOW_ITEMS[2].tag}
                </span>
                <h3 className="mt-4 text-[22px] font-semibold leading-tight tracking-[-0.025em] text-[#111111] sm:text-[24px]">
                  {WORKFLOW_ITEMS[2].title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-[1.6] text-[#28420C] sm:text-[15px]">
                  {WORKFLOW_ITEMS[2].body}
                </p>
              </div>

              {/* Prefilled WhatsApp Mini Bubble */}
              <div className="mt-7 flex items-end justify-between gap-3">
                <div className="flex-1 rounded-2xl border border-black/[0.08] bg-white p-3.5 shadow-[0_6px_18px_-8px_rgba(17,24,39,0.14)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-[#15803D]">
                      <MessageCircle
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      wa.me prefilled
                    </span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-[#63636A]"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1.5 text-[12px] leading-snug text-[#3F3F46]">
                    Hi Maya, gentle nudge on $1,200 due 14 Nov…
                  </p>
                </div>
                <PaperPlaneSticker className="hidden h-12 w-14 rotate-[6deg] shrink-0 sm:block" />
              </div>
            </article>

            {/* Bento 4: Periwinkle Blue — Partial payments across four currencies */}
            <article className="relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#D9E6FF] p-6 sm:p-8 md:col-span-7">
              <div>
                <span className="inline-flex items-center whitespace-nowrap rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[12px] font-semibold text-[#111111] tabular-nums shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  {WORKFLOW_ITEMS[3].tag}
                </span>
                <h3 className="mt-4 text-[22px] font-semibold leading-tight tracking-[-0.025em] text-[#111111] sm:text-[24px]">
                  {WORKFLOW_ITEMS[3].title}
                </h3>
                <p className="mt-2.5 max-w-[50ch] text-[14px] leading-[1.6] text-[#1E335C] sm:text-[15px]">
                  {WORKFLOW_ITEMS[3].body}
                </p>
              </div>

              {/* Multi-Currency Tactile Strip + Stickers */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { code: "USD", symbol: "$", active: true },
                    { code: "EUR", symbol: "€", active: false },
                    { code: "GBP", symbol: "£", active: false },
                    { code: "INR", symbol: "₹", active: false },
                  ].map((curr) => (
                    <span
                      key={curr.code}
                      className={
                        curr.active
                          ? "inline-flex items-center gap-1.5 whitespace-nowrap rounded-2xl border border-[#111111] bg-[#111111] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_3px_0_rgba(17,17,17,0.28)]"
                          : "inline-flex items-center gap-1.5 whitespace-nowrap rounded-2xl border border-black/[0.08] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#111111] shadow-[0_3px_0_rgba(17,17,17,0.08)]"
                      }
                    >
                      <span>{curr.symbol}</span>
                      <span>{curr.code}</span>
                    </span>
                  ))}
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <DollarCoinSticker className="h-12 w-12 -rotate-[8deg]" />
                  <PaidStampSticker className="h-12 w-14 rotate-[6deg]" />
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Pricing — dusk.bot Perched Mascot + Collectible Banner Cards */}
        <section
          id="pricing"
          className="scroll-mt-20 border-y border-black/[0.06] bg-[#FAFAFA] py-16 sm:py-24"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#111111] sm:text-[44px] text-balance">
                Pay once. Chase invoices all year.
              </h2>
              <p className="mt-3 text-[15px] leading-[1.65] text-[#52525B] sm:text-[17px]">
                Start free with your first active invoice, or unlock the
                one-time Founding Pass with zero monthly subscription.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
              {/* Free Plan — with dusk.bot-inspired sleeping perched mascot + sky banner */}
              <div className="relative flex flex-col rounded-[28px] border border-black/[0.08] bg-white p-6 shadow-[0_12px_36px_-18px_rgba(15,23,42,0.12)] sm:p-7">
                <PerchedPingMascot
                  sleeping={true}
                  className="absolute -top-[42px] left-6 z-10 h-[56px] w-[88px]"
                />

                {/* Mini Sky & Cloud Banner */}
                <div
                  aria-hidden="true"
                  className="relative mb-6 h-[68px] w-full overflow-hidden rounded-[18px] bg-[#64C7FF]"
                >
                  <svg
                    viewBox="0 0 400 80"
                    preserveAspectRatio="xMidYMid slice"
                    className="h-full w-full"
                    fill="none"
                  >
                    <rect width="400" height="80" fill="#64C7FF" />
                    <rect y="48" width="400" height="32" fill="#9CE0FF" />
                    <rect x="44" y="28" width="84" height="18" rx="9" fill="#FFFFFF" />
                    <rect x="64" y="18" width="46" height="16" rx="8" fill="#FFFFFF" />
                    <rect x="220" y="20" width="124" height="22" rx="11" fill="#FFFFFF" />
                    <rect x="248" y="10" width="68" height="20" rx="10" fill="#FFFFFF" />
                    <rect x="234" y="34" width="96" height="8" rx="4" fill="#FFE0EB" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#111111]">
                    Free
                  </h3>
                  <p className="mt-1 text-[14px] text-[#52525B]">
                    Try PingCue on a real invoice before paying anything.
                  </p>
                  <div className="mt-5 flex items-baseline gap-2 border-y border-black/[0.06] py-5">
                    <span className="text-[42px] font-bold leading-none tracking-[-0.04em] text-[#111111] tabular-nums">
                      $0
                    </span>
                    <span className="text-[14px] font-medium text-[#63636A]">
                      forever
                    </span>
                  </div>
                </div>

                <ul className="mt-6 flex-1 space-y-3 text-[14px] text-[#27272A]">
                  {[
                    "1 active invoice at a time",
                    "Full escalating email schedule (-3d to +30d)",
                    "Custom schedule & 1-click Pause button",
                    "Send test email to yourself",
                    "USD, EUR, GBP & INR dashboard totals",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F4F4F5] text-[#111111]"
                      >
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 w-full rounded-full border-black/10 bg-[#F4F4F5] text-[15px] font-semibold text-[#111111] shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-black/15 hover:bg-[#EAEAEF] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <Link href="/login">Start free with 1 invoice</Link>
                  </Button>
                </div>
              </div>

              {/* Founding Pass — Butter-Gold Banner + Star Buddy Sticker */}
              <div className="relative flex flex-col rounded-[28px] border-2 border-[#111111] bg-[#FFFBEB] p-6 shadow-[0_20px_50px_-22px_rgba(17,17,17,0.22)] sm:p-7">
                <div className="pointer-events-none absolute -right-3 -top-7 z-10 hidden sm:block">
                  <StarBuddySticker className="h-[68px] w-[68px] rotate-[10deg]" />
                </div>

                {/* Mini Meadow & Sunshine Banner */}
                <div
                  aria-hidden="true"
                  className="relative mb-6 h-[68px] w-full overflow-hidden rounded-[18px] bg-[#D6F7A3]"
                >
                  <svg
                    viewBox="0 0 400 80"
                    preserveAspectRatio="xMidYMid slice"
                    className="h-full w-full"
                    fill="none"
                  >
                    <rect width="400" height="80" fill="#FFE875" />
                    <path
                      d="M0 44C90 22 190 56 290 36C340 26 375 30 400 36V80H0V44Z"
                      fill="#C8F392"
                    />
                    <path
                      d="M0 60C120 46 250 72 400 54V80H0V60Z"
                      fill="#A8EC62"
                    />
                    <circle cx="62" cy="24" r="10" fill="#FFFFFF" opacity="0.9" />
                    <circle cx="152" cy="56" r="4" fill="#FFFFFF" />
                    <circle cx="288" cy="52" r="4.5" fill="#FF9AA2" />
                  </svg>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#111111]">
                      Founding Pass
                    </h3>
                    <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-[#111111] px-3 py-1 text-[11px] font-semibold text-white">
                      One-time · No subscription
                    </span>
                  </div>
                  <p className="mt-1 text-[14px] text-[#574C1B]">
                    Built for solo freelancers chasing multiple clients every
                    month.
                  </p>
                  <div className="mt-5 flex items-baseline gap-2 border-y border-black/[0.08] py-5">
                    <span className="text-[42px] font-bold leading-none tracking-[-0.04em] text-[#111111] tabular-nums">
                      $19
                    </span>
                    <span className="text-[14px] font-medium text-[#574C1B]">
                      one-time payment
                    </span>
                  </div>
                </div>

                <ul className="mt-6 flex-1 space-y-3 text-[14px] text-[#111111]">
                  {[
                    "Unlimited active invoices",
                    "Everything in Free (escalating emails, Pause, test sends)",
                    "Zero-API 1-click \"Send on WhatsApp\" prefilled nudges",
                    "Includes upcoming V1.5 Document Chaser for 12 months",
                    "7-day no-questions-asked refund guarantee",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C8F392] text-[#111111]"
                      >
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-col items-stretch gap-3">
                  <FoundingPassButton
                    source="pricing"
                    variant="primary"
                    className="h-12 w-full rounded-full bg-[#111111] text-[15px] font-semibold text-white shadow-[0_8px_22px_-8px_rgba(17,17,17,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#262626] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    checkoutLive={checkoutLive}
                  />
                  <p className="text-center text-[12px] text-[#574C1B]">
                    Secure checkout powered by Dodo Payments (Merchant of
                    Record).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="scroll-mt-20 mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="text-center">
            <h2 className="font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#111111] sm:text-[42px]">
              Straight answers
            </h2>
          </div>

          <div className="mt-10">
            <FaqAccordion items={FAQS} />
          </div>
        </section>

        {/* Closing Band — Open White Finale with Floating Stickers */}
        <section className="relative overflow-x-clip bg-[#FFFFFF] px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
          <div className="relative mx-auto max-w-5xl text-center">
            {/* Floating perimeter stickers framing the finale CTA (desktop) */}
            <div className="absolute left-2 top-0 hidden md:block lg:left-6">
              <InteractiveSticker tiltClass="-rotate-[12deg] hover:-rotate-[4deg]">
                <StarBuddySticker className="h-16 w-16" />
              </InteractiveSticker>
            </div>
            <div className="absolute bottom-0 left-10 hidden md:block lg:left-16">
              <InteractiveSticker tiltClass="rotate-[8deg] hover:rotate-0">
                <PaidStampSticker className="h-14 w-[68px]" />
              </InteractiveSticker>
            </div>
            <div className="absolute right-4 top-2 hidden md:block lg:right-8">
              <InteractiveSticker tiltClass="rotate-[10deg] hover:rotate-[2deg]">
                <ChimeBellSticker className="h-16 w-16" />
              </InteractiveSticker>
            </div>
            <div className="absolute bottom-0 right-10 hidden md:block lg:right-16">
              <InteractiveSticker tiltClass="-rotate-[8deg] hover:rotate-0">
                <SparkleSticker className="h-14 w-16" />
              </InteractiveSticker>
            </div>

            <h2 className="mx-auto max-w-[16ch] font-sans text-[34px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#111111] sm:text-[48px] text-balance">
              Get paid faster without writing another follow-up.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.65] text-[#52525B] sm:text-[17px]">
              Lock in the $19 Founding Pass today—unlimited invoices, WhatsApp
              nudges, and 12 months of V1.5 Document Chaser with zero monthly
              fees.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <FoundingPassButton
                source="footer"
                variant="primary"
                checkoutLive={checkoutLive}
                className="h-12 rounded-full bg-[#111111] px-7 text-[15px] font-semibold text-white shadow-[0_8px_22px_-8px_rgba(17,17,17,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#262626] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              />
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-black/[0.08] bg-[#F4F4F5] px-6 text-[15px] font-semibold text-[#111111] shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-black/15 hover:bg-[#EAEAEF] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <Link href="/login">Start free with 1 invoice</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — Full-Bleed Atmospheric Sky + Oversized Stickered Wordmark */}
      <footer
        id="contact"
        className="relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#D8ECFF] to-[#84C9FF] pt-10 sm:pt-14"
      >
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
            {/* Brand & Slogan Column */}
            <div className="lg:col-span-5">
              <p className="font-sans text-[24px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#111111] sm:text-[28px]">
                Polite reminders.
                <br />
                Paid on time.{" "}
                <InlinePaidBadgeSticker className="ml-0.5 h-[0.92em] w-auto rotate-[8deg]" />
              </p>
              <p className="mt-3 text-[13.5px] font-medium text-[#334155]">
                Built for independent freelancers.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-medium text-[#334155]">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-[#22C55E]"
                  />
                  Free for 1 active invoice
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-[#2563EB]"
                  />
                  USD · EUR · GBP · INR
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-[#D97706]"
                  />
                  $19 one-time · No subscription
                </span>
              </div>
            </div>

            {/* Structured Link Columns */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#334155]">
                  Product
                </p>
                <ul className="mt-3.5 space-y-2 text-[14px] font-medium text-[#1E293B]">
                  <li>
                    <a
                      href="#how-it-works"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      How it works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#pricing"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#faq"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      FAQ
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#334155]">
                  Resources
                </p>
                <ul className="mt-3.5 space-y-2 text-[14px] font-medium text-[#1E293B]">
                  <li>
                    <Link
                      href="/guides"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      All Guides
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/templates/invoice-payment-reminder-emails"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      Email Templates
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/templates/whatsapp-payment-reminder-messages"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      WhatsApp Nudges
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/guides/how-to-chase-unpaid-invoices"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      Overdue Playbook
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/compare/pingcue-vs-invoicing-suites"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      Compare Tools
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#334155]">
                  Legal
                </p>
                <ul className="mt-3.5 space-y-2 text-[14px] font-medium text-[#1E293B]">
                  <li>
                    <Link
                      href="/terms"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/refund"
                      className="inline-block rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      Refund Policy
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#334155]">
                  Connect
                </p>
                <ul className="mt-3.5 space-y-2 text-[14px] font-medium text-[#1E293B]">
                  <li>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="inline-block break-words rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#top"
                      className="inline-flex items-center gap-1 rounded py-0.5 transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    >
                      <span>Back to top</span>
                      <ArrowUp
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Oversized Bottom-Cropped White Wordmark with Perched Die-Cut Stickers */}
        <div className="relative mx-auto mt-2 max-w-[1400px] select-none px-2 sm:mt-4 sm:px-6">
          <div
            aria-hidden="true"
            className="relative flex items-end justify-center pt-6 sm:pt-10"
          >
            {/* Perched interactive stickers riding along the giant white letters */}
            <div className="absolute left-[11%] top-[8%] z-10 sm:left-[15%] sm:top-[12%]">
              <InteractiveSticker tiltClass="-rotate-[14deg] hover:-rotate-[4deg]">
                <StarBuddySticker className="h-10 w-10 sm:h-16 sm:w-16 lg:h-[82px] lg:w-[82px]" />
              </InteractiveSticker>
            </div>

            <div className="absolute bottom-[16%] left-[32%] z-10 sm:left-[34%]">
              <InteractiveSticker tiltClass="rotate-[10deg] hover:rotate-0">
                <DollarCoinSticker className="h-8 w-8 sm:h-14 sm:w-14 lg:h-[68px] lg:w-[68px]" />
              </InteractiveSticker>
            </div>

            <div className="absolute left-[54%] top-[10%] z-10 sm:left-[56%] sm:top-[12%]">
              <InteractiveSticker tiltClass="-rotate-[9deg] hover:rotate-[2deg]">
                <InlineEnvelopeSticker className="h-8 w-auto sm:h-14 lg:h-[64px]" />
              </InteractiveSticker>
            </div>

            <div className="absolute bottom-[16%] right-[11%] z-10 sm:right-[13%]">
              <InteractiveSticker tiltClass="rotate-[11deg] hover:rotate-[2deg]">
                <PaidStampSticker className="h-9 w-11 sm:h-14 sm:w-[70px] lg:h-[68px] lg:w-[84px]" />
              </InteractiveSticker>
            </div>

            <div className="absolute right-[26%] top-[2%] z-10 hidden sm:block">
              <InteractiveSticker tiltClass="-rotate-[8deg] hover:rotate-[4deg]">
                <SparkleSticker className="h-12 w-14 lg:h-16 lg:w-[72px]" />
              </InteractiveSticker>
            </div>

            <span className="block w-full translate-y-[16%] text-center font-sans text-[23vw] font-extrabold leading-[0.82] tracking-[-0.055em] text-white sm:text-[20vw] lg:text-[min(19.5vw,268px)]">
              PingCue
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
