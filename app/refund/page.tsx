import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — PingCue",
  description: "Refund and cancellation policy for the PingCue Founding Pass.",
};

export default function RefundPage() {
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
              Refund &amp; Cancellation Policy
            </h1>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Last updated: November 2026
            </p>

            <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground/90">
              <section>
                <h2 className="text-base font-semibold text-foreground">
                  1. One-Time Purchase (No Subscription)
                </h2>
                <p className="mt-1.5">
                  The PingCue Founding Pass ($19 USD) is a one-time
                  payment—there is no recurring billing to cancel.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">
                  2. 7-Day Refund Guarantee
                </h2>
                <p className="mt-1.5">
                  If PingCue isn&apos;t a fit for your freelance workflow, email{" "}
                  <a
                    href="mailto:pingcue.support@gmail.com"
                    className="font-medium text-primary underline hover:text-primary-hover"
                  >
                    pingcue.support@gmail.com
                  </a>{" "}
                  within 7 calendar days of purchase with your order email or
                  Dodo Payments receipt ID. We will issue a full refund back to
                  your original payment method, processed within 5–10 business
                  days via Dodo Payments.
                </p>
              </section>
            </div>
          </article>
        </Card>
      </div>
    </div>
  );
}
