"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Lock,
  Mail,
  MessageSquare,
} from "lucide-react";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import { cn } from "@/lib/utils";
import { logWhatsappNudgeAction } from "./actions";
import { SendNowButton } from "./SendNowButton";
import { SendTestEmailButton } from "./SendTestEmailButton";

export type ChaserStep = {
  offset: number;
  offsetBadge: string;
  toneLabel: "Friendly" | "Firm" | "Final notice";
  scheduledDate: string;
  shortDate: string;
  wasSent: boolean;
  subject: string;
  text: string;
  whatsappMessage: string;
  whatsappTeaser: string;
  whatsappBlurred: string;
  waUrl: string | null;
};

export function UnifiedChaserStage({
  invoiceId,
  clientName,
  clientEmail,
  fromLabel,
  replyTo,
  userEmail,
  steps,
  defaultOffset,
  nextOffsetBadge,
  nextToneLabel,
  active,
  paused,
  pausedUntilFormatted,
  clientEmailSuppressed,
  canSendNow,
  isFoundingPass,
}: {
  invoiceId: string;
  clientName: string;
  clientEmail: string;
  fromLabel: string;
  replyTo: string;
  userEmail: string;
  steps: ChaserStep[];
  defaultOffset: number;
  nextOffsetBadge: string;
  nextToneLabel: string;
  active: boolean;
  paused: boolean;
  pausedUntilFormatted: string | null;
  clientEmailSuppressed: boolean;
  canSendNow: boolean;
  isFoundingPass: boolean;
}) {
  const initialIndex = Math.max(
    0,
    steps.findIndex((s) => s.offset === defaultOffset)
  );
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  if (steps.length === 0) return null;

  const safeIndex = Math.min(selectedIndex, steps.length - 1);
  const current = steps[safeIndex] ?? steps[0];
  const hasLinearRail = steps.length >= 2 && steps.length <= 6;
  const railInsetPct = hasLinearRail ? 50 / steps.length : 0;

  const toneDotClass =
    current.toneLabel === "Final notice"
      ? "bg-[#E11D48]"
      : current.toneLabel === "Firm"
        ? "bg-[#D97706]"
        : "bg-[#16A34A]";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(current.whatsappMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleWhatsappClick() {
    startTransition(() => {
      logWhatsappNudgeAction(invoiceId, current.offset).catch(() => {});
    });
  }

  const scheduleFootLabel = !active
    ? "Settled — automated reminders stopped"
    : clientEmailSuppressed
      ? "Automated email paused — use WhatsApp or fix email"
      : paused && pausedUntilFormatted
        ? `Paused until ${pausedUntilFormatted}`
        : current.wasSent
          ? `Sent (${current.offsetBadge})`
          : `Auto-sends ${current.scheduledDate} · 09:30 IST`;

  return (
    <div className="overflow-hidden rounded-[18px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(19,19,22,0.03),0_10px_28px_-18px_rgba(19,19,22,0.1)]">
      {/* Connected Horizontal Escalation Timeline */}
      <div className="border-b border-black/[0.06] bg-[#FAFAF8] px-3 py-3.5 sm:px-5">
        <div className="mb-3 flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-[#63636A]">
            Escalation cadence
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-[#131316] tabular-nums">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${toneDotClass}`}
            />
            <span>
              {current.offsetBadge} ·{" "}
              {current.wasSent ? "Sent" : current.toneLabel}
            </span>
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Reminder cadence steps"
          className={cn(
            "relative grid grid-cols-3 gap-y-3",
            steps.length <= 6
              ? "sm:flex sm:items-start sm:justify-between"
              : "sm:grid-cols-6"
          )}
        >
          {/* Connecting rail on sm+ when all steps fit on a single row */}
          {hasLinearRail && (
            <div
              aria-hidden="true"
              style={{
                left: `${railInsetPct}%`,
                right: `${railInsetPct}%`,
              }}
              className="pointer-events-none absolute top-[13px] hidden h-[1.5px] bg-black/[0.09] sm:block"
            />
          )}

          {steps.map((step, index) => {
            const selected = index === safeIndex;
            const stepDot =
              step.toneLabel === "Final notice"
                ? "bg-[#E11D48]"
                : step.toneLabel === "Firm"
                  ? "bg-[#D97706]"
                  : "bg-[#16A34A]";

            return (
              <button
                key={step.offset}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "group relative z-10 flex flex-col items-center gap-1.5 text-center cursor-pointer focus-visible:outline-none",
                  steps.length <= 6 && "sm:flex-1"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 min-w-[38px] items-center justify-center rounded-full border px-2 font-mono text-[10.5px] font-semibold tabular-nums transition-all duration-150 group-focus-visible:ring-2 group-focus-visible:ring-[#131316]",
                    selected
                      ? "border-[#131316] bg-[#131316] text-white shadow-[0_0_0_3px_rgba(19,19,22,0.1)]"
                      : step.wasSent
                        ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D] hover:border-[#86EFAC]"
                        : "border-black/10 bg-white text-[#52525B] hover:border-black/25 hover:text-[#131316]"
                  )}
                >
                  {step.wasSent && !selected ? (
                    <span className="inline-flex items-center gap-0.5">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                      <span>{step.offsetBadge}</span>
                    </span>
                  ) : (
                    step.offsetBadge
                  )}
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-mono text-[10px] tabular-nums transition-colors",
                    selected
                      ? "font-semibold text-[#131316]"
                      : "text-[#71717A] group-hover:text-[#131316]"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${stepDot}`}
                  />
                  <span>{step.shortDate}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Channel Switcher Bar (Email | WhatsApp) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] px-4 py-2.5 sm:px-5">
        <div
          role="tablist"
          aria-label="Message channel"
          className="inline-flex items-center gap-0.5 rounded-[8px] bg-[#F5F5F3] p-[2px]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={channel === "email"}
            onClick={() => setChannel("email")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316]",
              channel === "email"
                ? "bg-white font-semibold text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.08)]"
                : "text-[#63636A] hover:text-[#131316]"
            )}
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Email</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={channel === "whatsapp"}
            onClick={() => setChannel("whatsapp")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316]",
              channel === "whatsapp"
                ? "bg-white font-semibold text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.08)]"
                : "text-[#63636A] hover:text-[#131316]"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span>WhatsApp</span>
            {!isFoundingPass && (
              <Lock className="h-3 w-3 text-[#71717A]" aria-hidden="true" />
            )}
          </button>
        </div>

        <span className="font-mono text-[11px] text-[#71717A] tabular-nums">
          {current.scheduledDate}
        </span>
      </div>

      {/* Channel Preview Body */}
      {channel === "email" ? (
        <>
          <div className="space-y-1 border-b border-black/[0.05] px-4 py-3 font-mono text-[11px] text-[#63636A] sm:px-5">
            <p className="break-words">
              <span className="font-sans font-medium text-[#131316]">From:</span>{" "}
              {fromLabel}
            </p>
            <p className="break-words">
              <span className="font-sans font-medium text-[#131316]">To:</span>{" "}
              {clientEmail}
            </p>
            <p className="break-words">
              <span className="font-sans font-medium text-[#131316]">
                Reply-To:
              </span>{" "}
              {replyTo}
            </p>
            <p className="break-words pt-1 font-sans text-xs font-semibold text-[#131316]">
              {current.subject}
            </p>
          </div>

          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-[1.65] text-[#27272A]">
              {current.text}
            </pre>
          </div>

          {/* Docked Email Actions Footer */}
          <div className="space-y-3 border-t border-black/[0.06] bg-[#FAFAF8] px-4 py-3.5 sm:px-5">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 text-[11.5px] text-[#63636A]">
                {scheduleFootLabel}
                <span className="hidden sm:inline">
                  {" "}
                  · Test goes to{" "}
                  <span className="font-mono text-[#131316]">{userEmail}</span>
                </span>
              </p>
              <SendTestEmailButton
                invoiceId={invoiceId}
                offsetDays={current.offset}
              />
            </div>

            {canSendNow && (
              <SendNowButton
                invoiceId={invoiceId}
                clientEmail={clientEmail}
                offsetLabel={nextOffsetBadge}
                toneLabel={nextToneLabel}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <div className="px-4 py-5 sm:px-5">
            {isFoundingPass ? (
              <div className="space-y-4">
                <p className="text-xs leading-relaxed text-[#63636A]">
                  Opens your own WhatsApp with a prefilled{" "}
                  {current.toneLabel.toLowerCase()} nudge for{" "}
                  <span className="font-medium text-[#131316]">
                    {clientName}
                  </span>{" "}
                  — zero WhatsApp API needed.
                </p>

                <div className="rounded-[12px] border border-black/[0.07] bg-[#F7F7F5] p-4 text-[13px] leading-[1.6] text-[#131316]">
                  {current.whatsappMessage}
                </div>

                {!active ? (
                  <p className="text-xs font-medium text-[#15803D]">
                    Invoice is marked paid — no WhatsApp nudge needed.
                  </p>
                ) : !current.waUrl ? (
                  <p className="text-xs text-[#63636A]">
                    Add a client WhatsApp number in{" "}
                    <strong className="font-medium text-[#131316]">
                      Edit invoice details
                    </strong>{" "}
                    below (e.g.{" "}
                    <span className="font-mono text-[#131316]">
                      919876543210
                    </span>
                    ) to open WhatsApp directly, or copy the message below.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs leading-relaxed text-[#63636A]">
                  Your prewritten WhatsApp nudge for {clientName} is ready —
                  unlock 1-tap WhatsApp nudges and unlimited invoices with the
                  one-time Founding Pass.
                </p>
                <div className="relative overflow-hidden rounded-[12px] border border-black/[0.07] bg-[#F7F7F5] p-4 text-[13px] leading-[1.6] text-[#131316]">
                  <span>{current.whatsappTeaser} </span>
                  {current.whatsappBlurred && (
                    <span
                      aria-hidden="true"
                      className="select-none text-[#63636A] blur-[4px]"
                    >
                      {current.whatsappBlurred}
                    </span>
                  )}
                </div>
                <UpgradeCheckoutButton
                  variant="compact"
                  label="Unlock WhatsApp nudges — $19"
                  className="rounded-[9px]"
                />
              </div>
            )}
          </div>

          {isFoundingPass && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.06] bg-[#FAFAF8] px-4 py-3.5 sm:px-5">
              <span className="font-mono text-[11px] text-[#71717A] tabular-nums">
                Step {current.offsetBadge} · Zero-API wa.me
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-black/10 bg-white px-3 text-xs font-medium text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.04)] transition-colors hover:bg-[#F5F5F3] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316]"
                >
                  {copied ? (
                    <>
                      <Check
                        className="h-3.5 w-3.5 text-[#16A34A]"
                        aria-hidden="true"
                      />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy message</span>
                    </>
                  )}
                </button>

                {active && current.waUrl && (
                  <a
                    href={current.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsappClick}
                    className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#15803D] bg-[#16A34A] px-3 text-xs font-medium text-white shadow-[0_1px_2px_rgba(22,163,74,0.22),inset_0_1px_0_rgba(255,255,255,0.18)] transition-colors hover:bg-[#15803D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316]"
                  >
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Send on WhatsApp</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
