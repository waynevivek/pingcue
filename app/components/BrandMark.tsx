export function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const tileSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const textSize = size === "sm" ? "text-base" : "text-lg";

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`flex ${tileSize} shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4"
        >
          <rect
            x="3"
            y="4"
            width="14"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6.5 10.25 9 12.75l4.75-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={`font-sans ${textSize} font-semibold text-foreground`}>
        PingCue
      </span>
    </span>
  );
}
