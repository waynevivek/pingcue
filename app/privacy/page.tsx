import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/app/components/BrandMark";
import { SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy — PingCue",
  description: "How PingCue handles your account and client invoice data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111]">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
          >
            <BrandMark size="sm" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F4F5] px-3.5 py-1.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#EAEAEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to PingCue</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-[28px] border border-black/[0.08] bg-white p-6 shadow-[0_12px_36px_-20px_rgba(15,23,42,0.1)] sm:p-10">
          <article>
            <span className="inline-flex items-center rounded-full bg-[#F4F4F5] px-3 py-1 text-xs font-medium text-[#52525B]">
              Last updated: November 2026
            </span>
            <h1 className="mt-4 font-sans text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-[#111111] sm:text-[36px]">
              Privacy Policy
            </h1>

            <div className="mt-7 space-y-6 border-t border-black/[0.06] pt-7 text-[14.5px] leading-[1.7] text-[#3F3F46]">
              <section>
                <h2 className="text-[16px] font-semibold tracking-[-0.015em] text-[#111111]">
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
                <h2 className="text-[16px] font-semibold tracking-[-0.015em] text-[#111111]">
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
                <h2 className="text-[16px] font-semibold tracking-[-0.015em] text-[#111111]">
                  3. Data Deletion
                </h2>
                <p className="mt-1.5">
                  You may delete individual invoices inside your dashboard or
                  request full account deletion at any time by emailing{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="font-semibold text-[#111111] underline hover:text-[#52525B]"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
              </section>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
