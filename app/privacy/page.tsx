import type { Metadata } from "next";
import Link from "next/link";

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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
        >
          ← Back to PingCue
        </Link>

        <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-10">
          <h1 className="font-display text-3xl text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-xs text-slate-500">Last updated: November 2026</p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">1. Data We Collect</h2>
              <p className="mt-1.5">
                We collect only what is required to run PingCue: your account email,
                client details you enter (name, email, optional WhatsApp number), invoice
                amounts, due dates, payment links, and reminder delivery logs. If you
                leave your email for the Founding Pass early-access list, we use it solely
                to notify you when live checkout opens.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">2. How We Use & Share Data</h2>
              <p className="mt-1.5">
                We never sell your data or your clients&apos; contact details. We use
                trusted infrastructure providers strictly to operate the service: Vercel
                (hosting), Supabase (database & authentication), Resend (email delivery),
                and Dodo Payments (checkout & tax compliance).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">3. Data Deletion</h2>
              <p className="mt-1.5">
                You may delete individual invoices inside your dashboard or request full
                account deletion at any time by emailing{" "}
                <a
                  href="mailto:support@pingcue.app"
                  className="font-medium text-blue-700 underline"
                >
                  support@pingcue.app
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
