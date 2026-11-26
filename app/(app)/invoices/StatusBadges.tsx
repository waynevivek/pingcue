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
        pill: "bg-[#FFF1F2] text-[#BE123C]",
      }
    : status === "paid"
      ? {
          label: "Paid",
          dot: "bg-[#16A34A]",
          pill: "bg-[#F0FDF4] text-[#15803D]",
        }
      : status === "partial"
        ? {
            label: "Partial",
            dot: "bg-[#D97706]",
            pill: "bg-[#FEFCE8] text-[#854D0E]",
          }
        : {
            label: "Unpaid",
            dot: "bg-[#A1A1AA]",
            pill: "bg-[#F4F4F2] text-[#52525B]",
          };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${primaryStatus.pill}`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${primaryStatus.dot}`}
        />
        <span>{primaryStatus.label}</span>
      </span>

      {overdue && status === "partial" && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEFCE8] px-2 py-0.5 text-[11px] font-medium text-[#854D0E] whitespace-nowrap">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D97706]"
          />
          <span>Partial</span>
        </span>
      )}

      {active && emailSuppressed && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1F2] px-2 py-0.5 text-[11px] font-medium text-[#BE123C] whitespace-nowrap">
          <MailX className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>Email paused</span>
        </span>
      )}

      {paused && invoice.paused_until && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#1D4ED8] whitespace-nowrap tabular-nums">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B82F6]"
          />
          <span>Paused until {formatShortDate(invoice.paused_until)}</span>
        </span>
      )}
    </div>
  );
}
