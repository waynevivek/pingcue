"use client";

import { useRef, useState, useTransition, type KeyboardEvent } from "react";
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
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const channelRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (steps.length === 0) return null;

  const safeIndex = Math.min(selectedIndex, steps.length - 1);
  const current = steps[safeIndex] ?? steps[0];

  function handleStepKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % steps.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + steps.length) % steps.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = steps.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      setSelectedIndex(nextIndex);
      stepRefs.current[nextIndex]?.focus();
    }
  }

  function handleChannelKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    const channels: Array<"email" | "whatsapp"> = ["email", "whatsapp"];
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % channels.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + channels.length) % channels.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = channels.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      setChannel(channels[nextIndex]);
      channelRefs.current[nextIndex]?.focus();
    }
  }

  const toneBadge =
    current.toneLabel === "Final notice"
      ? {
          dot: "bg-[#E11D48]",
          pill: "border-[#FECDD3] bg-[#FFF5F6] text-[#9F1239]",
        }
      : current.toneLabel === "Firm"
        ? {
            dot: "bg-[#D97706]",
            pill: "border-[#FDE68A] bg-[#FEFDF0] text-[#713F12]",
          }
        : {
            dot: "bg-[#16A34A]",
            pill: "border-[#BBF7D0] bg-[#F2FDF5] text-[#14532D]",
          };

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
          : `Auto-sends ${current.scheduledDate} · 04:00 UTC`;

  return (
    <div className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.03),0_10px_28px_-20px_rgba(17,17,17,0.12)]">
      {/* Direction B Hairline Horizontal Cadence Stepper with Mint Active Highlight */}
      <div className="border-b border-black/[0.06] bg-[#F8F9F6] px-4 py-3.5 sm:px-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#111111]">
            Escalation cadence
          </span>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] border px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${toneBadge.pill}`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${toneBadge.dot}`}
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
          className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6"
        >
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
                id={`chaser-step-${step.offset}`}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="chaser-step-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setSelectedIndex(index)}
                onKeyDown={(e) => handleStepKeyDown(e, index)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-[9px] border px-2 py-2 text-center transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]",
                  selected
                    ? "border-[#111111]/25 bg-[#C3F584] text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.08)]"
                    : step.wasSent
                      ? "border-[#BBF7D0] bg-[#F2FDF5] text-[#15803D] hover:border-[#86EFAC]"
                      : "border-black/[0.08] bg-white text-[#52525B] hover:border-black/20 hover:text-[#111111]"
                )}
              >
                <span className="inline-flex items-center gap-0.5 whitespace-nowrap font-mono text-[11.5px] font-semibold leading-none tabular-nums">
                  {step.wasSent && !selected && (
                    <Check
                      className="h-3 w-3 shrink-0"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  )}
                  <span>{step.offsetBadge}</span>
                </span>
                <span
                  className={cn(
                    "mt-1.5 inline-flex items-center gap-1 whitespace-nowrap font-mono text-[10px] leading-none tabular-nums",
                    selected
                      ? "font-semibold text-[#1A2E05]"
                      : "text-[#63636A]"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${stepDot}`}
                  />
                  <span>{step.shortDate}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Step Panel */}
      <div
        id="chaser-step-panel"
        role="tabpanel"
        aria-labelledby={`chaser-step-${current.offset}`}
      >
      {/* Channel Switcher Bar (Email | WhatsApp) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] px-4 py-2.5 sm:px-5">
        <div
          role="tablist"
          aria-label="Message channel"
          className="inline-flex items-center gap-0.5 rounded-[9px] border border-black/[0.06] bg-[#F5F6F3] p-[2px]"
        >
          <button
            ref={(el) => {
              channelRefs.current[0] = el;
            }}
            id="chaser-channel-email"
            type="button"
            role="tab"
            aria-selected={channel === "email"}
            aria-controls="chaser-preview-panel"
            tabIndex={channel === "email" ? 0 : -1}
            onClick={() => setChannel("email")}
            onKeyDown={(e) => handleChannelKeyDown(e, 0)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:py-1",
              channel === "email"
                ? "bg-white font-semibold text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.07)]"
                : "text-[#52525B] hover:text-[#111111]"
            )}
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Email</span>
          </button>

          <button
            ref={(el) => {
              channelRefs.current[1] = el;
            }}
            id="chaser-channel-whatsapp"
            type="button"
            role="tab"
            aria-selected={channel === "whatsapp"}
            aria-controls="chaser-preview-panel"
            tabIndex={channel === "whatsapp" ? 0 : -1}
            onClick={() => setChannel("whatsapp")}
            onKeyDown={(e) => handleChannelKeyDown(e, 1)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:py-1",
              channel === "whatsapp"
                ? "bg-white font-semibold text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.07)]"
                : "text-[#52525B] hover:text-[#111111]"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span>WhatsApp</span>
            {!isFoundingPass && (
              <Lock className="h-3 w-3 text-[#63636A]" aria-hidden="true" />
            )}
          </button>
        </div>

        <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-[#63636A] tabular-nums">
          {current.scheduledDate}
        </span>
      </div>

      {/* Channel Preview Body */}
      <div
        id="chaser-preview-panel"
        role="tabpanel"
        aria-labelledby={
          channel === "email"
            ? "chaser-channel-email"
            : "chaser-channel-whatsapp"
        }
      >
      {channel === "email" ? (
        <>
          <div className="border-b border-black/[0.05] px-4 py-3 sm:px-5">
            <dl className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-2 gap-y-1 text-[11px]">
              <dt className="font-sans font-medium text-[#63636A]">From</dt>
              <dd className="min-w-0 break-words font-mono text-[#27272A]">
                {fromLabel}
              </dd>
              <dt className="font-sans font-medium text-[#63636A]">To</dt>
              <dd className="min-w-0 break-words font-mono text-[#27272A]">
                {clientEmail}
              </dd>
              <dt className="font-sans font-medium text-[#63636A]">Reply-To</dt>
              <dd className="min-w-0 break-words font-mono text-[#27272A]">
                {replyTo}
              </dd>
            </dl>
            <p className="mt-2.5 break-words border-t border-black/[0.05] pt-2.5 font-sans text-[13px] font-semibold text-[#111111]">
              {current.subject}
            </p>
          </div>

          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-[1.68] text-[#27272A]">
              {current.text}
            </pre>
          </div>

          {/* Docked Email Actions Footer */}
          <div className="space-y-3 border-t border-black/[0.06] bg-[#F8F9F6] px-4 py-3.5 sm:px-5">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 text-[11.5px] text-[#52525B]">
                {scheduleFootLabel}
                <span className="hidden sm:inline">
                  {" "}
                  · Test goes to{" "}
                  <span className="font-mono text-[#111111]">{userEmail}</span>
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
                <p className="text-xs leading-relaxed text-[#52525B]">
                  Opens your own WhatsApp with a prefilled{" "}
                  {current.toneLabel.toLowerCase()} nudge for{" "}
                  <span className="font-semibold text-[#111111]">
                    {clientName}
                  </span>{" "}
                  — zero WhatsApp API setup required.
                </p>

                <div className="rounded-[12px] border border-black/[0.08] bg-[#F8F9F6] p-4 text-[13px] leading-[1.65] text-[#111111]">
                  {current.whatsappMessage}
                </div>

                {!active ? (
                  <p className="text-xs font-medium text-[#15803D]">
                    Invoice is marked paid — no WhatsApp nudge needed.
                  </p>
                ) : !current.waUrl ? (
                  <p className="text-xs text-[#52525B]">
                    Add a client WhatsApp number in{" "}
                    <strong className="font-semibold text-[#111111]">
                      Edit invoice details
                    </strong>{" "}
                    below (e.g.{" "}
                    <span className="font-mono text-[#111111]">
                      14155550199
                    </span>
                    ) to open WhatsApp directly, or copy the message below.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs leading-relaxed text-[#52525B]">
                  Your prewritten WhatsApp nudge for {clientName} is ready —
                  unlock 1-tap WhatsApp nudges and unlimited invoices with the
                  one-time Founding Pass.
                </p>
                <div className="relative overflow-hidden rounded-[12px] border border-black/[0.08] bg-[#F8F9F6] p-4 text-[13px] leading-[1.65] text-[#111111]">
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
                  className="rounded-[8px]"
                />
              </div>
            )}
          </div>

          {isFoundingPass && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.06] bg-[#F8F9F6] px-4 py-3.5 sm:px-5">
              <span className="whitespace-nowrap font-mono text-[11px] text-[#63636A] tabular-nums">
                Step {current.offsetBadge} · Zero-API wa.me
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-black/[0.1] bg-white px-3 text-xs font-medium text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#F5F6F3] active:bg-[#ECEEE6] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:h-8"
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
                    className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-[#166534] bg-[#15803D] px-3 text-xs font-medium text-white shadow-[0_1px_2px_rgba(21,128,61,0.22)] transition-colors hover:bg-[#166534] active:bg-[#14532D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:h-8"
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
      </div>
    </div>
  );
}
