"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CURRENCIES, type Currency } from "@/lib/invoices";
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
  const [state, formAction, pending] = useActionState(
    updateSettingsAction,
    INITIAL_STATE
  );

  const previewSender = displayName.trim() || email;

  return (
    <form action={formAction} className="space-y-5">
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

      <div>
        <Label htmlFor="settings-display-name">Your name or studio name</Label>
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
        <p className="mt-1.5 text-xs text-[#52525B]">
          Emails sign off as:{" "}
          <span className="font-medium text-[#111111]">
            Thanks, {previewSender}
          </span>
        </p>
      </div>

      <div>
        <Label htmlFor="settings-default-currency">Default invoice currency</Label>
        <select
          id="settings-default-currency"
          name="default_currency"
          defaultValue={initialDefaultCurrency}
          className="mt-1.5 flex h-11 w-full rounded-xl border border-black/12 bg-[#FAFAFA] px-3.5 py-2.5 font-mono text-sm text-[#111111] transition-colors focus-visible:border-[#111111] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/10"
        >
          {CURRENCIES.map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-[#52525B]">
          Preselected whenever you create a new invoice.
        </p>
      </div>

      <div className="rounded-2xl border border-black/[0.08] bg-[#FAFAFA] p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="notify_on_send"
            defaultChecked={initialNotifyOnSend}
            className="mt-0.5 h-4 w-4 rounded border-black/20 accent-[#111111]"
          />
          <span className="space-y-0.5 text-sm">
            <span className="block font-medium text-[#111111]">
              Email me when PingCue sends scheduled reminders
            </span>
            <span className="block text-xs text-[#52525B]">
              Sends one concise daily summary to {email} whenever the automated
              cron emails a client.
            </span>
          </span>
        </label>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
