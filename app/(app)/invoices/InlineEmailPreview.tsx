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
  shortDate: string;
  wasSent: boolean;
  subject: string;
  text: string;
};

export function InlineEmailPreview({
  steps,
  defaultOffset,
  clientEmail,
  replyTo,
  paused,
  pausedUntilFormatted,
}: {
  steps: InlineEmailPreviewStep[];
  defaultOffset: number;
  clientEmail: string;
  replyTo: string;
  paused?: boolean;
  pausedUntilFormatted?: string | null;
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
    <div className="space-y-4">
      {/* Mint-Lime Tactile Keycap Timeline (matching landing cadence signature) */}
      <div className="rounded-[20px] border border-black/[0.06] bg-[#D6F7A3] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold tracking-[-0.01em] text-[#111111]">
            Escalation cadence
          </span>
          <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-semibold text-[#1A2E05] tabular-nums">
            {paused && pausedUntilFormatted
              ? `Paused until ${pausedUntilFormatted}`
              : `${activeStep.offsetBadge} · ${activeStep.wasSent ? "Sent" : activeStep.toneLabel}`}
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Reminder cadence steps"
          className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6"
        >
          {steps.map((step, index) => {
            const selected = index === selectedIndex;
            const toneShort =
              step.toneLabel === "Final notice" ? "Final" : step.toneLabel;
            return (
              <button
                key={step.offset}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border px-1.5 py-2.5 text-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] active:translate-y-[2px] active:shadow-none",
                  selected
                    ? "border-[#111111] bg-[#111111] text-white shadow-[0_3px_0_rgba(17,17,17,0.3)] -translate-y-0.5"
                    : step.wasSent
                      ? "border-black/10 bg-white/90 text-[#14532D] shadow-[0_3px_0_rgba(17,17,17,0.08)] hover:bg-white"
                      : "border-black/10 bg-white text-[#111111] shadow-[0_3px_0_rgba(17,17,17,0.12)] hover:-translate-y-0.5"
                )}
              >
                <div className="inline-flex items-center gap-0.5 font-mono text-xs font-bold leading-none tabular-nums">
                  {step.wasSent && !selected && (
                    <Check
                      className="h-3 w-3 text-[#16A34A]"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  )}
                  <span>{step.offsetBadge}</span>
                </div>
                <span
                  className={cn(
                    "mt-1 text-[10px] font-semibold leading-none",
                    selected ? "text-white/85" : "text-[#52525B]"
                  )}
                >
                  {step.wasSent && !selected ? "Sent" : toneShort}
                </span>
                <span
                  className={cn(
                    "mt-1 font-mono text-[10px] leading-none tabular-nums",
                    selected ? "text-white/70" : "text-[#71717A]"
                  )}
                >
                  {step.shortDate}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-[11px] font-medium text-[#28420C]">
          Tap any step above to preview the exact email. Daily cron runs at
          04:00 UTC (09:30 IST).
        </p>
      </div>

      {/* Live Email Dispatch Sheet */}
      <div className="rounded-[20px] border border-black/[0.07] bg-[#FAFAFA] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-2.5 text-[11px] text-[#52525B]">
          <span className="min-w-0 max-w-full truncate font-mono">
            To: {clientEmail} · Reply-To: {replyTo}
          </span>
          <Badge variant={toneBadgeVariant} className="px-2 py-0 text-[10px]">
            {activeStep.wasSent ? "Sent" : activeStep.toneLabel} ·{" "}
            {activeStep.scheduledDate}
          </Badge>
        </div>

        <div className="mt-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
          <p className="text-xs font-semibold text-[#111111] sm:text-[13px]">
            Subject: {activeStep.subject}
          </p>

          <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#3F3F46] sm:text-[13px]">
            {activeStep.text}
          </pre>
        </div>
      </div>
    </div>
  );
}
