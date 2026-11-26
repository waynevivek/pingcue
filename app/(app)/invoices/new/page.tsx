import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import { countActiveInvoices, getUserProfile, requireUser } from "@/lib/db";
import { addDaysIso, getTodayIsoDate } from "@/lib/invoices";
import { DaylightStage } from "../../DaylightStage";
import { InvoiceForm } from "../InvoiceForm";

export const metadata: Metadata = {
  title: "New invoice — PingCue",
};

async function NewInvoiceContent() {
  const { user } = await requireUser();
  const todayIso = getTodayIsoDate();

  const [profile, activeCount] = await Promise.all([
    getUserProfile(user.id, user.email ?? ""),
    countActiveInvoices(user.id),
  ]);

  const atFreeLimit = profile.plan === "free" && activeCount >= 1;

  return (
    <div className="mx-auto max-w-2xl space-y-5 md:space-y-6">
      <div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#111111] shadow-[0_2px_0_rgba(17,17,17,0.06)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FAFAFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to invoices</span>
        </Link>
        <h1 className="mt-4 font-sans text-[28px] font-semibold leading-tight tracking-[-0.035em] text-[#111111] sm:text-[34px]">
          New invoice
        </h1>
        <p className="mt-1 text-sm text-[#52525B]">
          Add the client, payment link, and due date. PingCue schedules
          escalating email reminders automatically.
        </p>
      </div>

      {atFreeLimit && (
        <div
          role="note"
          className="flex flex-col gap-3 rounded-[24px] border-2 border-[#111111] bg-[#FFF1A8] p-4 text-sm text-[#4B4116] sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div>
            <p className="font-semibold text-[#111111]">
              Free plan limit reached (1/1 active invoice)
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#4B4116]">
              Mark your current active invoice as paid to free this slot, or
              unlock the <strong>$19 one-time Founding Pass</strong> for
              unlimited active invoices.
            </p>
          </div>
          <UpgradeCheckoutButton
            variant="compact"
            label="Unlock unlimited — $19"
            className="shrink-0"
          />
        </div>
      )}

      <DaylightStage mascot sleeping={atFreeLimit}>
        <div className="rounded-[22px] border border-black/[0.08] bg-white p-5 pt-6 shadow-[0_20px_50px_-16px_rgba(15,23,42,0.2)] sm:p-7">
          <InvoiceForm
            mode="create"
            todayIso={todayIso}
            defaultDueDate={addDaysIso(todayIso, 7)}
            defaultCurrency={profile.default_currency}
            disabled={atFreeLimit}
          />
        </div>
      </DaylightStage>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-9 w-48 animate-pulse rounded-xl bg-[#F4F4F5]" />
          <div className="h-96 animate-pulse rounded-[28px] bg-[#E0F2FE]" />
        </div>
      }
    >
      <NewInvoiceContent />
    </Suspense>
  );
}
