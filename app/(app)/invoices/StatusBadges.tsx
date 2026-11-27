import { MailX } from "lucide-react";
import {
  formatShortDate,
  getInvoiceStatus,
  isInvoiceActive,
  isInvoiceOverdue,
  isInvoicePaused,
  type Invoice,
} from "@/lib/invoices";

export function InvoiceStatusBadges({
  invoice,
  todayIso,
  emailSuppressed = false,
}: {
  invoice: Pick<
    Invoice,
    "amount_minor" | "amount_received_minor" | "due_date" | "paused_until"
  >;
  todayIso: string;
  emailSuppressed?: boolean;
}) {
  const status = getInvoiceStatus(
    invoice.amount_minor,
    invoice.amount_received_minor
  );
  const active = isInvoiceActive(invoice);
  const overdue = isInvoiceOverdue(invoice, todayIso);
  const paused = isInvoicePaused(invoice, todayIso);

  const primaryStatus = overdue
    ? {
        label: "Overdue",
        dot: "bg-[#E11D48]",
        pill: "border-[#FECDD3] bg-[#FFF5F6] text-[#9F1239]",
      }
    : status === "paid"
      ? {
          label: "Paid",
          dot: "bg-[#16A34A]",
          pill: "border-[#BBF7D0] bg-[#F2FDF5] text-[#14532D]",
        }
      : status === "partial"
        ? {
            label: "Partial",
            dot: "bg-[#D97706]",
            pill: "border-[#FDE68A] bg-[#FEFDF0] text-[#713F12]",
          }
        : {
            label: "Unpaid",
            dot: "bg-[#63636A]",
            pill: "border-black/[0.09] bg-[#F8F9F6] text-[#52525B]",
          };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-[7px] border px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap ${primaryStatus.pill}`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${primaryStatus.dot}`}
        />
        <span>{primaryStatus.label}</span>
      </span>

      {overdue && status === "partial" && (
        <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#FDE68A] bg-[#FEFDF0] px-2 py-0.5 text-[11.5px] font-medium text-[#713F12] whitespace-nowrap">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D97706]"
          />
          <span>Partial</span>
        </span>
      )}

      {active && emailSuppressed && (
        <span className="inline-flex items-center gap-1 rounded-[7px] border border-[#FECDD3] bg-[#FFF5F6] px-2 py-0.5 text-[11.5px] font-medium text-[#9F1239] whitespace-nowrap">
          <MailX className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>Email paused</span>
        </span>
      )}

      {active && paused && invoice.paused_until && (
        <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#BFDBFE] bg-[#F2F7FF] px-2 py-0.5 text-[11.5px] font-medium text-[#1E3A8A] whitespace-nowrap tabular-nums">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]"
          />
          <span>Paused until {formatShortDate(invoice.paused_until)}</span>
        </span>
      )}
    </div>
  );
}
