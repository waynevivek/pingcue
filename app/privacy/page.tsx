import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy — PingCue",
  description: "How PingCue handles your account and client invoice data.",
};

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Last updated: November 2026
            </p>

            <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground/90">
              <section>
                <h2 className="text-base font-semibold text-foreground">
                  1. Data We Collect
                </h2>
                <p className="mt-1.5">
                  We collect only what is required to run PingCue: your account
                  email, client details you enter (name, email, optional
                  WhatsApp number), invoice amounts, due dates, payment links,
                  and reminder delivery logs. If you leave your email for the
                  Founding Pass early-access list, we use it solely to notify
                  you when live checkout opens.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">
                  2. How We Use &amp; Share Data
                </h2>
                <p className="mt-1.5">
                  We never sell your data or your clients&apos; contact details.
                  We use trusted infrastructure providers strictly to operate
                  the service: Vercel (hosting), Supabase (database &amp;
                  authentication), Resend (email delivery), and Dodo Payments
                  (checkout &amp; tax compliance).
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground">
                  3. Data Deletion
                </h2>
                <p className="mt-1.5">
                  You may delete individual invoices inside your dashboard or
                  request full account deletion at any time by emailing{" "}
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
