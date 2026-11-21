"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  CURRENCIES,
  DEFAULT_REMINDER_OFFSETS,
  formatOffsetsInput,
  minorToMajorInput,
  normalizeWhatsappNumber,
  parseMajorToMinor,
  parseReminderOffsets,
  type Invoice,
  type InvoiceFormState,
} from "@/lib/invoices";
import { createInvoiceAction, updateInvoiceAction } from "./actions";

type InvoiceFormProps =
  | {
      mode: "create";
      defaultDueDate: string;
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
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error || (state.fieldErrors && Object.keys(state.fieldErrors).length > 0)) {
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

    if (name === "client_email" && trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
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
        message = "Enter digits with country code (e.g. 919876543210, 7–15 digits).";
      }
    } else if (name === "payment_link" && trimmed) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          message = "Payment link must start with https:// or http://.";
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

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {(state.error || errorEntries.length > 0) && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="invoice-form-error-title"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 focus:outline-none focus:ring-2 focus:ring-red-600"
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
                    className="underline hover:text-red-700"
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
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
        >
          {state.success}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor={FIELD_IDS.title}
            className="block text-sm font-medium text-slate-800"
          >
            Invoice title <span className="text-red-600">*</span>
          </label>
          <input
            id={FIELD_IDS.title}
            name="title"
            type="text"
            required
            disabled={props.disabled}
            defaultValue={invoice?.title ?? ""}
            onChange={() => clearBlurError("title")}
            placeholder="Website Redesign — Milestone 2"
            aria-invalid={Boolean(mergedErrors.title)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
          />
          {mergedErrors.title && (
            <p className="mt-1 text-xs font-medium text-red-700">
              {mergedErrors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={FIELD_IDS.client_name}
            className="block text-sm font-medium text-slate-800"
          >
            Client name <span className="text-red-600">*</span>
          </label>
          <input
            id={FIELD_IDS.client_name}
            name="client_name"
            type="text"
            required
            disabled={props.disabled}
            defaultValue={invoice?.client_name ?? ""}
            onChange={() => clearBlurError("client_name")}
            placeholder="Priya Sharma"
            aria-invalid={Boolean(mergedErrors.client_name)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
          />
          {mergedErrors.client_name && (
            <p className="mt-1 text-xs font-medium text-red-700">
              {mergedErrors.client_name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={FIELD_IDS.client_email}
            className="block text-sm font-medium text-slate-800"
          >
            Client email <span className="text-red-600">*</span>
          </label>
          <input
            id={FIELD_IDS.client_email}
            name="client_email"
            type="email"
            required
            disabled={props.disabled}
            defaultValue={invoice?.client_email ?? ""}
            onChange={() => clearBlurError("client_email")}
            onBlur={(e) => validateFieldOnBlur("client_email", e.target.value)}
            placeholder="priya@client.co"
            aria-invalid={Boolean(mergedErrors.client_email)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
          />
          {mergedErrors.client_email && (
            <p className="mt-1 text-xs font-medium text-red-700">
              {mergedErrors.client_email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={FIELD_IDS.client_whatsapp}
            className="block text-sm font-medium text-slate-800"
          >
            Client WhatsApp (optional)
          </label>
          <input
            id={FIELD_IDS.client_whatsapp}
            name="client_whatsapp"
            type="tel"
            disabled={props.disabled}
            defaultValue={invoice?.client_whatsapp ?? ""}
            onChange={() => clearBlurError("client_whatsapp")}
            onBlur={(e) => validateFieldOnBlur("client_whatsapp", e.target.value)}
            placeholder="919876543210"
            aria-invalid={Boolean(mergedErrors.client_whatsapp)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            Include country code without + (e.g. 919876543210).
          </p>
          {mergedErrors.client_whatsapp && (
            <p className="mt-1 text-xs font-medium text-red-700">
              {mergedErrors.client_whatsapp}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={FIELD_IDS.due_date}
            className="block text-sm font-medium text-slate-800"
          >
            Due date <span className="text-red-600">*</span>
          </label>
          <input
            id={FIELD_IDS.due_date}
            name="due_date"
            type="date"
            required
            disabled={props.disabled}
            defaultValue={
              props.mode === "edit"
                ? props.invoice.due_date
                : props.defaultDueDate
            }
            onChange={() => clearBlurError("due_date")}
            aria-invalid={Boolean(mergedErrors.due_date)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
          />
          {mergedErrors.due_date && (
            <p className="mt-1 text-xs font-medium text-red-700">
              {mergedErrors.due_date}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={FIELD_IDS.currency}
            className="block text-sm font-medium text-slate-800"
          >
            Currency <span className="text-red-600">*</span>
          </label>
          <select
            id={FIELD_IDS.currency}
            name="currency"
            disabled={props.disabled}
            defaultValue={invoice?.currency ?? "INR"}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
          >
            {CURRENCIES.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={FIELD_IDS.amount}
            className="block text-sm font-medium text-slate-800"
          >
            Invoice amount <span className="text-red-600">*</span>
          </label>
          <input
            id={FIELD_IDS.amount}
            name="amount"
            type="text"
            inputMode="decimal"
            required
            disabled={props.disabled}
            defaultValue={invoice ? minorToMajorInput(invoice.amount_minor) : ""}
            onChange={() => clearBlurError("amount")}
            onBlur={(e) => validateFieldOnBlur("amount", e.target.value)}
            placeholder="45000"
            aria-invalid={Boolean(mergedErrors.amount)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
          />
          {mergedErrors.amount && (
            <p className="mt-1 text-xs font-medium text-red-700">
              {mergedErrors.amount}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor={FIELD_IDS.payment_link}
            className="block text-sm font-medium text-slate-800"
          >
            Payment link (optional)
          </label>
          <input
            id={FIELD_IDS.payment_link}
            name="payment_link"
            type="url"
            disabled={props.disabled}
            defaultValue={invoice?.payment_link ?? ""}
            onChange={() => clearBlurError("payment_link")}
            onBlur={(e) => validateFieldOnBlur("payment_link", e.target.value)}
            placeholder="https://rzp.io/l/your-payment-link"
            aria-invalid={Boolean(mergedErrors.payment_link)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
          />
          {mergedErrors.payment_link && (
            <p className="mt-1 text-xs font-medium text-red-700">
              {mergedErrors.payment_link}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor={FIELD_IDS.reminder_offsets}
            className="block text-sm font-medium text-slate-800"
          >
            Reminder schedule (days relative to due date)
          </label>
          <input
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
            onBlur={(e) => validateFieldOnBlur("reminder_offsets", e.target.value)}
            aria-invalid={Boolean(mergedErrors.reminder_offsets)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            Default: <span className="font-mono">-3, 0, 3, 7, 14, 30</span>.
            Negative = before due date; positive = days overdue.
          </p>
          {mergedErrors.reminder_offsets && (
            <p className="mt-1 text-xs font-medium text-red-700">
              {mergedErrors.reminder_offsets}
            </p>
          )}
        </div>

        {isEdit && invoice && (
          <>
            <div>
              <label
                htmlFor={FIELD_IDS.amount_received}
                className="block text-sm font-medium text-slate-800"
              >
                Amount received
              </label>
              <input
                id={FIELD_IDS.amount_received}
                name="amount_received"
                type="text"
                inputMode="decimal"
                defaultValue={minorToMajorInput(invoice.amount_received_minor)}
                onChange={() => clearBlurError("amount_received")}
                onBlur={(e) => validateFieldOnBlur("amount_received", e.target.value)}
                aria-invalid={Boolean(mergedErrors.amount_received)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              {mergedErrors.amount_received && (
                <p className="mt-1 text-xs font-medium text-red-700">
                  {mergedErrors.amount_received}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={FIELD_IDS.paused_until}
                className="block text-sm font-medium text-slate-800"
              >
                Paused until (optional)
              </label>
              <input
                id={FIELD_IDS.paused_until}
                name="paused_until"
                type="date"
                defaultValue={invoice.paused_until ?? ""}
                onChange={() => clearBlurError("paused_until")}
                aria-invalid={Boolean(mergedErrors.paused_until)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              {mergedErrors.paused_until && (
                <p className="mt-1 text-xs font-medium text-red-700">
                  {mergedErrors.paused_until}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={props.disabled || pending}
          className="rounded-lg bg-[#C2410C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
        >
          {pending
            ? "Saving..."
            : isEdit
              ? "Save changes"
              : "Create invoice"}
        </button>
      </div>
    </form>
  );
}
