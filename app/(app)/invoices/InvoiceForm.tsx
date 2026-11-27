"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CURRENCY_SYMBOLS,
  DEFAULT_REMINDER_OFFSETS,
  addDaysIso,
  formatOffsetsInput,
  minorToMajorInput,
  normalizeWhatsappNumber,
  parseMajorToMinor,
  parseReminderOffsets,
  type Currency,
  type Invoice,
  type InvoiceFormState,
} from "@/lib/invoices";
import { CurrencyPicker } from "../CurrencyPicker";
import { createInvoiceAction, updateInvoiceAction } from "./actions";

type InvoiceFormProps =
  | {
      mode: "create";
      defaultDueDate: string;
      todayIso: string;
      defaultCurrency?: Currency;
      disabled?: boolean;
      twoColumn?: boolean;
    }
  | {
      mode: "edit";
      invoice: Invoice;
      disabled?: boolean;
      twoColumn?: boolean;
    };

const FIELD_IDS: Record<string, string> = {
  title: "invoice-title",
  client_name: "invoice-client-name",
  client_email: "invoice-client-email",
  client_whatsapp: "invoice-client-whatsapp",
  currency: "invoice-currency",
  amount: "invoice-amount",
  amount_received: "invoice-amount-received",
  due_date: "invoice-due-date",
  payment_link: "invoice-payment-link",
  reminder_offsets: "invoice-reminder-offsets",
  paused_until: "invoice-paused-until",
};

const INITIAL_STATE: InvoiceFormState = {};

const DUE_PRESETS = [
  { label: "Today", days: 0 },
  { label: "+7 days", days: 7 },
  { label: "+15 days", days: 15 },
  { label: "+30 days", days: 30 },
] as const;

export function InvoiceForm(props: InvoiceFormProps) {
  const isEdit = props.mode === "edit";
  const twoColumn = props.twoColumn ?? false;
  const invoice = isEdit ? props.invoice : null;

  const boundAction = isEdit
    ? updateInvoiceAction.bind(null, invoice!.id)
    : createInvoiceAction;

  const [state, formAction, pending] = useActionState(
    boundAction,
    INITIAL_STATE
  );
  const [blurErrors, setBlurErrors] = useState<Record<string, string>>({});
  const initialCurrency: Currency =
    invoice?.currency ??
    (props.mode === "create" ? (props.defaultCurrency ?? "USD") : "USD");
  const [selectedCurrency, setSelectedCurrency] =
    useState<Currency>(initialCurrency);
  const [dueDate, setDueDate] = useState(
    props.mode === "edit" ? props.invoice.due_date : props.defaultDueDate
  );
  const [fields, setFields] = useState({
    title: invoice?.title ?? "",
    client_name: invoice?.client_name ?? "",
    client_email: invoice?.client_email ?? "",
    client_whatsapp: invoice?.client_whatsapp ?? "",
    amount: invoice ? minorToMajorInput(invoice.amount_minor) : "",
    payment_link: invoice?.payment_link ?? "",
    reminder_offsets: invoice
      ? formatOffsetsInput(invoice.reminder_offsets)
      : formatOffsetsInput([...DEFAULT_REMINDER_OFFSETS]),
    amount_received: invoice
      ? minorToMajorInput(invoice.amount_received_minor)
      : "0",
    paused_until: invoice?.paused_until ?? "",
  });
  const summaryRef = useRef<HTMLDivElement>(null);

  function updateField(name: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
    clearBlurError(name);
  }

  useEffect(() => {
    if (
      state.error ||
      (state.fieldErrors && Object.keys(state.fieldErrors).length > 0)
    ) {
      summaryRef.current?.focus();
    }
  }, [state]);

  const mergedErrors = {
    ...(state.fieldErrors ?? {}),
    ...blurErrors,
  };

  function validateFieldOnBlur(name: string, value: string) {
    const trimmed = value.trim();
    let message = "";

    if (
      name === "client_email" &&
      trimmed &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    ) {
      message = "Enter a valid client email address.";
    } else if (name === "amount" && trimmed) {
      const minor = parseMajorToMinor(trimmed);
      if (minor === null || minor <= 0) {
        message = "Enter an invoice amount greater than 0 (up to 2 decimals).";
      }
    } else if (name === "amount_received" && trimmed) {
      if (parseMajorToMinor(trimmed) === null) {
        message = "Enter a valid amount received (0 or more).";
      }
    } else if (name === "client_whatsapp" && trimmed) {
      if (!normalizeWhatsappNumber(trimmed)) {
        message =
          "Enter digits with country code (e.g. 14155550199, 7–15 digits).";
      }
    } else if (name === "payment_link" && trimmed) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== "https:") {
          message = "Payment link must start with https://.";
        }
      } catch {
        message = "Enter a valid URL (e.g. https://buy.stripe.com/...).";
      }
    } else if (name === "reminder_offsets" && trimmed) {
      if (!parseReminderOffsets(trimmed)) {
        message =
          "Use comma-separated day offsets between -60 and 180 (e.g. -3, 0, 3, 7, 14, 30).";
      }
    }

    setBlurErrors((prev) => {
      if (!message && !prev[name]) return prev;
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }

  function clearBlurError(name: string) {
    setBlurErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  const errorEntries = Object.entries(mergedErrors);
  function describedBy(field: string, hasHint = false): string | undefined {
    const ids: string[] = [];
    if (mergedErrors[field]) ids.push(`${FIELD_IDS[field]}-error`);
    if (hasHint) ids.push(`${FIELD_IDS[field]}-hint`);
    return ids.length > 0 ? ids.join(" ") : undefined;
  }

  const currencySymbol = CURRENCY_SYMBOLS[selectedCurrency] ?? "$";
  const amountPlaceholder =
    selectedCurrency === "INR"
      ? "25000"
      : selectedCurrency === "EUR"
        ? "2200"
        : selectedCurrency === "GBP"
          ? "1800"
          : "2400";

  const sectionGrid = twoColumn
    ? "grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8"
    : "space-y-4";

  return (
    <form action={formAction} className="divide-y divide-black/[0.06]" noValidate>
      {(state.error || errorEntries.length > 0 || state.success) && (
        <div className="space-y-3 pb-5">
          {(state.error || errorEntries.length > 0) && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              aria-labelledby="invoice-form-error-title"
              className="rounded-[12px] border border-[#FECDD3] bg-[#FFF5F6] p-4 text-xs text-[#9F1239] focus:outline-none focus:ring-2 focus:ring-[#E11D48] sm:text-sm"
            >
              <h3 id="invoice-form-error-title" className="font-semibold">
                {state.error ?? "Please check the fields below:"}
              </h3>
              {errorEntries.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                  {errorEntries.map(([field, msg]) => (
                    <li key={field}>
                      <a
                        href={`#${FIELD_IDS[field] ?? ""}`}
                        className="underline hover:text-[#111111]"
                      >
                        {msg}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {state.success && (
            <div
              role="status"
              className="rounded-[12px] border border-[#BBF7D0] bg-[#F2FDF5] px-4 py-3 text-xs font-medium text-[#14532D] sm:text-sm"
            >
              {state.success}
            </div>
          )}
        </div>
      )}

      {/* Group 1: Invoice & Client */}
      <div className={`py-5 first:pt-0 ${sectionGrid}`}>
        <div className="space-y-1">
          <h2 className="text-[13px] font-semibold text-[#111111]">
            Client &amp; invoice
          </h2>
          <p className="text-pretty text-xs leading-relaxed text-[#63636A]">
            Who receives automated follow-ups and what appears in the subject.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor={FIELD_IDS.title} className="text-xs text-[#111111]">
              Invoice title <span className="text-[#BE123C]">*</span>
            </Label>
            <Input
              id={FIELD_IDS.title}
              name="title"
              type="text"
              required
              disabled={props.disabled}
              value={fields.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Website Redesign — Milestone 2"
              aria-invalid={Boolean(mergedErrors.title)}
              aria-describedby={describedBy("title")}
              className="mt-1.5 h-10 scroll-mt-24 rounded-[9px] border-black/10 bg-[#F8F9F6]"
            />
            {mergedErrors.title && (
              <p
                id={`${FIELD_IDS.title}-error`}
                className="mt-1 text-xs font-medium text-[#BE123C]"
              >
                {mergedErrors.title}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor={FIELD_IDS.client_name}
              className="text-xs text-[#111111]"
            >
              Client name <span className="text-[#BE123C]">*</span>
            </Label>
            <Input
              id={FIELD_IDS.client_name}
              name="client_name"
              type="text"
              required
              disabled={props.disabled}
              value={fields.client_name}
              onChange={(e) => updateField("client_name", e.target.value)}
              placeholder="Maya Lin"
              aria-invalid={Boolean(mergedErrors.client_name)}
              aria-describedby={describedBy("client_name")}
              className="mt-1.5 h-10 scroll-mt-24 rounded-[9px] border-black/10 bg-[#F8F9F6]"
            />
            {mergedErrors.client_name && (
              <p
                id={`${FIELD_IDS.client_name}-error`}
                className="mt-1 text-xs font-medium text-[#BE123C]"
              >
                {mergedErrors.client_name}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor={FIELD_IDS.client_email}
              className="text-xs text-[#111111]"
            >
              Client email <span className="text-[#BE123C]">*</span>
            </Label>
            <Input
              id={FIELD_IDS.client_email}
              name="client_email"
              type="email"
              required
              disabled={props.disabled}
              value={fields.client_email}
              onChange={(e) => updateField("client_email", e.target.value)}
              onBlur={(e) =>
                validateFieldOnBlur("client_email", e.target.value)
              }
              placeholder="maya@northstar.co"
              aria-invalid={Boolean(mergedErrors.client_email)}
              aria-describedby={describedBy("client_email")}
              className="mt-1.5 h-10 scroll-mt-24 rounded-[9px] border-black/10 bg-[#F8F9F6]"
            />
            {mergedErrors.client_email && (
              <p
                id={`${FIELD_IDS.client_email}-error`}
                className="mt-1 text-xs font-medium text-[#BE123C]"
              >
                {mergedErrors.client_email}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label
              htmlFor={FIELD_IDS.client_whatsapp}
              className="text-xs text-[#111111]"
            >
              Client WhatsApp (optional)
            </Label>
            <Input
              id={FIELD_IDS.client_whatsapp}
              name="client_whatsapp"
              type="tel"
              disabled={props.disabled}
              value={fields.client_whatsapp}
              onChange={(e) => updateField("client_whatsapp", e.target.value)}
              onBlur={(e) =>
                validateFieldOnBlur("client_whatsapp", e.target.value)
              }
              placeholder="14155550199"
              aria-invalid={Boolean(mergedErrors.client_whatsapp)}
              aria-describedby={describedBy("client_whatsapp", true)}
              className="mt-1.5 h-10 scroll-mt-24 rounded-[9px] border-black/10 bg-[#F8F9F6] font-mono"
            />
            <p
              id={`${FIELD_IDS.client_whatsapp}-hint`}
              className="mt-1 text-[11.5px] text-[#63636A]"
            >
              Include country code without + (e.g.{" "}
              <span className="font-mono text-[#52525B]">14155550199</span>) for
              1-tap WhatsApp nudges.
            </p>
            {mergedErrors.client_whatsapp && (
              <p
                id={`${FIELD_IDS.client_whatsapp}-error`}
                className="mt-1 text-xs font-medium text-[#BE123C]"
              >
                {mergedErrors.client_whatsapp}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Group 2: Amount & Due Date */}
      <div className={`py-5 ${sectionGrid}`}>
        <div className="space-y-1">
          <h2 className="text-[13px] font-semibold text-[#111111]">
            Amount &amp; due date
          </h2>
          <p className="text-xs leading-relaxed text-[#63636A]">
            Reminders automatically chase only the remaining unpaid balance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p
              id={`${FIELD_IDS.currency}-label`}
              className="text-xs font-medium text-[#111111]"
            >
              Currency <span className="text-[#BE123C]">*</span>
            </p>
            <div className="mt-1.5">
              <CurrencyPicker
                key={initialCurrency}
                id={FIELD_IDS.currency}
                name="currency"
                ariaLabelledBy={`${FIELD_IDS.currency}-label`}
                ariaDescribedBy={describedBy("currency")}
                defaultValue={initialCurrency}
                disabled={props.disabled}
                onChange={setSelectedCurrency}
              />
            </div>
            {mergedErrors.currency && (
              <p
                id={`${FIELD_IDS.currency}-error`}
                className="mt-1 text-xs font-medium text-[#BE123C]"
              >
                {mergedErrors.currency}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor={FIELD_IDS.amount}
              className="text-xs text-[#111111]"
            >
              Invoice amount ({selectedCurrency}){" "}
              <span className="text-[#BE123C]">*</span>
            </Label>
            <div className="relative mt-1.5">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-[#52525B]"
              >
                {currencySymbol}
              </span>
              <Input
                id={FIELD_IDS.amount}
                name="amount"
                type="text"
                inputMode="decimal"
                required
                disabled={props.disabled}
                value={fields.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                onBlur={(e) => validateFieldOnBlur("amount", e.target.value)}
                placeholder={amountPlaceholder}
                aria-invalid={Boolean(mergedErrors.amount)}
                aria-describedby={describedBy("amount")}
                className="h-10 scroll-mt-24 rounded-[9px] border-black/10 bg-[#F8F9F6] pl-7 font-mono"
              />
            </div>
            {mergedErrors.amount && (
              <p
                id={`${FIELD_IDS.amount}-error`}
                className="mt-1 text-xs font-medium text-[#BE123C]"
              >
                {mergedErrors.amount}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor={FIELD_IDS.due_date}
              className="text-xs text-[#111111]"
            >
              Due date <span className="text-[#BE123C]">*</span>
            </Label>
            <Input
              id={FIELD_IDS.due_date}
              name="due_date"
              type="date"
              required
              disabled={props.disabled}
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                clearBlurError("due_date");
              }}
              aria-invalid={Boolean(mergedErrors.due_date)}
              aria-describedby={describedBy("due_date")}
              className="mt-1.5 h-10 scroll-mt-24 rounded-[9px] border-black/10 bg-[#F8F9F6] font-mono"
            />
            {props.mode === "create" && !props.disabled && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DUE_PRESETS.map((preset) => {
                  const targetIso = addDaysIso(props.todayIso, preset.days);
                  const activePreset = dueDate === targetIso;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      aria-pressed={activePreset}
                      onClick={() => {
                        setDueDate(targetIso);
                        clearBlurError("due_date");
                      }}
                      className={`inline-flex min-h-[36px] items-center whitespace-nowrap rounded-[7px] border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:min-h-0 ${
                        activePreset
                          ? "border-[#111111]/20 bg-[#C3F584] font-semibold text-[#111111]"
                          : "border-black/[0.08] bg-[#F8F9F6] text-[#52525B] hover:border-black/20 hover:text-[#111111]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            )}
            {mergedErrors.due_date && (
              <p
                id={`${FIELD_IDS.due_date}-error`}
                className="mt-1 text-xs font-medium text-[#BE123C]"
              >
                {mergedErrors.due_date}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Group 3: Payment Link & Cadence */}
      <div className={`py-5 ${sectionGrid}`}>
        <div className="space-y-1">
          <h2 className="text-[13px] font-semibold text-[#111111]">
            Payment link &amp; cadence
          </h2>
          <p className="text-xs leading-relaxed text-[#63636A]">
            Paste any Stripe, Wise, PayPal, or hosted checkout link and adjust
            follow-up timing.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label
              htmlFor={FIELD_IDS.payment_link}
              className="text-xs text-[#111111]"
            >
              Payment link (optional)
            </Label>
            <Input
              id={FIELD_IDS.payment_link}
              name="payment_link"
              type="url"
              disabled={props.disabled}
              value={fields.payment_link}
              onChange={(e) => updateField("payment_link", e.target.value)}
              onBlur={(e) =>
                validateFieldOnBlur("payment_link", e.target.value)
              }
              placeholder="https://buy.stripe.com/your-payment-link"
              aria-invalid={Boolean(mergedErrors.payment_link)}
              aria-describedby={describedBy("payment_link")}
              className="mt-1.5 h-10 scroll-mt-24 rounded-[9px] border-black/10 bg-[#F8F9F6]"
            />
            {mergedErrors.payment_link && (
              <p
                id={`${FIELD_IDS.payment_link}-error`}
                className="mt-1 text-xs font-medium text-[#BE123C]"
              >
                {mergedErrors.payment_link}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label
              htmlFor={FIELD_IDS.reminder_offsets}
              className="text-xs text-[#111111]"
            >
              Reminder schedule (days relative to due date)
            </Label>
            <Input
              id={FIELD_IDS.reminder_offsets}
              name="reminder_offsets"
              type="text"
              disabled={props.disabled}
              value={fields.reminder_offsets}
              onChange={(e) => updateField("reminder_offsets", e.target.value)}
              onBlur={(e) =>
                validateFieldOnBlur("reminder_offsets", e.target.value)
              }
              aria-invalid={Boolean(mergedErrors.reminder_offsets)}
              aria-describedby={describedBy("reminder_offsets", true)}
              className="mt-1.5 h-10 scroll-mt-24 rounded-[9px] border-black/10 bg-[#F8F9F6] font-mono"
            />
            <p
              id={`${FIELD_IDS.reminder_offsets}-hint`}
              className="mt-1 text-[11.5px] text-[#63636A]"
            >
              Default:{" "}
              <span className="font-mono text-[#52525B]">
                -3, 0, 3, 7, 14, 30
              </span>
              . Negative = before due date; positive = days overdue.
            </p>
            {mergedErrors.reminder_offsets && (
              <p
                id={`${FIELD_IDS.reminder_offsets}-error`}
                className="mt-1 text-xs font-medium text-[#BE123C]"
              >
                {mergedErrors.reminder_offsets}
              </p>
            )}
          </div>

          {isEdit && invoice && (
            <>
              <div>
                <Label
                  htmlFor={FIELD_IDS.amount_received}
                  className="text-xs text-[#111111]"
                >
                  Amount received ({selectedCurrency})
                </Label>
                <div className="relative mt-1.5">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-[#52525B]"
                  >
                    {currencySymbol}
                  </span>
                  <Input
                    id={FIELD_IDS.amount_received}
                    name="amount_received"
                    type="text"
                    inputMode="decimal"
                    disabled={props.disabled}
                    value={fields.amount_received}
                    onChange={(e) =>
                      updateField("amount_received", e.target.value)
                    }
                    onBlur={(e) =>
                      validateFieldOnBlur("amount_received", e.target.value)
                    }
                    aria-invalid={Boolean(mergedErrors.amount_received)}
                    aria-describedby={describedBy("amount_received")}
                    className="h-10 scroll-mt-24 rounded-[9px] border-black/10 bg-[#F8F9F6] pl-7 font-mono"
                  />
                </div>
                {mergedErrors.amount_received && (
                  <p
                    id={`${FIELD_IDS.amount_received}-error`}
                    className="mt-1 text-xs font-medium text-[#BE123C]"
                  >
                    {mergedErrors.amount_received}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor={FIELD_IDS.paused_until}
                  className="text-xs text-[#111111]"
                >
                  Paused until (optional)
                </Label>
                <Input
                  id={FIELD_IDS.paused_until}
                  name="paused_until"
                  type="date"
                  disabled={props.disabled}
                  value={fields.paused_until}
                  onChange={(e) => updateField("paused_until", e.target.value)}
                  aria-invalid={Boolean(mergedErrors.paused_until)}
                  aria-describedby={describedBy("paused_until")}
                  className="mt-1.5 h-10 scroll-mt-24 rounded-[9px] border-black/10 bg-[#F8F9F6] font-mono"
                />
                {mergedErrors.paused_until && (
                  <p
                    id={`${FIELD_IDS.paused_until}-error`}
                    className="mt-1 text-xs font-medium text-[#BE123C]"
                  >
                    {mergedErrors.paused_until}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-5">
        <Button
          type="submit"
          disabled={props.disabled || pending}
          className="h-10 w-full rounded-[9px] border border-[#111111] bg-[#111111] px-5 text-xs font-medium text-white shadow-[0_1px_2px_rgba(17,17,17,0.16)] hover:bg-[#262626] active:bg-[#000000] sm:h-9 sm:w-auto"
        >
          {pending
            ? "Saving..."
            : isEdit
              ? "Save changes"
              : "Create invoice"}
        </Button>
      </div>
    </form>
  );
}
