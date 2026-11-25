"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type InlineEmailPreviewStep = {
  offset: number;
  offsetBadge: string;
  toneLabel: "Friendly" | "Firm" | "Final notice";
  scheduledDate: string;
  wasSent: boolean;
  subject: string;
  text: string;
};

export function InlineEmailPreview({
  steps,
  defaultOffset,
  clientEmail,
  replyTo,
}: {
  steps: InlineEmailPreviewStep[];
  defaultOffset: number;
  clientEmail: string;
  replyTo: string;
}) {
  const initialIndex = Math.max(
    0,
    steps.findIndex((s) => s.offset === defaultOffset)
  );
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  if (steps.length === 0) return null;

  const activeStep = steps[selectedIndex] ?? steps[0];

  const toneBadgeVariant = activeStep.wasSent
    ? ("paid" as const)
    : activeStep.toneLabel === "Firm"
      ? ("firm" as const)
      : activeStep.toneLabel === "Final notice"
        ? ("overdue" as const)
        : ("primary" as const);

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label="Preview reminder steps"
        className="flex flex-wrap gap-1.5"
      >
        {steps.map((step, index) => {
          const selected = index === selectedIndex;
          return (
            <button
              key={step.offset}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]",
                selected
                  ? "border-[#111111] bg-[#111111] text-white"
                  : step.wasSent
                    ? "border-[#BBF7D0] bg-[#DCFCE7]/75 text-[#14532D] hover:bg-[#DCFCE7]"
                    : "border-black/[0.08] bg-[#FAFAFA] text-[#111111] hover:bg-[#F4F4F5]"
              )}
            >
              {step.wasSent && !selected && (
                <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
              )}
              <span>{step.offsetBadge}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-black/[0.08] bg-[#FAFAFA] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-2.5 text-[11px] text-[#52525B]">
          <span className="truncate font-mono">
            To: {clientEmail} · Reply-To: {replyTo}
          </span>
          <Badge variant={toneBadgeVariant} className="px-2 py-0 text-[10px]">
            {activeStep.wasSent ? "Sent" : activeStep.toneLabel} ·{" "}
            {activeStep.scheduledDate}
          </Badge>
        </div>

        <p className="mt-3 text-xs font-semibold text-[#111111]">
          Subject: {activeStep.subject}
        </p>

        <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#3F3F46]">
          {activeStep.text}
        </pre>
      </div>
    </div>
  );
}
