"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Check, Mail, MessageSquare, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./HeroEscalation.module.css";
import { PerchedPingMascot } from "./HeroStickers";

type EscalationTone = "Friendly" | "Firm" | "Final";

type CadenceStep = {
  offset: string;
  dateLabel: string;
  tone: EscalationTone;
  subject: string;
  emailBody: string;
  whatsappBody: string;
};

const CADENCE_STEPS: readonly CadenceStep[] = [
  {
    offset: "-3d",
    dateLabel: "11 Nov",
    tone: "Friendly",
    subject: "Heads up — Northstar Design Retainer due 14 Nov ($1,200 left)",
    emailBody:
      "Hi Maya, quick heads-up that the remaining $1,200 on Northstar Design Retainer is due on 14 Nov. Whenever convenient, you can settle via the payment link below.",
    whatsappBody:
      "Hi Maya, quick heads-up that $1,200 on Northstar Design Retainer is due on 14 Nov. Sharing the link here whenever you're ready: https://pay.northstar.co/inv-104",
  },
  {
    offset: "0d",
    dateLabel: "14 Nov",
    tone: "Friendly",
    subject: "Due today — $1,200 remaining on Northstar Design Retainer",
    emailBody:
      "Hi Maya, hope your week is going well. Just a gentle reminder that the remaining balance of $1,200 is due today. Feel free to reply here if you need anything else.",
    whatsappBody:
      "Hi Maya, friendly reminder that $1,200 on Northstar Design Retainer is due today (14 Nov). Payment link: https://pay.northstar.co/inv-104",
  },
  {
    offset: "+3d",
    dateLabel: "17 Nov",
    tone: "Friendly",
    subject: "Checking in — $1,200 on Northstar Design Retainer (3 days past due)",
    emailBody:
      "Hi Maya, thanks again for the $1,500 received so far. Checking in on the remaining $1,200, which passed due 3 days ago. You can clear it with the link below.",
    whatsappBody:
      "Hi Maya, checking in on the $1,200 remaining for Northstar Design Retainer (due 14 Nov). Here is the payment link again: https://pay.northstar.co/inv-104",
  },
  {
    offset: "+7d",
    dateLabel: "21 Nov",
    tone: "Firm",
    subject: "Quick follow-up — $1,200 remaining (7 days overdue)",
    emailBody:
      "Hi Maya, thanks for the $1,500 received so far. The remaining balance of $1,200 is now 7 days past due. Please settle it using the link below or reply with an update.",
    whatsappBody:
      "Hi Maya, following up on the remaining $1,200 for Northstar Design Retainer (7 days overdue). Could you confirm when this will be settled? https://pay.northstar.co/inv-104",
  },
  {
    offset: "+14d",
    dateLabel: "28 Nov",
    tone: "Firm",
    subject: "Overdue balance — $1,200 past due by 14 days",
    emailBody:
      "Hi Maya, this is a follow-up that $1,200 on Northstar Design Retainer is now 14 days overdue. Please complete payment today or let me know by reply when it is scheduled.",
    whatsappBody:
      "Hi Maya, $1,200 for Northstar Design Retainer is now 14 days overdue. Please settle via https://pay.northstar.co/inv-104 or share the payment date.",
  },
  {
    offset: "+30d",
    dateLabel: "14 Dec",
    tone: "Final",
    subject: "Final notice — $1,200 remaining (30 days overdue)",
    emailBody:
      "Hi Maya, $1,200 for Northstar Design Retainer is now 30 days overdue. This is the final automated reminder—please process the remaining balance via the link below or reply today.",
    whatsappBody:
      "Hi Maya, final reminder that $1,200 on Northstar Design Retainer is 30 days overdue. Please settle at https://pay.northstar.co/inv-104 or reply today.",
  },
];

type EscalationTier = {
  tone: EscalationTone;
  stepNo: string;
  summary: string;
  defaultIndex: number;
  shortOffset: string;
  offsetLabel: string;
  dateLabel: string;
  dotColor: string;
  pillClasses: string;
  animClass: string;
  tiltClass: string;
};

const ESCALATION_TIERS: readonly EscalationTier[] = [
  {
    tone: "Friendly",
    stepNo: "01",
    summary: "Gentle heads-up",
    defaultIndex: 0,
    shortOffset: "-3d",
    offsetLabel: "-3d · 0d · +3d",
    dateLabel: "11 Nov",
    dotColor: "bg-[#8CE668]",
    pillClasses: "bg-[#DCFCE7] text-[#14532D] border-[#BBF7D0]",
    animClass: styles.escalationCard1,
    tiltClass: "sm:-rotate-[0.8deg]",
  },
  {
    tone: "Firm",
    stepNo: "02",
    summary: "Direct follow-up",
    defaultIndex: 3,
    shortOffset: "+7d",
    offsetLabel: "+7d · +14d",
    dateLabel: "21 Nov",
    dotColor: "bg-[#FACC15]",
    pillClasses: "bg-[#FEF08A] text-[#713F12] border-[#FDE047]",
    animClass: styles.escalationCard2,
    tiltClass: "sm:rotate-[0.6deg]",
  },
  {
    tone: "Final",
    stepNo: "03",
    summary: "Final notice",
    defaultIndex: 5,
    shortOffset: "+30d",
    offsetLabel: "+30d",
    dateLabel: "14 Dec",
    dotColor: "bg-[#FB7185]",
    pillClasses: "bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]",
    animClass: styles.escalationCard3,
    tiltClass: "sm:-rotate-[0.4deg]",
  },
];

function tonePillClasses(tone: EscalationTone) {
  if (tone === "Firm") return "bg-[#FEF08A] text-[#713F12] border-[#FDE047]";
  if (tone === "Final") return "bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]";
  return "bg-[#DCFCE7] text-[#14532D] border-[#BBF7D0]";
}

export function EscalationCadenceDemo() {
  const [selectedIndex, setSelectedIndex] = useState(3);
  const [paused, setPaused] = useState(false);
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const channelRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeStep = CADENCE_STEPS[selectedIndex];

  function handleSelectTier(tier: EscalationTier) {
    if (activeStep.tone === tier.tone) return;
    setSelectedIndex(tier.defaultIndex);
  }

  function handleStepKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight")
      nextIndex = (index + 1) % CADENCE_STEPS.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + CADENCE_STEPS.length) % CADENCE_STEPS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = CADENCE_STEPS.length - 1;

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

  return (
    <div className={cn(styles.stageEnter, "relative mx-auto w-full max-w-[1080px]")}>
      {/* Vibrant Framed Illustrated Stage (dusk.bot sky-and-meadow meets stickitupx pastels) */}
      <div className="relative rounded-[28px] border border-black/[0.06] p-3 pt-10 shadow-[0_24px_64px_-24px_rgba(37,99,235,0.22)] sm:p-6 sm:pt-12 lg:p-8 lg:pt-14">
        {/* Crisp Vector Sky, Clouds & Meadow Backdrop (proportional across 1440px and 375px) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] bg-[#84D6FF]"
        >
          {/* Banded sky color blocks */}
          <div className="absolute inset-x-0 top-0 h-[34%] bg-[#5BC2FF]" />
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[#B5E8FF]" />

          {/* Crisp proportional sky clouds anchored at top */}
          <svg
            viewBox="0 0 1200 180"
            preserveAspectRatio="xMidYMin slice"
            className="absolute inset-x-0 top-0 h-[150px] w-full sm:h-[180px]"
            fill="none"
          >
            <g>
              <rect x="64" y="42" width="170" height="34" rx="17" fill="#FFFFFF" />
              <rect x="102" y="24" width="96" height="32" rx="16" fill="#FFFFFF" />
              <rect x="86" y="64" width="132" height="12" rx="6" fill="#FFE0EB" />
            </g>
            <g>
              <rect x="930" y="34" width="196" height="36" rx="18" fill="#FFFFFF" />
              <rect x="974" y="16" width="108" height="34" rx="17" fill="#FFFFFF" />
              <rect x="954" y="58" width="152" height="12" rx="6" fill="#FFE0EB" />
            </g>
            <g opacity="0.95">
              <rect x="520" y="22" width="132" height="24" rx="12" fill="#FFFFFF" />
              <rect x="550" y="12" width="74" height="22" rx="11" fill="#FFFFFF" />
            </g>
          </svg>

          {/* Rolling pastel mint-lime meadow hills anchored at bottom */}
          <svg
            viewBox="0 0 1200 180"
            preserveAspectRatio="xMidYMax slice"
            className="absolute inset-x-0 bottom-0 h-[140px] w-full sm:h-[180px]"
            fill="none"
          >
            <path
              d="M0 44C180 -6 380 4 580 50C790 98 1010 8 1200 36V180H0V44Z"
              fill="#C7F584"
            />
            <path
              d="M0 94C240 58 450 116 730 84C940 60 1090 90 1200 74V180H0V94Z"
              fill="#A8EC62"
            />
            <circle cx="96" cy="126" r="5" fill="#FFE875" />
            <circle cx="142" cy="142" r="4" fill="#FFFFFF" />
            <circle cx="1064" cy="122" r="5" fill="#FFE875" />
            <circle cx="1110" cy="138" r="4" fill="#FF9AA2" />
            <circle cx="348" cy="148" r="4.5" fill="#FFFFFF" />
            <circle cx="884" cy="144" r="4.5" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Interactive macOS App Window */}
        <div className="relative z-10">
          {/* Perched PingCue Buddy gripping top-left of window (snoozes when Pause is clicked!) */}
          <PerchedPingMascot
            sleeping={paused}
            className="absolute -top-[42px] left-5 z-20 h-[56px] w-[88px] sm:-top-[48px] sm:left-8 sm:h-[64px] sm:w-[100px]"
          />

          <div className="overflow-hidden rounded-[22px] border border-black/[0.08] bg-[#FFFFFF] shadow-[0_24px_60px_-14px_rgba(15,23,42,0.22)]">
            {/* macOS Window Chrome */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] bg-[#FAFAFA] px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B6B]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FFD166]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4ADE80]" />
                </div>
                <span className="text-[12px] font-medium text-[#63636A]">
                  Sample invoice · Synthetic demo
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden text-[12px] font-medium text-[#63636A] sm:inline">
                  a live demo. click around.
                </span>
              </div>
            </div>

            {/* Pastel Bento Workspace */}
            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-12">
              {/* Left Column: Invoice Balance Bento + Fanned Escalation Stack */}
              <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
                {/* Butter-Yellow Pastel Invoice Card */}
                <div className="rounded-[20px] border border-black/[0.06] bg-[#FFF1A8] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold tracking-[-0.02em] text-[#111111]">
                        Northstar Design Retainer
                      </p>
                      <p className="mt-0.5 text-[12px] leading-snug text-[#574C1B]">
                        maya@northstar.co · Due 14 Nov · Reply-To: you@studio.com
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/[0.08] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22C55E]"
                        />
                        Partial
                      </span>
                      {paused && (
                        <span className="inline-flex items-center whitespace-nowrap rounded-full border border-black/10 bg-[#111111] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          Paused until 28 Nov
                        </span>
                      )}
                    </div>
                  </div>

                  {/* USD Amount Hero */}
                  <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[28px] font-bold leading-none tracking-[-0.035em] text-[#111111] tabular-nums">
                      $1,200{" "}
                      <span className="text-[13px] font-medium tracking-normal text-[#574C1B]">
                        left
                      </span>
                    </p>
                    <p className="text-[12px] font-medium text-[#574C1B] tabular-nums">
                      $1,500 of $2,700 USD received
                    </p>
                  </div>

                  {/* Settlement Progress Track */}
                  <div className="mt-4 space-y-2">
                    <div
                      aria-hidden="true"
                      className="h-2 w-full overflow-hidden rounded-full bg-white/80 p-0.5"
                    >
                      <div className="h-full w-[55.6%] rounded-full bg-[#111111]" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] font-medium text-[#574C1B] tabular-nums">
                      <span>55.6% paid</span>
                      <span>Chasing remaining $1,200</span>
                    </div>
                  </div>
                </div>

                {/* Periwinkle Pastel Escalation Stack (Friendly -> Firm -> Final) */}
                <div className="relative rounded-[20px] border border-black/[0.06] bg-[#D9E6FF] p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#1E293B]">
                      Escalation stack
                    </span>
                    <span className="text-[11px] font-medium text-[#3B5284]">
                      Friendly → Firm → Final
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {ESCALATION_TIERS.map((tier) => {
                      const isActive = activeStep.tone === tier.tone;
                      const displayedOffsetDesktop = isActive
                        ? activeStep.offset
                        : tier.offsetLabel;
                      const displayedOffsetMobile = isActive
                        ? activeStep.offset
                        : tier.shortOffset;
                      const displayedDate = isActive
                        ? activeStep.dateLabel
                        : tier.dateLabel;

                      return (
                        <button
                          key={tier.tone}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => handleSelectTier(tier)}
                          className={cn(
                            styles.escalationCard,
                            tier.animClass,
                            tier.tiltClass,
                            "group flex w-full items-center justify-between gap-2.5 rounded-2xl border bg-white px-3 py-2.5 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:rotate-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:gap-3 sm:px-3.5",
                            isActive
                              ? "border-[#111111] shadow-[0_8px_20px_-6px_rgba(17,24,39,0.2)] sm:rotate-0 sm:scale-[1.015]"
                              : "border-black/[0.06] opacity-90 shadow-[0_4px_12px_-4px_rgba(15,23,42,0.08)] hover:opacity-100"
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              aria-hidden="true"
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-black/10 text-[11px] font-bold text-[#111111] tabular-nums",
                                tier.dotColor
                              )}
                            >
                              {tier.stepNo}
                            </span>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold leading-tight text-[#111111]">
                                {tier.tone}
                              </p>
                              <p className="truncate text-[11px] text-[#52525B]">
                                {tier.summary}
                              </p>
                            </div>
                          </div>

                          <span
                            className={cn(
                              "shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums sm:px-2.5",
                              isActive
                                ? "border-[#111111] bg-[#111111] text-white"
                                : tier.pillClasses
                            )}
                          >
                            <span className="sm:hidden">
                              {displayedOffsetMobile} · {displayedDate}
                            </span>
                            <span className="hidden sm:inline">
                              {displayedOffsetDesktop} · {displayedDate}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Mint Keycap Cadence + Live Dispatch Card */}
              <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
                {/* Mint-Lime Tactile Keycap Timeline Bento */}
                <div className="rounded-[20px] border border-black/[0.06] bg-[#D6F7A3] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                    <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#111111]">
                      Escalation timeline
                    </span>
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-white/85 px-2.5 py-0.5 font-semibold text-[#1A2E05] tabular-nums">
                      {paused
                        ? "Paused through 28 Nov"
                        : `Step ${activeStep.offset} · ${activeStep.tone}`}
                    </span>
                  </div>

                  <div
                    role="tablist"
                    aria-label="Reminder cadence steps"
                    className="mt-3.5 grid grid-cols-3 gap-2 sm:grid-cols-6"
                  >
                    {CADENCE_STEPS.map((step, index) => {
                      const selected = index === selectedIndex;
                      const sent = index < 3;
                      return (
                        <button
                          key={step.offset}
                          ref={(el) => {
                            stepRefs.current[index] = el;
                          }}
                          id={`demo-step-${index}`}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          aria-controls="demo-dispatch-panel"
                          tabIndex={selected ? 0 : -1}
                          onClick={() => setSelectedIndex(index)}
                          onKeyDown={(e) => handleStepKeyDown(e, index)}
                          className={cn(
                            "flex flex-col items-center justify-center rounded-xl border px-1.5 py-2.5 text-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] active:translate-y-[2px] active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0",
                            selected
                              ? "border-[#111111] bg-[#111111] text-white shadow-[0_3px_0_rgba(17,17,17,0.3)] -translate-y-0.5 motion-reduce:translate-y-0"
                              : sent
                                ? "border-black/10 bg-white/90 text-[#52525B] shadow-[0_3px_0_rgba(17,17,17,0.09)] hover:-translate-y-0.5 hover:bg-white hover:text-[#111111]"
                                : "border-black/10 bg-white text-[#111111] shadow-[0_3px_0_rgba(17,17,17,0.12)] hover:-translate-y-0.5"
                          )}
                        >
                          <div className="inline-flex items-center gap-0.5 whitespace-nowrap text-[12px] font-bold tabular-nums leading-none">
                            {sent && !selected && (
                              <Check
                                className="h-3 w-3 shrink-0 text-[#15803D]"
                                strokeWidth={2.5}
                                aria-hidden="true"
                              />
                            )}
                            <span>{step.offset}</span>
                          </div>
                          <div
                            className={cn(
                              "mt-1 whitespace-nowrap text-[11px] font-medium leading-none",
                              selected ? "text-white/90" : "text-[#63636A]"
                            )}
                          >
                            {sent && !selected ? "Sent" : step.tone}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Dispatch Preview + Tactile Controls */}
                <div
                  id="demo-dispatch-panel"
                  role="tabpanel"
                  aria-labelledby={`demo-step-${selectedIndex}`}
                  className="flex flex-1 flex-col justify-between rounded-[20px] border border-black/[0.07] bg-[#FAFAFA] p-4 sm:p-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3 text-[12px]">
                      <span className="min-w-0 max-w-full truncate font-medium text-[#52525B]">
                        {channel === "email"
                          ? "To: maya@northstar.co · Reply-To: you@studio.com"
                          : "WhatsApp wa.me · Prefilled nudge"}
                      </span>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tabular-nums",
                          tonePillClasses(activeStep.tone)
                        )}
                      >
                        {activeStep.tone} · {activeStep.dateLabel}
                      </span>
                    </div>

                    <div
                      id="demo-channel-panel"
                      role="tabpanel"
                      aria-labelledby={
                        channel === "email"
                          ? "demo-channel-email"
                          : "demo-channel-whatsapp"
                      }
                      className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
                    >
                      {channel === "email" && (
                        <p className="text-[13.5px] font-semibold tracking-[-0.01em] text-[#111111]">
                          Subject: {activeStep.subject}
                        </p>
                      )}

                      <p
                        className={cn(
                          "text-[13.5px] leading-[1.6] text-[#3F3F46]",
                          channel === "email" ? "mt-2" : ""
                        )}
                      >
                        {channel === "email"
                          ? activeStep.emailBody
                          : activeStep.whatsappBody}
                      </p>
                    </div>

                    {paused && (
                      <p className="mt-3 rounded-xl border border-[#FDE047] bg-[#FEF9C3] px-3.5 py-2.5 text-[12px] font-medium text-[#713F12]">
                        Automated emails are paused through 28 Nov. Click Resume
                        below when you want the cadence to continue.
                      </p>
                    )}
                  </div>

                  {/* Bottom Tactile Control Strip */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4 text-[12px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        aria-pressed={paused}
                        onClick={() => setPaused((prev) => !prev)}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0",
                          paused
                            ? "border-[#111111] bg-[#FFE875] text-[#111111] shadow-[0_2px_0_rgba(17,17,17,0.18)]"
                            : "border-black/10 bg-white text-[#111111] shadow-[0_2px_0_rgba(17,17,17,0.08)] hover:bg-[#F4F4F5]"
                        )}
                      >
                        {paused ? (
                          <>
                            <Play
                              className="h-3.5 w-3.5"
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                            <span>Resume</span>
                          </>
                        ) : (
                          <>
                            <Pause
                              className="h-3.5 w-3.5 text-[#52525B]"
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                            <span>Pause</span>
                          </>
                        )}
                      </button>

                      <div
                        role="tablist"
                        aria-label="Preview message channel"
                        className="inline-flex rounded-full border border-black/[0.08] bg-[#EFEFF1] p-0.5"
                      >
                        <button
                          id="demo-channel-email"
                          ref={(el) => {
                            channelRefs.current[0] = el;
                          }}
                          type="button"
                          role="tab"
                          aria-selected={channel === "email"}
                          aria-controls="demo-channel-panel"
                          tabIndex={channel === "email" ? 0 : -1}
                          onClick={() => setChannel("email")}
                          onKeyDown={(e) => handleChannelKeyDown(e, 0)}
                          className={cn(
                            "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] cursor-pointer",
                            channel === "email"
                              ? "bg-[#111111] text-white"
                              : "text-[#52525B] hover:text-[#111111]"
                          )}
                        >
                          <Mail
                            className="h-3.5 w-3.5"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                          <span>Email</span>
                        </button>

                        <button
                          id="demo-channel-whatsapp"
                          ref={(el) => {
                            channelRefs.current[1] = el;
                          }}
                          type="button"
                          role="tab"
                          aria-selected={channel === "whatsapp"}
                          aria-controls="demo-channel-panel"
                          tabIndex={channel === "whatsapp" ? 0 : -1}
                          onClick={() => setChannel("whatsapp")}
                          onKeyDown={(e) => handleChannelKeyDown(e, 1)}
                          className={cn(
                            "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] cursor-pointer",
                            channel === "whatsapp"
                              ? "bg-[#111111] text-white"
                              : "text-[#52525B] hover:text-[#111111]"
                          )}
                        >
                          <MessageSquare
                            className="h-3.5 w-3.5"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>

                    <span className="shrink-0 whitespace-nowrap font-medium text-[#63636A] tabular-nums">
                      Daily dispatch · 04:00 UTC
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
