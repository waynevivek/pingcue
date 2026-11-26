"use client";

import { useActionState, useState } from "react";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Currency } from "@/lib/invoices";
import { CurrencyPicker } from "../CurrencyPicker";
import { updateSettingsAction, type SettingsFormState } from "./actions";

const INITIAL_STATE: SettingsFormState = {};

export function SettingsForm({
  email,
  initialDisplayName,
  initialDefaultCurrency,
  initialNotifyOnSend,
}: {
  email: string;
  initialDisplayName: string;
  initialDefaultCurrency: Currency;
  initialNotifyOnSend: boolean;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [notifyOnSend, setNotifyOnSend] = useState(initialNotifyOnSend);
  const [state, formAction, pending] = useActionState(
    updateSettingsAction,
    INITIAL_STATE
  );

  const cleanName = displayName.trim();
  const sanitizedHeaderName = cleanName
    .replace(/[\r\n\x00-\x1f\x7f"<>\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const previewSender = cleanName || email;
  const previewFrom = sanitizedHeaderName
    ? /via pingcue$/i.test(sanitizedHeaderName)
      ? sanitizedHeaderName
      : `${sanitizedHeaderName} via PingCue`
    : "PingCue";

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div
          role="alert"
          className="rounded-[12px] border border-[#FECDD3] bg-[#FFF1F2] px-3.5 py-2.5 text-xs font-medium text-[#BE123C]"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-2.5 text-xs font-medium text-[#15803D]"
        >
          {state.success}
        </div>
      )}

      {/* Sender Name + Clean Inset Inbox Preview */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="settings-display-name" className="text-xs text-[#131316]">
            Your name or studio name
          </Label>
          <Input
            id="settings-display-name"
            name="display_name"
            type="text"
            maxLength={80}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Vivek Sharma or Northstar"
            className="mt-1.5 h-10 rounded-[10px] border-black/10 bg-[#F9F9F8]"
          />
        </div>

        <div className="rounded-[12px] border border-black/[0.06] bg-[#F7F7F5] px-3.5 py-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#63636A]">
            <Mail className="h-3.5 w-3.5 text-[#131316]" aria-hidden="true" />
            <span>Inbox sender &amp; sign-off preview</span>
          </div>
          <div className="mt-2.5 border-t border-black/[0.06] pt-2.5 text-xs leading-relaxed text-[#52525B]">
            <p className="break-words font-mono text-[11px] text-[#71717A]">
              From:{" "}
              <span className="font-sans font-semibold text-[#131316]">
                {previewFrom}
              </span>
            </p>
            <p className="mt-2">Thanks,</p>
            <p className="font-medium text-[#131316]">{previewSender}</p>
            <p className="mt-1.5 break-words font-mono text-[11px] text-[#71717A]">
              Reply-To: {email}
            </p>
          </div>
        </div>
      </div>

      {/* Apple Segmented Currency Picker */}
      <div>
        <p
          id="settings-default-currency-label"
          className="text-xs font-medium text-[#131316]"
        >
          Default invoice currency
        </p>
        <div className="mt-1.5">
          <CurrencyPicker
            id="settings-default-currency"
            name="default_currency"
            ariaLabelledBy="settings-default-currency-label"
            defaultValue={initialDefaultCurrency}
          />
        </div>
        <p className="mt-1.5 text-[11.5px] text-[#71717A]">
          Preselected whenever you create a new invoice.
        </p>
      </div>

      {/* iOS-Style Toggle Row */}
      <div className="rounded-[12px] border border-black/[0.07] bg-[#F9F9F8] px-3.5 py-3">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span className="min-w-0 space-y-0.5">
            <span className="block text-xs font-semibold text-[#131316]">
              Daily send summary email
            </span>
            <span className="block text-[11.5px] leading-relaxed text-[#63636A]">
              One concise recap to{" "}
              <span className="break-words font-mono text-[#131316]">
                {email}
              </span>{" "}
              whenever cron emails a client.
            </span>
          </span>

          <span className="relative inline-flex shrink-0 items-center">
            <input
              type="checkbox"
              name="notify_on_send"
              checked={notifyOnSend}
              onChange={(e) => setNotifyOnSend(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="h-6 w-11 rounded-full bg-[#D4D4D8] transition-colors peer-checked:bg-[#131316] peer-focus-visible:ring-2 peer-focus-visible:ring-[#131316] peer-focus-visible:ring-offset-2"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
            />
          </span>
        </label>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 w-full items-center justify-center rounded-[9px] border border-[#131316] bg-[#131316] px-4 text-xs font-medium text-white shadow-[0_1px_2px_rgba(19,19,22,0.18),inset_0_1px_0_rgba(255,255,255,0.16)] transition-colors hover:bg-[#26262B] cursor-pointer disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
