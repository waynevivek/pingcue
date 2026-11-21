"use client";

import { useActionState } from "react";
import { sendTestEmailAction, type TestEmailState } from "./actions";

const INITIAL_STATE: TestEmailState = {};

export function SendTestEmailButton({ invoiceId }: { invoiceId: string }) {
  const [state, formAction, pending] = useActionState(
    sendTestEmailAction.bind(null, invoiceId),
    INITIAL_STATE
  );

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 shrink-0"
          >
            <path
              d="M3 5.5h14v9H3v-9Zm0 .75 7 4.75 7-4.75"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{pending ? "Sending test email..." : "Send test email to me"}</span>
        </button>
      </form>

      {state.success && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900"
        >
          {state.success}
        </p>
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800"
        >
          {state.error}
        </p>
      )}
    </div>
  );
}
