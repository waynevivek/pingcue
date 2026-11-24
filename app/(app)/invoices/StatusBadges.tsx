import { Badge } from "@/components/ui/badge";
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

      {paused && invoice.paused_until && (
        <Badge variant="primary">
          Paused until {formatShortDate(invoice.paused_until)}
        </Badge>
      )}
    </div>
  );
}
