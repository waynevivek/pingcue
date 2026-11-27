"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export type TemplateTone = "Friendly" | "Firm" | "Final notice" | "Neutral";

export type CopyableTemplateCardProps = {
  id: string;
  title: string;
  offsetLabel: string;
  tone: TemplateTone;
  channel: "email" | "whatsapp";
  subject?: string;
  body: string;
  whenToUse: string;
};

function toneClasses(tone: TemplateTone): string {
  if (tone === "Firm") {
    return "bg-[#FEF08A] text-[#713F12] border-[#FDE047]";
  }
  if (tone === "Final notice") {
    return "bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]";
  }
  if (tone === "Neutral") {
    return "bg-[#DBEAFE] text-[#1E3A8A] border-[#BFDBFE]";
  }
  return "bg-[#DCFCE7] text-[#14532D] border-[#BBF7D0]";
}

export function CopyableTemplateCard({
  id,
  title,
  offsetLabel,
  tone,
  channel,
  subject,
  body,
  whenToUse,
}: CopyableTemplateCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const fullText = subject ? `Subject: ${subject}\n\n${body}` : body;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      trackEvent("template_copy", { template: id, channel, tone });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article
      id={id}
      className="rounded-[24px] border border-black/[0.08] bg-white p-5 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.12)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-[#F4F4F5] px-2.5 py-0.5 font-mono text-[11.5px] font-semibold text-[#111111] tabular-nums">
              {offsetLabel}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold",
                toneClasses(tone)
              )}
            >
              {tone}
            </span>
          </div>
          <h3 className="mt-2.5 font-sans text-[19px] font-semibold leading-snug tracking-[-0.02em] text-[#111111] sm:text-[21px]">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]",
            copied
              ? "border-[#14532D]/20 bg-[#DCFCE7] text-[#14532D]"
              : "border-black/10 bg-[#F4F4F5] text-[#111111] hover:bg-[#EAEAEF]"
          )}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              <span>Copy template</span>
            </>
          )}
        </button>
      </div>

      <p className="mt-2 text-[13.5px] leading-relaxed text-[#52525B]">
        {whenToUse}
      </p>

      <div className="mt-4 rounded-2xl border border-black/[0.07] bg-[#FAFAFA] p-4">
        {subject && (
          <p className="border-b border-black/[0.06] pb-2.5 text-[13.5px] font-semibold text-[#111111]">
            <span className="font-medium text-[#52525B]">Subject: </span>
            {subject}
          </p>
        )}
        <pre
          className={cn(
            "whitespace-pre-wrap break-words font-sans text-[14px] leading-[1.65] text-[#27272A]",
            subject ? "mt-3" : ""
          )}
        >
          {body}
        </pre>
      </div>
    </article>
  );
}
