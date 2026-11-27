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
    <form action={formAction} className="divide-y divide-black/[0.06]">
      {(state.error || state.success) && (
        <div className="space-y-2 pb-5">
          {state.error && (
            <div
              role="alert"
              className="rounded-[10px] border border-[#FECDD3] bg-[#FFF5F6] px-3.5 py-2.5 text-xs font-medium text-[#9F1239]"
            >
              {state.error}
            </div>
          )}

          {state.success && (
            <div
              role="status"
              className="rounded-[10px] border border-[#BBF7D0] bg-[#F2FDF5] px-3.5 py-2.5 text-xs font-medium text-[#14532D]"
            >
              {state.success}
            </div>
          )}
        </div>
      )}

      {/* Row 1: Sender Name + Live Inset Inbox Preview */}
      <div className="grid gap-5 py-5 first:pt-0 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <div className="space-y-1">
          <h2 className="text-[13px] font-semibold text-[#111111]">
            Sender identity
          </h2>
          <p className="text-pretty text-xs leading-relaxed text-[#63636A]">
            Shown in the From header and email sign-off. Client replies go
            directly to your inbox.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <Label
              htmlFor="settings-display-name"
              className="text-xs text-[#111111]"
            >
              Your name or studio name
            </Label>
            <Input
              id="settings-display-name"
              name="display_name"
              type="text"
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Morgan or Northstar Studio"
              className="mt-1.5 h-10 rounded-[9px] border-black/10 bg-[#F8F9F6]"
            />
          </div>

          <div className="rounded-[12px] border border-black/[0.07] bg-[#F8F9F6] px-4 py-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#52525B]">
              <Mail className="h-3.5 w-3.5 text-[#111111]" aria-hidden="true" />
              <span>Inbox sender &amp; sign-off preview</span>
            </div>
            <div className="mt-2.5 border-t border-black/[0.06] pt-2.5 text-xs leading-relaxed text-[#52525B]">
              <p className="break-words font-mono text-[11px] text-[#63636A]">
                From:{" "}
                <span className="font-sans font-semibold text-[#111111]">
                  {previewFrom}
                </span>
              </p>
              <p className="mt-2">Thanks,</p>
              <p className="font-medium text-[#111111]">{previewSender}</p>
              <p className="mt-1.5 break-words font-mono text-[11px] text-[#63636A]">
                Reply-To: {email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Default Currency */}
      <div className="grid gap-5 py-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <div className="space-y-1">
          <p
            id="settings-default-currency-label"
            className="text-[13px] font-semibold text-[#111111]"
          >
            Default currency
          </p>
          <p className="text-pretty text-xs leading-relaxed text-[#63636A]">
            Preselected whenever you create a new invoice.
          </p>
        </div>

        <div className="space-y-2">
          <CurrencyPicker
            key={initialDefaultCurrency}
            id="settings-default-currency"
            name="default_currency"
            ariaLabelledBy="settings-default-currency-label"
            ariaDescribedBy="settings-currency-hint"
            defaultValue={initialDefaultCurrency}
          />
          <p
            id="settings-currency-hint"
            className="text-[11.5px] leading-relaxed text-[#63636A]"
          >
            Preselected on new invoices. Existing invoices always keep their
            original currency.
          </p>
        </div>
      </div>

      {/* Row 3: Daily Send Summary Toggle */}
      <div className="grid gap-5 py-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <div className="space-y-1">
          <h2 className="text-[13px] font-semibold text-[#111111]">
            Notifications
          </h2>
          <p className="text-pretty text-xs leading-relaxed text-[#63636A]">
            Stay informed whenever scheduled reminders run.
          </p>
        </div>

        <div className="rounded-[12px] border border-black/[0.07] bg-[#F8F9F6] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-0.5">
              <label
                htmlFor="settings-notify-switch"
                className="block cursor-pointer text-xs font-semibold text-[#111111]"
              >
                Daily send summary email
              </label>
              <p
                id="settings-notify-hint"
                className="text-[11.5px] leading-relaxed text-[#52525B]"
              >
                One concise recap to{" "}
                <span className="break-words font-mono text-[#111111]">
                  {email}
                </span>{" "}
                whenever Autopilot emails a client.
              </p>
            </div>

            <label
              htmlFor="settings-notify-switch"
              className="relative inline-flex shrink-0 cursor-pointer items-center"
            >
              <input
                id="settings-notify-switch"
                type="checkbox"
                role="switch"
                name="notify_on_send"
                checked={notifyOnSend}
                aria-checked={notifyOnSend}
                aria-describedby="settings-notify-hint"
                onChange={(e) => setNotifyOnSend(e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="h-6 w-11 rounded-full bg-[#D4D4D8] transition-colors peer-checked:bg-[#111111] peer-focus-visible:ring-2 peer-focus-visible:ring-[#111111] peer-focus-visible:ring-offset-2"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 w-full items-center justify-center rounded-[9px] border border-[#111111] bg-[#111111] px-4 text-xs font-medium text-white shadow-[0_1px_2px_rgba(17,17,17,0.16)] transition-colors hover:bg-[#262626] active:bg-[#000000] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:opacity-60 sm:h-9 sm:w-auto"
        >
          {pending ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
