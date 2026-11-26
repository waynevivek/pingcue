"use client";

import { useActionState, useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const previewSender = displayName.trim() || email;

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div
          role="alert"
          className="rounded-2xl border border-[#FECDD3] bg-[#FFE4E6] px-4 py-3 text-sm text-[#9F1239]"
        >
          {state.error}
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

      {/* Sender Name + Live Email Sign-Off Preview */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="settings-display-name">
            Your name or studio name
          </Label>
          <Input
            id="settings-display-name"
            name="display_name"
            type="text"
            maxLength={80}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Vivek Sharma or Northstar Studio"
            className="mt-1.5"
          />
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-[#FAFAFA] p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#52525B]">
            <Mail className="h-3.5 w-3.5 text-[#111111]" aria-hidden="true" />
            <span>Live email sign-off preview</span>
          </div>
          <div className="mt-2 rounded-xl border border-black/[0.06] bg-white px-3.5 py-2.5 text-xs leading-relaxed text-[#3F3F46]">
            <p>Thanks,</p>
            <p className="font-semibold text-[#111111]">{previewSender}</p>
            <p className="mt-1.5 truncate font-mono text-[11px] text-[#71717A]">
              Reply-To: {email}
            </p>
          </div>
        </div>
      </div>

      {/* Tactile Default Currency Picker */}
      <div>
        <Label htmlFor="settings-default-currency">
          Default invoice currency
        </Label>
        <div className="mt-1.5">
          <CurrencyPicker
            id="settings-default-currency"
            name="default_currency"
            defaultValue={initialDefaultCurrency}
          />
        </div>
        <p className="mt-1.5 text-xs text-[#52525B]">
          Preselected whenever you create a new invoice.
        </p>
      </div>

      {/* Tactile Toggle Switch */}
      <div className="rounded-2xl border border-black/[0.08] bg-[#FAFAFA] p-4">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span className="min-w-0 space-y-0.5 text-sm">
            <span className="block font-medium text-[#111111]">
              Daily send summary email
            </span>
            <span className="block text-xs leading-relaxed text-[#52525B]">
              Sends one concise recap to{" "}
              <span className="break-words font-mono text-[#111111]">
                {email}
              </span>{" "}
              whenever the automated cron emails a client.
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
              className="h-7 w-12 rounded-full border border-black/10 bg-[#D4D4D8] transition-colors peer-checked:bg-[#111111] peer-focus-visible:ring-2 peer-focus-visible:ring-[#111111] peer-focus-visible:ring-offset-2"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
            />
          </span>
        </label>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
