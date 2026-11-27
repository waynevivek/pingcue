"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { sendTestEmailAction, type TestEmailState } from "./actions";

const INITIAL_STATE: TestEmailState = {};

export function SendTestEmailButton({
  invoiceId,
  offsetDays,
}: {
  invoiceId: string;
  offsetDays?: number;
}) {
  const [state, formAction, pending] = useActionState(
    sendTestEmailAction.bind(null, invoiceId),
    INITIAL_STATE
  );

  return (
    <div className="shrink-0 space-y-2">
      <form action={formAction}>
        {typeof offsetDays === "number" && (
          <input type="hidden" name="offset_days" value={offsetDays} />
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] border border-black/[0.1] bg-white px-3 text-xs font-medium text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#F5F6F3] active:bg-[#ECEEE6] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:h-8 sm:w-auto"
        >
          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{pending ? "Sending test..." : "Send test to me"}</span>
        </button>
      </form>

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
