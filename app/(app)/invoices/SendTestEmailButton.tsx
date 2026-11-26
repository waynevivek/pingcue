"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { sendTestEmailAction, type TestEmailState } from "./actions";

const INITIAL_STATE: TestEmailState = {};

export function SendTestEmailButton({ invoiceId }: { invoiceId: string }) {
  const [state, formAction, pending] = useActionState(
    sendTestEmailAction.bind(null, invoiceId),
    INITIAL_STATE
  );

  return (
    <div className="shrink-0 space-y-2">
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] border border-black/10 bg-white px-3 text-xs font-medium text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-[#F5F5F3] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316] sm:w-auto"
        >
          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{pending ? "Sending test..." : "Send test to me"}</span>
        </button>
      </form>

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
