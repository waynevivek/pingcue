export const CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export const DEFAULT_REMINDER_OFFSETS = [-3, 0, 3, 7, 14, 30] as const;

export type InvoiceStatus = "unpaid" | "partial" | "paid";

export type UserPlan = "free" | "founding_pass";

export interface Profile {
  id: string;
  email: string;
  plan: UserPlan;
  founding_pass_unlocked_at: string | null;
  display_name: string | null;
  default_currency: Currency;
  notify_on_send: boolean;
  dodo_payment_id?: string | null;
}

export interface Invoice {
  id: string;
  user_id: string;
  title: string;
  client_name: string;
  client_email: string;
  client_whatsapp: string | null;
  currency: Currency;
  amount_minor: number;
  amount_received_minor: number;
  due_date: string; // YYYY-MM-DD
  payment_link: string | null;
  reminder_offsets: number[];
  paused_until: string | null; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface CurrencyTotals {
  currency: Currency;
  owedMinor: number;
  overdueMinor: number;
  collectedMinor: number;
  activeCount: number;
  overdueCount: number;
}

/** Returns today's UTC date as YYYY-MM-DD to avoid timezone drift on DATE columns. */
export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Adds signed days to a YYYY-MM-DD date string using UTC calendar math. */
export function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** Formats a YYYY-MM-DD date string for display in UTC. */
export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getRemainingMinor(
  amountMinor: number,
  receivedMinor: number
): number {
  return Math.max(0, amountMinor - receivedMinor);
}

export function getInvoiceStatus(
  amountMinor: number,
  receivedMinor: number
): InvoiceStatus {
  if (receivedMinor >= amountMinor) return "paid";
  if (receivedMinor > 0) return "partial";
  return "unpaid";
}

export function isInvoiceActive(
  invoice: Pick<Invoice, "amount_minor" | "amount_received_minor">
): boolean {
  return invoice.amount_received_minor < invoice.amount_minor;
}

export function isInvoiceOverdue(
  invoice: Pick<Invoice, "due_date" | "amount_minor" | "amount_received_minor">,
  todayIso: string
): boolean {
  return isInvoiceActive(invoice) && invoice.due_date < todayIso;
}

export function isInvoicePaused(
  invoice: Pick<Invoice, "paused_until">,
  todayIso: string
): boolean {
  return Boolean(invoice.paused_until && invoice.paused_until >= todayIso);
}

export type InvoiceListFilter = "all" | "active" | "overdue" | "paid";

/** Filters invoices by status tab and optional case-insensitive search query. */
export function filterInvoices(
  invoices: readonly Invoice[],
  {
    status,
    query,
    todayIso,
  }: {
    status: InvoiceListFilter;
    query?: string;
    todayIso: string;
  }
): Invoice[] {
  const normalizedQuery = query?.trim().toLowerCase() ?? "";

  return invoices.filter((invoice) => {
    if (status === "active" && !isInvoiceActive(invoice)) return false;
    if (status === "overdue" && !isInvoiceOverdue(invoice, todayIso))
      return false;
    if (status === "paid" && isInvoiceActive(invoice)) return false;

    if (!normalizedQuery) return true;

    return (
      invoice.title.toLowerCase().includes(normalizedQuery) ||
      invoice.client_name.toLowerCase().includes(normalizedQuery) ||
      invoice.client_email.toLowerCase().includes(normalizedQuery) ||
      invoice.currency.toLowerCase().includes(normalizedQuery)
    );
  });
}

const CURRENCY_LOCALE: Record<Currency, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
};

export function formatMoney(minor: number, currency: Currency): string {
  const major = minor / 100;
  const hasFraction = minor % 100 !== 0;
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(major);
}

export function minorToMajorInput(minor: number): string {
  const major = minor / 100;
  return minor % 100 === 0 ? String(major) : major.toFixed(2);
}

export function parseMajorToMinor(raw: string): number | null {
  const cleaned = raw.trim().replace(/,/g, "");
  if (!cleaned) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 20_000_000) return null;
  return Math.round(parsed * 100);
}

export function parseReminderOffsets(raw: string): number[] | null {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0 || parts.length > 12) return null;

  const unique = new Set<number>();
  for (const part of parts) {
    if (!/^[+-]?\d+$/.test(part)) return null;
    const value = Number.parseInt(part, 10);
    if (value < -60 || value > 180) return null;
    unique.add(value);
  }

  return Array.from(unique).sort((a, b) => a - b);
}

export function formatOffsetsInput(offsets: number[]): string {
  return offsets.join(", ");
}

export function formatOffsetBadge(offset: number): string {
  if (offset > 0) return `+${offset}d`;
  return `${offset}d`;
}

export function getOffsetTone(
  offset: number
): "Friendly" | "Firm" | "Final notice" {
  if (offset <= 3) return "Friendly";
  if (offset < 30) return "Firm";
  return "Final notice";
}

export function normalizeWhatsappNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length < 7 || digits.length > 15) return null;
  return digits;
}

/** Aggregates owed, overdue, and collected amounts separately per currency (no FX). */
export function computeCurrencyTotals(
  invoices: Invoice[],
  todayIso: string
): CurrencyTotals[] {
  const map = new Map<Currency, CurrencyTotals>();

  for (const invoice of invoices) {
    let bucket = map.get(invoice.currency);
    if (!bucket) {
      bucket = {
        currency: invoice.currency,
        owedMinor: 0,
        overdueMinor: 0,
        collectedMinor: 0,
        activeCount: 0,
        overdueCount: 0,
      };
      map.set(invoice.currency, bucket);
    }

    const remaining = getRemainingMinor(
      invoice.amount_minor,
      invoice.amount_received_minor
    );
    const collected = Math.min(
      invoice.amount_minor,
      invoice.amount_received_minor
    );

    bucket.collectedMinor += collected;
    if (remaining > 0) {
      bucket.owedMinor += remaining;
      bucket.activeCount += 1;
      if (invoice.due_date < todayIso) {
        bucket.overdueMinor += remaining;
        bucket.overdueCount += 1;
      }
    }
  }

  return CURRENCIES.map((currency) => map.get(currency)).filter(
    (entry): entry is CurrencyTotals => Boolean(entry)
  );
}

export type InvoiceInputData = {
  title: string;
  client_name: string;
  client_email: string;
  client_whatsapp: string | null;
  currency: Currency;
  amount_minor: number;
  amount_received_minor: number;
  due_date: string;
  payment_link: string | null;
  reminder_offsets: number[];
  paused_until: string | null;
};

export type InvoiceFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Checks for CR/LF or other control chars that could break email headers. */
export function hasControlOrNewline(value: string): boolean {
  return /[\r\n\x00-\x1f\x7f]/.test(value);
}

/** Validates an optional display/studio name used to sign reminder emails. */
export function validateDisplayName(
  raw: string
): { ok: true; value: string | null } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  if (hasControlOrNewline(trimmed)) {
    return { ok: false, error: "Name cannot contain line breaks." };
  }
  if (trimmed.length > 80) {
    return { ok: false, error: "Keep your name under 80 characters." };
  }
  return { ok: true, value: trimmed };
}

/** Validates a calendar YYYY-MM-DD date string in UTC (rejects impossible dates like 2026-02-31). */
export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (y < 1970 || y > 2100) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

/** Validates FormData from the invoice create/edit form into typed DB fields. */
export function validateInvoiceFormData(
  formData: FormData
):
  | { ok: true; data: InvoiceInputData }
  | { ok: false; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};

  const title = String(formData.get("title") ?? "").trim();
  const clientName = String(formData.get("client_name") ?? "").trim();
  const clientEmail = String(formData.get("client_email") ?? "")
    .trim()
    .toLowerCase();
  const whatsappRaw = String(formData.get("client_whatsapp") ?? "").trim();
  const currencyRaw = String(formData.get("currency") ?? "INR")
    .trim()
    .toUpperCase();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const receivedRaw = String(formData.get("amount_received") ?? "0").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();
  const paymentLinkRaw = String(formData.get("payment_link") ?? "").trim();
  const offsetsRaw = String(
    formData.get("reminder_offsets") ?? DEFAULT_REMINDER_OFFSETS.join(", ")
  ).trim();
  const pausedUntilRaw = String(formData.get("paused_until") ?? "").trim();

  if (!title) fieldErrors.title = "Enter a short invoice title.";
  else if (hasControlOrNewline(title))
    fieldErrors.title = "Invoice title cannot contain line breaks.";
  else if (title.length > 140)
    fieldErrors.title = "Keep the title under 140 characters.";

  if (!clientName) fieldErrors.client_name = "Enter the client's name.";
  else if (hasControlOrNewline(clientName))
    fieldErrors.client_name = "Client name cannot contain line breaks.";
  else if (clientName.length > 120)
    fieldErrors.client_name = "Client name is too long.";

  if (!EMAIL_RE.test(clientEmail)) {
    fieldErrors.client_email = "Enter a valid client email address.";
  }

  let clientWhatsapp: string | null = null;
  if (whatsappRaw) {
    clientWhatsapp = normalizeWhatsappNumber(whatsappRaw);
    if (!clientWhatsapp) {
      fieldErrors.client_whatsapp =
        "Enter digits with country code (e.g. 919876543210, 7–15 digits).";
    }
  }

  const currency = CURRENCIES.includes(currencyRaw as Currency)
    ? (currencyRaw as Currency)
    : null;
  if (!currency) fieldErrors.currency = "Select INR, USD, EUR, or GBP.";

  const amountMinor = parseMajorToMinor(amountRaw);
  if (amountMinor === null || amountMinor <= 0) {
    fieldErrors.amount =
      "Enter an invoice amount greater than 0 (up to 2 decimals).";
  }

  const receivedMinor =
    receivedRaw === "" ? 0 : parseMajorToMinor(receivedRaw);
  if (receivedMinor === null) {
    fieldErrors.amount_received = "Enter a valid amount received (0 or more).";
  } else if (amountMinor && receivedMinor > amountMinor) {
    fieldErrors.amount_received =
      "Amount received cannot exceed the invoice amount.";
  }

  if (!isValidIsoDate(dueDate)) {
    fieldErrors.due_date = "Select a valid due date.";
  }

  let paymentLink: string | null = null;
  if (paymentLinkRaw) {
    if (paymentLinkRaw.length > 500) {
      fieldErrors.payment_link =
        "Payment link is too long (max 500 characters).";
    } else {
      try {
        const parsed = new URL(paymentLinkRaw);
        if (parsed.protocol !== "https:") {
          fieldErrors.payment_link = "Payment link must start with https://.";
        } else if (parsed.username || parsed.password) {
          fieldErrors.payment_link =
            "Payment link cannot contain embedded credentials.";
        } else {
          paymentLink = parsed.toString();
        }
      } catch {
        fieldErrors.payment_link =
          "Enter a valid URL (e.g. https://rzp.io/l/...).";
      }
    }
  }

  const reminderOffsets = parseReminderOffsets(offsetsRaw);
  if (!reminderOffsets) {
    fieldErrors.reminder_offsets =
      "Use comma-separated day offsets between -60 and 180 (e.g. -3, 0, 3, 7, 14, 30).";
  }

  let pausedUntil: string | null = null;
  if (pausedUntilRaw) {
    if (!isValidIsoDate(pausedUntilRaw)) {
      fieldErrors.paused_until = "Pick a valid pause date.";
    } else {
      pausedUntil = pausedUntilRaw;
    }
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    !currency ||
    !amountMinor ||
    receivedMinor === null ||
    !reminderOffsets
  ) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      title,
      client_name: clientName,
      client_email: clientEmail,
      client_whatsapp: clientWhatsapp,
      currency,
      amount_minor: amountMinor,
      amount_received_minor: receivedMinor,
      due_date: dueDate,
      payment_link: paymentLink,
      reminder_offsets: reminderOffsets,
      paused_until: pausedUntil,
    },
  };
}
