"use client";

import { useActionState, useState } from "react";
import { Send } from "lucide-react";
import { sendReminderNowAction, type SendNowState } from "./actions";

const INITIAL_STATE: SendNowState = {};

export function SendNowButton({
  invoiceId,
  clientEmail,
  offsetLabel,
  toneLabel,
}: {
  invoiceId: string;
  clientEmail: string;
  offsetLabel: string;
  toneLabel: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(
    sendReminderNowAction.bind(null, invoiceId),
    INITIAL_STATE
  );

  return (
    <div className="space-y-2 border-t border-black/[0.06] pt-3">
      {!confirming ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11.5px] text-[#63636A]">
            Need to nudge right now instead of waiting for cron?
          </p>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#131316] bg-[#131316] px-3 text-xs font-medium text-white shadow-[0_1px_2px_rgba(19,19,22,0.16),inset_0_1px_0_rgba(255,255,255,0.14)] transition-colors hover:bg-[#26262B] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316]"
          >
            <Send className="h-3 w-3" aria-hidden="true" />
            <span>Send {offsetLabel} now</span>
          </button>
        </div>
      ) : (
        <div className="rounded-[10px] border border-black/[0.08] bg-white p-3">
          <p className="text-xs font-medium text-[#131316]">
            Send <span className="font-mono">{offsetLabel}</span> ({toneLabel})
            email to <span className="font-mono">{clientEmail}</span> now?
          </p>
          <p className="mt-1 text-[11px] text-[#63636A]">
            Marks {offsetLabel} as sent for this due date so cron won&apos;t send
            it twice.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <form action={formAction}>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-7 items-center rounded-[7px] bg-[#131316] px-3 text-xs font-medium text-white transition-colors hover:bg-[#26262B] cursor-pointer disabled:opacity-60"
              >
                {pending ? "Sending..." : "Confirm & send"}
              </button>
            </form>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirming(false)}
              className="inline-flex h-7 items-center rounded-[7px] border border-black/10 bg-white px-3 text-xs font-medium text-[#131316] hover:bg-[#F5F5F3] cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {state.success && (
        <p
          role="status"
          className="rounded-[10px] border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-xs font-medium text-[#15803D]"
        >
          {state.success}
        </p>
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded-[10px] border border-[#FECDD3] bg-[#FFF1F2] px-3 py-2 text-xs font-medium text-[#BE123C]"
        >
          {state.error}
        </p>
      )}
    </div>
  );
}
