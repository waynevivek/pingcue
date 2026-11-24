"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setConfirming(true)}
        className="border-[#FECDD3] text-[#BE123C] hover:bg-[#FFE4E6]"
      >
        Delete invoice
      </Button>
    );
  }

  return (
    <div className="space-y-2 text-right">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-xs font-medium text-[#BE123C]">
          Delete this invoice permanently?
        </span>
        <form action={formAction}>
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={pending}
          >
            {pending ? "Deleting..." : "Confirm delete"}
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
      {state.error && (
        <p role="alert" className="text-xs font-medium text-[#BE123C]">
          {state.error}
        </p>
      )}
    </div>
  );
}
