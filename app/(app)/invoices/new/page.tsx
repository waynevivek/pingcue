import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
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
  await connection();
  const { user } = await requireUser();
  const todayIso = getTodayIsoDate();

  const [profile, activeCount] = await Promise.all([
    getUserProfile(user.id, user.email ?? ""),
    countActiveInvoices(user.id),
  ]);

  const atFreeLimit = profile.plan === "free" && activeCount >= 1;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/invoices"
          className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-[#52525B] transition-colors hover:text-[#111111] md:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Invoices</span>
        </Link>
        <h1 className="font-sans text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[24px]">
          New invoice
        </h1>
        <p className="mt-1 text-xs text-[#52525B]">
          Add client details, due date, and payment link. PingCue schedules
          escalating reminders automatically.
        </p>
      </div>

      {atFreeLimit && (
        <div
          role="note"
          className="flex flex-col gap-3 rounded-[12px] border border-[#FDE68A] bg-[#FEFDF0] px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div>
            <p className="font-semibold text-[#713F12]">
              Free plan limit reached (1/1 active invoice)
            </p>
            <p className="mt-0.5 leading-relaxed text-[#713F12]">
              Mark your active invoice paid to free this slot, or unlock the
              one-time $19 Founding Pass for unlimited invoices.
            </p>
          </div>
          <UpgradeCheckoutButton
            variant="compact"
            label="Unlock unlimited — $19"
            className="shrink-0 rounded-[8px]"
          />
        </div>
      )}

      <div className="rounded-[18px] border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(17,17,17,0.03),0_10px_28px_-20px_rgba(17,17,17,0.12)] sm:p-6">
        <InvoiceForm
          key={profile.default_currency}
          mode="create"
          todayIso={todayIso}
          defaultDueDate={addDaysIso(todayIso, 7)}
          defaultCurrency={profile.default_currency}
          disabled={atFreeLimit}
          twoColumn={true}
        />
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-5">
          <div className="h-12 w-48 animate-pulse rounded-lg bg-[#F5F6F3]" />
          <div className="h-96 animate-pulse rounded-[14px] border border-black/[0.06] bg-[#F8F9F6]" />
        </div>
      }
    >
      <NewInvoiceContent />
    </Suspense>
  );
}
