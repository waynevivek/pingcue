import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isDodoCheckoutEnabled } from "@/lib/dodo";
import type { BreadcrumbItem } from "@/lib/seo";
import { SUPPORT_EMAIL } from "@/lib/site-config";
import { BrandMark } from "./BrandMark";
import { FoundingPassButton } from "./FoundingPassButton";

export function MarketingShell({
  breadcrumbs,
  children,
}: {
  breadcrumbs: readonly BreadcrumbItem[];
  children: ReactNode;
}) {
  const checkoutLive = isDodoCheckoutEnabled();

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#111111]">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
          >
            <BrandMark size="sm" />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-0.5 rounded-full border border-black/[0.07] bg-[#F4F4F5]/85 p-1 text-[13.5px] font-medium text-[#52525B] md:flex"
          >
            <Link
              href="/guides"
              className="rounded-full px-3.5 py-1.5 transition-all duration-150 hover:bg-white hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              Guides
            </Link>
            <Link
              href="/templates/invoice-payment-reminder-emails"
              className="rounded-full px-3.5 py-1.5 transition-all duration-150 hover:bg-white hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              Email templates
            </Link>
            <Link
              href="/templates/whatsapp-payment-reminder-messages"
              className="rounded-full px-3.5 py-1.5 transition-all duration-150 hover:bg-white hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              WhatsApp nudges
            </Link>
            <Link
              href="/compare/pingcue-vs-invoicing-suites"
              className="rounded-full px-3.5 py-1.5 transition-all duration-150 hover:bg-white hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              Compare
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <Link
              href="/login"
              className="whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#F4F4F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:px-4 sm:text-[13.5px]"
            >
              Start free
            </Link>
            <FoundingPassButton
              source="nav"
              variant="compact"
              label="Founding Pass — $19"
              mobileLabel="Pass — $19"
              checkoutLive={checkoutLive}
              className="h-9 rounded-full bg-[#111111] px-3 text-xs font-semibold text-white shadow-[0_4px_14px_-6px_rgba(17,17,17,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#262626] sm:px-4 sm:text-[13px]"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#52525B]">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={crumb.path} className="inline-flex items-center gap-1.5">
                  {index > 0 && (
                    <ChevronRight
                      className="h-3.5 w-3.5 text-[#A1A1AA]"
                      aria-hidden="true"
                    />
                  )}
                  {isLast ? (
                    <span className="font-semibold text-[#111111]" aria-current="page">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      href={crumb.path}
                      className="transition-colors hover:text-[#111111]"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {children}

        {/* Shared Bottom Conversion Card */}
        <section
          aria-labelledby="automate-with-pingcue"
          className="mt-14 rounded-[28px] border-2 border-[#111111] bg-[#FFFBEB] p-6 shadow-[0_18px_44px_-22px_rgba(17,17,17,0.2)] sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center rounded-full bg-[#111111] px-3 py-1 text-[11px] font-semibold text-white">
                Automate this schedule
              </span>
              <h2
                id="automate-with-pingcue"
                className="mt-3 font-sans text-[24px] font-semibold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[28px]"
              >
                Let PingCue send these follow-ups automatically.
              </h2>
              <p className="mt-2 text-[14.5px] leading-[1.65] text-[#574C1B]">
                Paste any payment link (Stripe, Wise, PayPal, UPI, Razorpay, or
                bank transfer), set the due date, and let PingCue chase unpaid
                balances from <span className="font-mono font-semibold">-3d</span>{" "}
                to <span className="font-mono font-semibold">+30d</span> with
                1-click Pause and client replies routed to your inbox.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2.5 sm:items-end">
              <FoundingPassButton
                source="footer"
                variant="primary"
                checkoutLive={checkoutLive}
                className="h-11 rounded-full bg-[#111111] px-6 text-[14px] font-semibold text-white hover:bg-[#262626]"
              />
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-10 rounded-full border-black/15 bg-white px-5 text-[13.5px] font-semibold text-[#111111] hover:bg-[#F4F4F5]"
              >
                <Link href="/login">Start free with 1 active invoice</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-black/[0.06] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href="/" className="inline-block">
              <BrandMark size="sm" />
            </Link>
            <p className="mt-2 text-xs text-[#52525B]">
              Automated invoice payment reminders for independent freelancers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#52525B]">
            <Link href="/guides" className="hover:text-[#111111]">
              Guides
            </Link>
            <Link
              href="/templates/invoice-payment-reminder-emails"
              className="hover:text-[#111111]"
            >
              Email templates
            </Link>
            <Link
              href="/templates/whatsapp-payment-reminder-messages"
              className="hover:text-[#111111]"
            >
              WhatsApp templates
            </Link>
            <Link
              href="/guides/how-to-chase-unpaid-invoices"
              className="hover:text-[#111111]"
            >
              Overdue playbook
            </Link>
            <Link
              href="/compare/pingcue-vs-invoicing-suites"
              className="hover:text-[#111111]"
            >
              Compare
            </Link>
            <Link href="/terms" className="hover:text-[#111111]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#111111]">
              Privacy
            </Link>
            <Link href="/refund" className="hover:text-[#111111]">
              Refunds
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-[#111111]">
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
