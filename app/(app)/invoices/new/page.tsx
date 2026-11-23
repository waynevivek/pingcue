import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import { Card } from "@/components/ui/card";
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
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to invoices</span>
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
          New invoice
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the client, payment link, and due date. PingCue schedules
          escalating email reminders automatically.
        </p>
      </div>

      {atFreeLimit && (
        <div
          role="note"
          className="flex flex-col gap-3 rounded-xl border border-accent-border bg-accent-surface p-4 text-sm text-accent-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold">
              Free plan limit reached (1/1 active invoice)
            </p>
            <p className="mt-1 text-xs leading-relaxed text-accent-foreground/90">
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

      <Card className="p-6 sm:p-8">
        <InvoiceForm
          mode="create"
          defaultDueDate={addDaysIso(todayIso, 7)}
          disabled={atFreeLimit}
        />
      </Card>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
        </div>
      }
    >
      <NewInvoiceContent />
    </Suspense>
  );
}
