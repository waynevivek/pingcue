import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service — PingCue",
  description: "Terms of Service for using PingCue.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to PingCue</span>
        </Link>

        <Card className="mt-6 p-6 sm:p-10">
          <article>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Last updated: November 2026
            </p>

            <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground/90">
              <section>
                <h2 className="text-base font-semibold text-foreground">
                  1. Service Overview
                </h2>
                <p className="mt-1.5">
                  PingCue is a payment-reminder tool for freelancers that sends
                  scheduled email reminders and generates prefilled WhatsApp
                  links for invoices you enter. PingCue does not process client
                  invoice payments on your behalf and is not a legal, tax, or
                  accounting advisor.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">
                  2. Acceptable Use
                </h2>
                <p className="mt-1.5">
                  You agree to send reminders only to genuine clients who owe
                  you a valid payment for work agreed upon. Sending unsolicited
                  bulk email, spam, harassment, or fraudulent payment links is
                  strictly prohibited and may result in immediate account
                  suspension.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">
                  3. Plans &amp; Billing
                </h2>
                <p className="mt-1.5">
                  The Free plan includes 1 active invoice. The Founding Pass is
                  a one-time $19 USD purchase (no recurring subscription)
                  unlocking unlimited active invoices, WhatsApp nudge links, and
                  12 months of access to the upcoming V1.5 Document Chaser
                  feature once released. Payments are processed by Dodo Payments
                  as our Merchant of Record.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">
                  4. Availability &amp; Liability
                </h2>
                <p className="mt-1.5">
                  PingCue is provided &ldquo;as is.&rdquo; While we take
                  reasonable care to deliver scheduled emails reliably, we
                  cannot guarantee inbox placement or client payment, and our
                  total liability is limited to the amount you paid for PingCue
                  in the preceding 12 months.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">
                  5. Contact
                </h2>
                <p className="mt-1.5">
                  Questions about these terms? Email{" "}
                  <a
                    href="mailto:pingcue.support@gmail.com"
                    className="font-medium text-primary underline hover:text-primary-hover"
                  >
                    pingcue.support@gmail.com
                  </a>
                  .
                </p>
              </section>
            </div>
          </article>
        </Card>
      </div>
    </div>
  );
}
