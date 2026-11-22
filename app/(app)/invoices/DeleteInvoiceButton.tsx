"use client";

import { useActionState, useState } from "react";
import { deleteInvoiceAction, type DeleteInvoiceState } from "./actions";

const INITIAL_STATE: DeleteInvoiceState = {};

export function DeleteInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(
    deleteInvoiceAction.bind(null, invoiceId),
    INITIAL_STATE
  );

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
      >
        Delete invoice
      </button>
    );
  }

  return (
    <div className="space-y-2 text-right">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-xs font-medium text-red-800">
          Delete this invoice permanently?
        </span>
        <form action={formAction}>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
          >
            {pending ? "Deleting..." : "Confirm delete"}
          </button>
        </form>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
        >
          Cancel
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}
    </div>
  );
}
