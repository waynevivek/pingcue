import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import { countActiveInvoices, getUserProfile, requireUser } from "@/lib/db";
import { addDaysIso, getTodayIsoDate } from "@/lib/invoices";
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
    <div className="mx-auto max-w-xl space-y-4 md:space-y-5">
      <div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#63636A] transition-colors hover:text-[#131316]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Invoices</span>
        </Link>
        <h1 className="mt-1.5 font-sans text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#131316] sm:text-[24px]">
          New invoice
        </h1>
        <p className="mt-1 text-xs text-[#63636A]">
          Add client details, due date, and payment link. PingCue schedules
          escalating reminders automatically.
        </p>
      </div>

      {atFreeLimit && (
        <div
          role="note"
          className="flex flex-col gap-3 rounded-[16px] border border-black/[0.08] bg-[#FFFDF7] p-4 text-xs sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-[#131316]">
              Free plan limit reached (1/1 active invoice)
            </p>
            <p className="mt-0.5 leading-relaxed text-[#63636A]">
              Mark your active invoice paid to free this slot, or unlock the
              one-time $19 Founding Pass for unlimited invoices.
            </p>
          </div>
          <UpgradeCheckoutButton
            variant="compact"
            label="Unlock unlimited — $19"
            className="shrink-0 rounded-[9px]"
          />
        </div>
      )}

      <div className="rounded-[18px] border border-black/[0.07] bg-white p-5 shadow-[0_1px_2px_rgba(19,19,22,0.03),0_10px_28px_-18px_rgba(19,19,22,0.1)] sm:p-6">
        <InvoiceForm
          mode="create"
          todayIso={todayIso}
          defaultDueDate={addDaysIso(todayIso, 7)}
          defaultCurrency={profile.default_currency}
          disabled={atFreeLimit}
        />
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl space-y-4">
          <div className="h-10 w-44 animate-pulse rounded-lg bg-black/[0.06]" />
          <div className="h-96 animate-pulse rounded-[18px] bg-white" />
        </div>
      }
    >
      <NewInvoiceContent />
    </Suspense>
  );
}
