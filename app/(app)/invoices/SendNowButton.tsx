"use client";

import { useActionState, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-2.5 border-t border-black/[0.06] pt-4">
      {!confirming ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-[#52525B]">
            Invoice already overdue? Send the next step to your client right
            now.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirming(true)}
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Send reminder to client now</span>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-black/[0.08] bg-[#FAFAFA] p-3">
          <p className="text-xs font-medium text-[#111111]">
            Send <span className="font-mono">{offsetLabel}</span> ({toneLabel})
            email to <span className="font-mono">{clientEmail}</span> now?
          </p>
          <p className="mt-1 text-[11px] text-[#52525B]">
            This marks {offsetLabel} as sent for the current due date so the
            cron won&apos;t send it twice.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <form action={formAction}>
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Sending..." : "Confirm & send"}
              </Button>
            </form>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {state.success && (
        <p
          role="status"
          className="rounded-xl border border-[#BBF7D0] bg-[#DCFCE7] px-3 py-2 text-xs font-medium text-[#14532D]"
        >
          {state.success}
        </p>
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-[#FECDD3] bg-[#FFE4E6] px-3 py-2 text-xs font-medium text-[#9F1239]"
        >
          {state.error}
        </p>
      )}
    </div>
  );
}
