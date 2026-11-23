"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <Button type="submit" disabled={pending}>
          <Mail className="h-4 w-4" aria-hidden="true" />
          <span>{pending ? "Sending test email..." : "Send test email to me"}</span>
        </Button>
      </form>

      {state.success && (
        <p
          role="status"
          className="rounded-lg border border-success-border bg-success-surface px-3 py-2 text-xs font-medium text-success-foreground"
        >
          {state.success}
        </p>
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive-border bg-destructive-surface px-3 py-2 text-xs font-medium text-[#991b1b]"
        >
          {state.error}
        </p>
      )}
    </div>
  );
}
