import {
  formatShortDate,
  getInvoiceStatus,
  isInvoiceOverdue,
  isInvoicePaused,
  type Invoice,
} from "@/lib/invoices";

export function InvoiceStatusBadges({
  invoice,
  todayIso,
}: {
  invoice: Pick<
    Invoice,
    "amount_minor" | "amount_received_minor" | "due_date" | "paused_until"
  >;
  todayIso: string;
}) {
  const status = getInvoiceStatus(
    invoice.amount_minor,
    invoice.amount_received_minor
  );
  const overdue = isInvoiceOverdue(invoice, todayIso);
  const paused = isInvoicePaused(invoice, todayIso);

  const statusBadge = {
    unpaid: {
      label: "Unpaid",
      classes: "border-slate-200 bg-slate-100 text-slate-700",
    },
    partial: {
      label: "Partial",
      classes: "border-amber-200 bg-amber-50 text-amber-800",
    },
    paid: {
      label: "Paid",
      classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
  }[status];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium ${statusBadge.classes}`}
      >
        {statusBadge.label}
      </span>

      {overdue && (
        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 font-mono text-xs font-medium text-red-700">
          Overdue
        </span>
      )}

      {paused && invoice.paused_until && (
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-medium text-blue-800">
          Paused until {formatShortDate(invoice.paused_until)}
        </span>
      )}
    </div>
  );
}
