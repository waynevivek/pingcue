import { MailX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  const statusBadge = {
    unpaid: {
      label: "Unpaid",
      variant: "neutral" as const,
    },
    partial: {
      label: "Partial",
      variant: "firm" as const,
    },
    paid: {
      label: "Paid",
      variant: "paid" as const,
    },
  }[status];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>

      {overdue && <Badge variant="overdue">Overdue</Badge>}

      {active && emailSuppressed && (
        <Badge variant="overdue" className="gap-1">
          <MailX className="h-3 w-3" aria-hidden="true" />
          <span>Email paused</span>
        </Badge>
      )}

      {paused && invoice.paused_until && (
        <Badge variant="primary">
          Paused until {formatShortDate(invoice.paused_until)}
        </Badge>
      )}
    </div>
  );
}
