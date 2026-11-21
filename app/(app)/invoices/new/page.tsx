import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/invoices"
          className="text-sm font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
        >
          ← Back to invoices
        </Link>
        <h1 className="mt-3 font-display text-3xl text-slate-900">
          New invoice
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Add the client, payment link, and due date. PingCue schedules
          escalating email reminders automatically.
        </p>
      </div>

      {atFreeLimit && (
        <div
          role="note"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <p className="font-semibold">Free plan limit reached (1/1 active invoice)</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900">
            Mark your current active invoice as paid to free this slot, or
            unlock the <strong>$19 one-time Founding Pass</strong> in Step 5
            for unlimited active invoices.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-8">
        <InvoiceForm
          mode="create"
          defaultDueDate={addDaysIso(todayIso, 7)}
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
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      }
    >
      <NewInvoiceContent />
    </Suspense>
  );
}
