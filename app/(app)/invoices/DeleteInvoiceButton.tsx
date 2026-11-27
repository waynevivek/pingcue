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
        className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-[8px] border border-[#FECDD3] bg-white px-3 text-xs font-medium text-[#BE123C] shadow-[0_1px_2px_rgba(17,17,17,0.03)] transition-colors hover:bg-[#FFF5F6] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] sm:h-8"
      >
        Delete invoice
      </button>
    );
  }

  return (
    <div className="space-y-2 text-right">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-xs font-medium text-[#BE123C]">
          Delete permanently?
        </span>
        <form action={formAction}>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-9 items-center whitespace-nowrap rounded-[8px] bg-[#E11D48] px-3 text-xs font-medium text-white transition-colors hover:bg-[#BE123C] active:bg-[#9F1239] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] disabled:opacity-60 sm:h-8"
          >
            {pending ? "Deleting..." : "Confirm delete"}
          </button>
        </form>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="inline-flex h-9 items-center whitespace-nowrap rounded-[8px] border border-black/10 bg-white px-3 text-xs font-medium text-[#111111] hover:bg-[#F5F6F3] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] disabled:opacity-60 sm:h-8"
        >
          Cancel
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-xs font-medium text-[#BE123C]">
          {state.error}
        </p>
      )}
    </div>
  );
}
