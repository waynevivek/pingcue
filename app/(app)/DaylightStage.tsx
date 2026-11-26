import type { ReactNode } from "react";
import { PerchedPingMascot } from "@/app/components/HeroStickers";
import { cn } from "@/lib/utils";

export function DaylightStage({
  children,
  mascot = false,
  sleeping = false,
  className,
}: {
  children: ReactNode;
  mascot?: boolean;
  sleeping?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[28px] border border-black/[0.06] p-2.5 shadow-[0_20px_54px_-24px_rgba(37,99,235,0.22)] sm:p-4",
        mascot ? "pt-10 sm:pt-12" : "p-2.5 sm:p-4",
        className
      )}
    >
      {/* Signature PingCue Vector Sky, Pill Clouds & Mint-Lime Meadow Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] bg-[#84D6FF]"
      >
        <div className="absolute inset-x-0 top-0 h-[36%] bg-[#5BC2FF]" />
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-[#B5E8FF]" />

        <svg
          viewBox="0 0 1000 140"
          preserveAspectRatio="xMidYMin slice"
          className="absolute inset-x-0 top-0 h-[110px] w-full sm:h-[130px]"
          fill="none"
        >
          <rect x="36" y="26" width="132" height="26" rx="13" fill="#FFFFFF" />
          <rect x="64" y="14" width="74" height="24" rx="12" fill="#FFFFFF" />
          <rect x="52" y="44" width="100" height="8" rx="4" fill="#FFE0EB" />

          <rect x="760" y="20" width="160" height="28" rx="14" fill="#FFFFFF" />
          <rect x="794" y="8" width="90" height="26" rx="13" fill="#FFFFFF" />
          <rect x="780" y="40" width="120" height="9" rx="4.5" fill="#FFE0EB" />
        </svg>

        <svg
          viewBox="0 0 1000 140"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-x-0 bottom-0 h-[110px] w-full sm:h-[130px]"
          fill="none"
        >
          <path
            d="M0 44C180 2 350 48 560 28C740 12 880 22 1000 36V140H0V44Z"
            fill="#C7F584"
          />
          <path
            d="M0 80C220 48 440 102 720 74C860 60 940 72 1000 66V140H0V80Z"
            fill="#A8EC62"
          />
          <circle cx="84" cy="108" r="4.5" fill="#FFE875" />
          <circle cx="912" cy="104" r="4.5" fill="#FFFFFF" />
          <circle cx="480" cy="116" r="4" fill="#FF9AA2" />
        </svg>
      </div>

      <div className="relative z-10">
        {mascot && (
          <PerchedPingMascot
            sleeping={sleeping}
            className="absolute -top-[42px] left-4 z-20 h-[52px] w-[82px] sm:-top-[46px] sm:left-6 sm:h-[58px] sm:w-[92px]"
          />
        )}
        {children}
      </div>
    </div>
  );
}
