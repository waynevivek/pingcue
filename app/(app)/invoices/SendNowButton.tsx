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
  const [confirmingFor, setConfirmingFor] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    sendReminderNowAction.bind(null, invoiceId),
    INITIAL_STATE
  );
  const confirming = confirmingFor === offsetLabel;

  return (
    <div className="space-y-2 border-t border-black/[0.06] pt-3">
      {!confirming ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11.5px] text-[#52525B]">
            Need to nudge right now instead of waiting for cron?
          </p>
          <button
            type="button"
            onClick={() => setConfirmingFor(offsetLabel)}
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-[#111111] bg-[#111111] px-3 text-xs font-medium text-white shadow-[0_1px_2px_rgba(17,17,17,0.16)] transition-colors hover:bg-[#262626] active:bg-[#000000] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:h-8"
          >
            <Send className="h-3 w-3" aria-hidden="true" />
            <span>Send {offsetLabel} now</span>
          </button>
        </div>
      ) : (
        <div className="rounded-[10px] border border-black/[0.09] bg-white p-3.5">
          <p className="text-xs font-medium text-[#111111]">
            Send <span className="font-mono font-semibold">{offsetLabel}</span>{" "}
            ({toneLabel}) email to{" "}
            <span className="font-mono">{clientEmail}</span> now?
          </p>
          <p className="mt-1 text-[11px] text-[#52525B]">
            Marks {offsetLabel} as sent for this due date so cron won&apos;t send
            it twice.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <form action={formAction}>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-9 items-center whitespace-nowrap rounded-[7px] bg-[#111111] px-3 text-xs font-medium text-white transition-colors hover:bg-[#262626] active:bg-[#000000] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] disabled:opacity-60 sm:h-7"
              >
                {pending ? "Sending..." : "Confirm & send"}
              </button>
            </form>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmingFor(null)}
              className="inline-flex h-9 items-center whitespace-nowrap rounded-[7px] border border-black/10 bg-white px-3 text-xs font-medium text-[#111111] hover:bg-[#F5F6F3] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] disabled:opacity-60 sm:h-7"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {state.success && (
        <p
          role="status"
          className="rounded-[10px] border border-[#BBF7D0] bg-[#F2FDF5] px-3 py-2 text-xs font-medium text-[#14532D]"
        >
          {state.success}
        </p>
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded-[10px] border border-[#FECDD3] bg-[#FFF5F6] px-3 py-2 text-xs font-medium text-[#9F1239]"
        >
          {state.error}
        </p>
      )}
    </div>
  );
}
