"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
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
    }
  | {
      mode: "edit";
      invoice: Invoice;
      disabled?: boolean;
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
  const invoice = isEdit ? props.invoice : null;

  const boundAction = isEdit
    ? updateInvoiceAction.bind(null, invoice!.id)
    : createInvoiceAction;

  const [state, formAction, pending] = useActionState(
    boundAction,
    INITIAL_STATE
  );
  const [blurErrors, setBlurErrors] = useState<Record<string, string>>({});
  const [dueDate, setDueDate] = useState(
    props.mode === "edit" ? props.invoice.due_date : props.defaultDueDate
  );
  const summaryRef = useRef<HTMLDivElement>(null);

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
          "Enter digits with country code (e.g. 919876543210, 7–15 digits).";
      }
    } else if (name === "payment_link" && trimmed) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== "https:") {
          message = "Payment link must start with https://.";
        }
      } catch {
        message = "Enter a valid URL (e.g. https://rzp.io/l/...).";
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
  const initialCurrency: Currency =
    invoice?.currency ??
    (props.mode === "create" ? (props.defaultCurrency ?? "INR") : "INR");

  return (
    <form action={formAction} className="space-y-7" noValidate>
      {(state.error || errorEntries.length > 0) && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="invoice-form-error-title"
          className="rounded-2xl border border-[#FECDD3] bg-[#FFE4E6] p-4 text-sm text-[#9F1239] focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
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
          className="rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] px-4 py-3 text-sm font-medium text-[#14532D]"
        >
          {state.success}
        </div>
      )}

      {/* Group 1: Invoice & Client */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-[#52525B]">
          Client &amp; invoice
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor={FIELD_IDS.title}>
              Invoice title <span className="text-[#BE123C]">*</span>
            </Label>
            <Input
              id={FIELD_IDS.title}
              name="title"
              type="text"
              required
              disabled={props.disabled}
              defaultValue={invoice?.title ?? ""}
              onChange={() => clearBlurError("title")}
              placeholder="Website Redesign — Milestone 2"
              aria-invalid={Boolean(mergedErrors.title)}
              className="mt-1.5"
            />
            {mergedErrors.title && (
              <p className="mt-1 text-xs font-medium text-[#BE123C]">
                {mergedErrors.title}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor={FIELD_IDS.client_name}>
              Client name <span className="text-[#BE123C]">*</span>
            </Label>
            <Input
              id={FIELD_IDS.client_name}
              name="client_name"
              type="text"
              required
              disabled={props.disabled}
              defaultValue={invoice?.client_name ?? ""}
              onChange={() => clearBlurError("client_name")}
              placeholder="Priya Sharma"
              aria-invalid={Boolean(mergedErrors.client_name)}
              className="mt-1.5"
            />
            {mergedErrors.client_name && (
              <p className="mt-1 text-xs font-medium text-[#BE123C]">
                {mergedErrors.client_name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor={FIELD_IDS.client_email}>
              Client email <span className="text-[#BE123C]">*</span>
            </Label>
            <Input
              id={FIELD_IDS.client_email}
              name="client_email"
              type="email"
              required
              disabled={props.disabled}
              defaultValue={invoice?.client_email ?? ""}
              onChange={() => clearBlurError("client_email")}
              onBlur={(e) =>
                validateFieldOnBlur("client_email", e.target.value)
              }
              placeholder="priya@client.co"
              aria-invalid={Boolean(mergedErrors.client_email)}
              className="mt-1.5"
            />
            {mergedErrors.client_email && (
              <p className="mt-1 text-xs font-medium text-[#BE123C]">
                {mergedErrors.client_email}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor={FIELD_IDS.client_whatsapp}>
              Client WhatsApp (optional)
            </Label>
            <Input
              id={FIELD_IDS.client_whatsapp}
              name="client_whatsapp"
              type="tel"
              disabled={props.disabled}
              defaultValue={invoice?.client_whatsapp ?? ""}
              onChange={() => clearBlurError("client_whatsapp")}
              onBlur={(e) =>
                validateFieldOnBlur("client_whatsapp", e.target.value)
              }
              placeholder="919876543210"
              aria-invalid={Boolean(mergedErrors.client_whatsapp)}
              className="mt-1.5 font-mono"
            />
            <p className="mt-1 text-xs text-[#52525B]">
              Include country code without + (e.g. 919876543210) for 1-tap
              WhatsApp nudges.
            </p>
            {mergedErrors.client_whatsapp && (
              <p className="mt-1 text-xs font-medium text-[#BE123C]">
                {mergedErrors.client_whatsapp}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Group 2: Amount & Due Date */}
      <div className="space-y-4 border-t border-black/[0.06] pt-6">
        <p className="text-xs font-semibold text-[#52525B]">
          Amount &amp; due date
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor={FIELD_IDS.currency}>
              Currency <span className="text-[#BE123C]">*</span>
            </Label>
            <div className="mt-1.5">
              <CurrencyPicker
                id={FIELD_IDS.currency}
                name="currency"
                defaultValue={initialCurrency}
                disabled={props.disabled}
              />
            </div>
          </div>

          <div>
            <Label htmlFor={FIELD_IDS.amount}>
              Invoice amount <span className="text-[#BE123C]">*</span>
            </Label>
            <Input
              id={FIELD_IDS.amount}
              name="amount"
              type="text"
              inputMode="decimal"
              required
              disabled={props.disabled}
              defaultValue={
                invoice ? minorToMajorInput(invoice.amount_minor) : ""
              }
              onChange={() => clearBlurError("amount")}
              onBlur={(e) => validateFieldOnBlur("amount", e.target.value)}
              placeholder="45000"
              aria-invalid={Boolean(mergedErrors.amount)}
              className="mt-1.5 font-mono"
            />
            {mergedErrors.amount && (
              <p className="mt-1 text-xs font-medium text-[#BE123C]">
                {mergedErrors.amount}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor={FIELD_IDS.due_date}>
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
              className="mt-1.5 font-mono"
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
                      onClick={() => {
                        setDueDate(targetIso);
                        clearBlurError("due_date");
                      }}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] ${
                        activePreset
                          ? "border-[#111111] bg-[#111111] text-white"
                          : "border-black/[0.08] bg-[#FAFAFA] text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            )}
            {mergedErrors.due_date && (
              <p className="mt-1 text-xs font-medium text-[#BE123C]">
                {mergedErrors.due_date}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Group 3: Payment Link & Cadence */}
      <div className="space-y-4 border-t border-black/[0.06] pt-6">
        <p className="text-xs font-semibold text-[#52525B]">
          Payment link &amp; reminder cadence
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor={FIELD_IDS.payment_link}>
              Payment link (optional)
            </Label>
            <Input
              id={FIELD_IDS.payment_link}
              name="payment_link"
              type="url"
              disabled={props.disabled}
              defaultValue={invoice?.payment_link ?? ""}
              onChange={() => clearBlurError("payment_link")}
              onBlur={(e) =>
                validateFieldOnBlur("payment_link", e.target.value)
              }
              placeholder="https://rzp.io/l/your-payment-link"
              aria-invalid={Boolean(mergedErrors.payment_link)}
              className="mt-1.5"
            />
            {mergedErrors.payment_link && (
              <p className="mt-1 text-xs font-medium text-[#BE123C]">
                {mergedErrors.payment_link}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor={FIELD_IDS.reminder_offsets}>
              Reminder schedule (days relative to due date)
            </Label>
            <Input
              id={FIELD_IDS.reminder_offsets}
              name="reminder_offsets"
              type="text"
              disabled={props.disabled}
              defaultValue={
                invoice
                  ? formatOffsetsInput(invoice.reminder_offsets)
                  : formatOffsetsInput([...DEFAULT_REMINDER_OFFSETS])
              }
              onChange={() => clearBlurError("reminder_offsets")}
              onBlur={(e) =>
                validateFieldOnBlur("reminder_offsets", e.target.value)
              }
              aria-invalid={Boolean(mergedErrors.reminder_offsets)}
              className="mt-1.5 font-mono"
            />
            <p className="mt-1 text-xs text-[#52525B]">
              Default: <span className="font-mono">-3, 0, 3, 7, 14, 30</span>.
              Negative = before due date; positive = days overdue.
            </p>
            {mergedErrors.reminder_offsets && (
              <p className="mt-1 text-xs font-medium text-[#BE123C]">
                {mergedErrors.reminder_offsets}
              </p>
            )}
          </div>

          {isEdit && invoice && (
            <>
              <div>
                <Label htmlFor={FIELD_IDS.amount_received}>
                  Amount received
                </Label>
                <Input
                  id={FIELD_IDS.amount_received}
                  name="amount_received"
                  type="text"
                  inputMode="decimal"
                  defaultValue={minorToMajorInput(
                    invoice.amount_received_minor
                  )}
                  onChange={() => clearBlurError("amount_received")}
                  onBlur={(e) =>
                    validateFieldOnBlur("amount_received", e.target.value)
                  }
                  aria-invalid={Boolean(mergedErrors.amount_received)}
                  className="mt-1.5 font-mono"
                />
                {mergedErrors.amount_received && (
                  <p className="mt-1 text-xs font-medium text-[#BE123C]">
                    {mergedErrors.amount_received}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor={FIELD_IDS.paused_until}>
                  Paused until (optional)
                </Label>
                <Input
                  id={FIELD_IDS.paused_until}
                  name="paused_until"
                  type="date"
                  defaultValue={invoice.paused_until ?? ""}
                  onChange={() => clearBlurError("paused_until")}
                  aria-invalid={Boolean(mergedErrors.paused_until)}
                  className="mt-1.5 font-mono"
                />
                {mergedErrors.paused_until && (
                  <p className="mt-1 text-xs font-medium text-[#BE123C]">
                    {mergedErrors.paused_until}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-1">
        <Button
          type="submit"
          size="lg"
          disabled={props.disabled || pending}
          className="w-full sm:w-auto"
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
