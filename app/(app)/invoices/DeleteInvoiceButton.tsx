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
        className="inline-flex h-8 items-center justify-center rounded-[8px] border border-[#FECDD3] bg-white px-3 text-xs font-medium text-[#BE123C] shadow-[0_1px_2px_rgba(19,19,22,0.03)] transition-colors hover:bg-[#FFF1F2] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
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
            className="inline-flex h-8 items-center rounded-[8px] bg-[#E11D48] px-3 text-xs font-medium text-white transition-colors hover:bg-[#BE123C] cursor-pointer disabled:opacity-60"
          >
            {pending ? "Deleting..." : "Confirm delete"}
          </button>
        </form>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="inline-flex h-8 items-center rounded-[8px] border border-black/10 bg-white px-3 text-xs font-medium text-[#131316] hover:bg-[#F5F5F3] cursor-pointer disabled:opacity-60"
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
