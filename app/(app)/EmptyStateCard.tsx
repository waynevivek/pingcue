import Link from "next/link";
import { ArrowRight, Plus, RotateCcw } from "lucide-react";
import {
  ChimeBellSticker,
  PaperPlaneSticker,
  PerchedPingMascot,
} from "@/app/components/HeroStickers";

const ONBOARDING_STEPS = [
  {
    step: "1",
    title: "Log an invoice once",
    body: "Add client email, amount, due date, and your payment link.",
  },
  {
    step: "2",
    title: "Preview & test",
    body: "Inspect every -3d to +30d message or send a test straight to your inbox.",
  },
  {
    step: "3",
    title: "Autopilot follows up",
    body: "Polite emails run daily at 04:00 UTC and stop the moment you mark paid.",
  },
] as const;

export function FirstInvoiceEmptyState() {
  return (
    <section
      aria-label="Get started"
      className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.03),0_10px_28px_-20px_rgba(17,17,17,0.12)]"
    >
      <div className="flex flex-col items-center px-5 pb-6 pt-8 text-center sm:px-8 sm:pt-10">
        <div className="mb-4 inline-flex items-center justify-center rounded-[18px] border border-[#BFE883] bg-[#F4FCE6] px-4 pb-1 pt-2.5">
          <PerchedPingMascot sleeping={false} className="h-[52px] w-[82px]" />
        </div>

        <h2 className="font-sans text-[19px] font-semibold tracking-[-0.025em] text-[#111111] sm:text-[21px]">
          Add your first unpaid invoice
        </h2>
        <p className="mx-auto mt-1.5 max-w-[48ch] text-balance text-[13.5px] leading-relaxed text-[#52525B]">
          Paste your client&apos;s email, due date, and payment link once.
          PingCue handles polite-to-firm reminders automatically and stops as
          soon as it&apos;s settled.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            href="/invoices/new"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[9px] border border-[#111111] bg-[#111111] px-4 text-xs font-medium text-white shadow-[0_1px_2px_rgba(17,17,17,0.16)] transition-colors hover:bg-[#262626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
            <span>Create your first invoice</span>
          </Link>
          <Link
            href="/settings"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[9px] border border-black/[0.1] bg-white px-3.5 text-xs font-medium text-[#111111] transition-colors hover:bg-[#F5F6F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
          >
            <span>Set sender name</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#63636A]" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* 3-Step Micro Workflow Guide */}
      <ol className="grid divide-y divide-black/[0.06] border-t border-black/[0.06] bg-[#F8F9F6] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {ONBOARDING_STEPS.map((item) => (
          <li key={item.step} className="px-5 py-4 text-left">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border border-black/[0.08] bg-white font-mono text-[10.5px] font-semibold text-[#111111] tabular-nums">
                {item.step}
              </span>
              <span className="text-xs font-semibold text-[#111111]">
                {item.title}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-[#52525B]">
              {item.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function FilteredEmptyState({
  title,
  description,
  resetHref,
  resetLabel = "Show all invoices",
}: {
  title: string;
  description: string;
  resetHref: string;
  resetLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-12 text-center">
      <PaperPlaneSticker className="mb-3 h-12 w-14 -rotate-[6deg]" />
      <p className="text-[14px] font-semibold tracking-[-0.015em] text-[#111111]">
        {title}
      </p>
      <p className="mt-1 max-w-sm text-balance text-xs leading-relaxed text-[#52525B]">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Link
          href={resetHref}
          className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-black/[0.1] bg-white px-3 text-xs font-medium text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#F5F6F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:h-8"
        >
          <RotateCcw className="h-3 w-3 text-[#63636A]" aria-hidden="true" />
          <span>{resetLabel}</span>
        </Link>
        <Link
          href="/invoices/new"
          className="inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-[8px] border border-[#111111] bg-[#111111] px-3 text-xs font-medium text-white transition-colors hover:bg-[#262626] active:bg-[#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:h-8"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          <span>New invoice</span>
        </Link>
      </div>
    </div>
  );
}

export function ActivityEmptyState() {
  return (
    <div className="mt-3 flex flex-col items-center rounded-[12px] border border-dashed border-black/[0.12] bg-[#F8F9F6] px-4 py-6 text-center">
      <ChimeBellSticker className="mb-2.5 h-11 w-11 -rotate-[6deg]" />
      <p className="text-xs font-semibold text-[#111111]">
        No dispatches sent yet
      </p>
      <p className="mt-1 max-w-[30ch] text-balance text-[11.5px] leading-relaxed text-[#52525B]">
        Automated pings go out daily at 04:00 UTC. Use{" "}
        <strong className="font-semibold text-[#111111]">
          Send test to me
        </strong>{" "}
        to preview an email in your inbox first.
      </p>
    </div>
  );
}
