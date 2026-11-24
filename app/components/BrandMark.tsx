import { cn } from "@/lib/utils";

export function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const tileSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const textSize =
    size === "sm" ? "text-[15px] sm:text-[16px]" : "text-[17px]";

  return (
    <span className="group inline-flex items-center gap-2">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[8px] bg-[#C3F584] text-[#111111] transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105",
          tileSize
        )}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4"
        >
          <rect
            x="3"
            y="4.5"
            width="14"
            height="11"
            rx="2.5"
            stroke="#111111"
            strokeWidth="1.8"
          />
          <path
            d="M4.5 6.8L10 10.8L15.5 6.8"
            stroke="#111111"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          "font-sans font-semibold tracking-[-0.03em] text-[#111111]",
          textSize
        )}
      >
        PingCue
      </span>
    </span>
  );
}
