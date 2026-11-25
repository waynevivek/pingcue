"use client";

import { useState, useTransition } from "react";
import { Check, Copy, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logWhatsappNudgeAction } from "./actions";

export function WhatsappNudgeActions({
  invoiceId,
  offsetDays,
  message,
  waUrl,
  active,
}: {
  invoiceId: string;
  offsetDays: number;
  message: string;
  waUrl: string | null;
  active: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleWhatsappClick() {
    startTransition(() => {
      logWhatsappNudgeAction(invoiceId, offsetDays).catch(() => {});
    });
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {active && waUrl && (
          <Button asChild variant="success">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsappClick}
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              <span>Send on WhatsApp</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </Button>
        )}

        <Button type="button" variant="outline" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span>Copy message</span>
            </>
          )}
        </Button>
      </div>

      {!active ? (
        <p className="text-xs font-medium text-success-foreground">
          Invoice is marked paid—no WhatsApp nudge needed.
        </p>
      ) : !waUrl ? (
        <p className="text-xs text-muted-foreground">
          Add a client WhatsApp number in the Edit form below (e.g.{" "}
          <span className="font-mono text-foreground">919876543210</span>) to
          open WhatsApp directly, or copy the message above.
        </p>
      ) : null}
    </div>
  );
}
