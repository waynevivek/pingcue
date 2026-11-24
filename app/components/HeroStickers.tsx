"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type StickerProps = {
  className?: string;
};

/**
 * Clean, borderless app-tile brand mark inspired by stickitupx.com & dusk.bot:
 * flat mint-lime rounded square with minimal crisp glyph and zero heavy outline.
 */
export function PlayfulBrandMark({ size = "sm" }: { size?: "sm" | "md" }) {
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

/**
 * Interactive die-cut wrapper that gives hero perimeter stickers a physical
 * vinyl feel (subtle lift + playful micro-tilt on hover, crisp spring pop on click).
 */
export function InteractiveSticker({
  children,
  className,
  tiltClass,
}: {
  children: React.ReactNode;
  className?: string;
  tiltClass: string;
}) {
  const [popped, setPopped] = useState(false);

  function handlePop() {
    setPopped(true);
    window.setTimeout(() => setPopped(false), 320);
  }

  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={handlePop}
      className={cn(
        "select-none cursor-pointer bg-transparent p-0 border-0 outline-none transition-transform duration-200 ease-out hover:scale-110 active:scale-95",
        tiltClass,
        popped && "scale-115 -translate-y-1.5",
        className
      )}
    >
      {children}
    </button>
  );
}

/** Inline H1 sticker: friendly sky-blue envelope character with crisp white die-cut edge */
export function InlineEnvelopeSticker({ className }: StickerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 56"
      fill="none"
      className={cn(
        "inline-block align-[-0.14em] drop-shadow-[0_4px_10px_rgba(17,17,17,0.14)]",
        className
      )}
    >
      {/* Thick white vinyl die-cut silhouette */}
      <rect
        x="4"
        y="6"
        width="56"
        height="44"
        rx="14"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="6"
      />
      {/* Main body */}
      <rect
        x="8"
        y="10"
        width="48"
        height="36"
        rx="10"
        fill="#8EC5FF"
        stroke="#18181B"
        strokeWidth="2.4"
      />
      {/* Envelope flap */}
      <path
        d="M10 13.5L32 29L54 13.5"
        fill="#BFE0FF"
        stroke="#18181B"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cute glossy eyes */}
      <circle cx="24" cy="31" r="2.7" fill="#18181B" />
      <circle cx="40" cy="31" r="2.7" fill="#18181B" />
      <circle cx="23.2" cy="30.1" r="0.9" fill="#FFFFFF" />
      <circle cx="39.2" cy="30.1" r="0.9" fill="#FFFFFF" />
      {/* Rosy cheeks */}
      <ellipse cx="18.5" cy="34.5" rx="3" ry="1.8" fill="#FF8FA3" opacity="0.85" />
      <ellipse cx="45.5" cy="34.5" rx="3" ry="1.8" fill="#FF8FA3" opacity="0.85" />
      {/* Happy tiny smile */}
      <path
        d="M29.2 34.8C30.4 36.4 33.6 36.4 34.8 34.8"
        stroke="#18181B"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Inline H1 sticker: scalloped mint-lime PAID checkmark badge */
export function InlinePaidBadgeSticker({ className }: StickerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 60"
      fill="none"
      className={cn(
        "inline-block align-[-0.14em] drop-shadow-[0_4px_10px_rgba(17,17,17,0.14)]",
        className
      )}
    >
      <path
        d="M30 4L36.2 8.8L44 8.2L47.1 15.4L53.8 19.3L52.6 27L56 34L50.8 39.8L50.8 47.6L43.4 50.1L39 56.5L31.4 54.6L24.2 57.5L18.8 51.9L11.1 51.3L9.1 43.8L3.2 38.8L5.6 31.4L3.2 24L9.1 19L11.1 11.5L18.8 10.9L24.2 5.3L30 4Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M30 8.5L35.2 12.6L41.8 12.1L44.4 18.2L50.1 21.5L49.1 28L52 33.9L47.6 38.8L47.6 45.4L41.3 47.5L37.6 52.9L31.2 51.3L25.1 53.8L20.5 49L14 48.5L12.3 42.2L7.3 37.9L9.3 31.6L7.3 25.4L12.3 21.1L14 14.8L20.5 14.3L25.1 9.5L30 8.5Z"
        fill="#C3F584"
        stroke="#18181B"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <path
        d="M21 31.5L27.2 37.5L39.5 24.5"
        stroke="#18181B"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Floating sticker: butter-yellow polite nudge bell */
export function ChimeBellSticker({ className }: StickerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 84 84"
      fill="none"
      className={cn(
        "drop-shadow-[0_10px_18px_rgba(17,17,17,0.14)]",
        className
      )}
    >
      {/* White vinyl border */}
      <circle cx="42" cy="42" r="34" fill="#FFFFFF" />
      <circle
        cx="42"
        cy="42"
        r="29"
        fill="#FFE875"
        stroke="#18181B"
        strokeWidth="2.4"
      />
      {/* Ringing arcs */}
      <path
        d="M19 30C16.5 34.5 16.5 40 19 44.5"
        stroke="#18181B"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M65 30C67.5 34.5 67.5 40 65 44.5"
        stroke="#18181B"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Bell dome */}
      <path
        d="M42 23C34.2 23 29 29.1 29 37V44.5L25.5 49.5H58.5L55 44.5V37C55 29.1 49.8 23 42 23Z"
        fill="#FFFFFF"
        stroke="#18181B"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Clapper */}
      <path
        d="M37.5 50C38 53 40 55 42 55C44 55 46 53 46.5 50"
        fill="#FF8B94"
        stroke="#18181B"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Cute face on bell */}
      <circle cx="37.5" cy="38" r="1.9" fill="#18181B" />
      <circle cx="46.5" cy="38" r="1.9" fill="#18181B" />
      <path
        d="M40 41.5C41 42.8 43 42.8 44 41.5"
        stroke="#18181B"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Floating sticker: serrated coral-pink PAID postage stamp */
export function PaidStampSticker({ className }: StickerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 92 76"
      fill="none"
      className={cn(
        "drop-shadow-[0_10px_18px_rgba(17,17,17,0.14)]",
        className
      )}
    >
      {/* Die-cut outer white card */}
      <rect
        x="4"
        y="4"
        width="84"
        height="68"
        rx="12"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="4"
      />
      {/* Coral stamp face */}
      <rect
        x="10"
        y="10"
        width="72"
        height="56"
        rx="7"
        fill="#FF7D85"
        stroke="#18181B"
        strokeWidth="2.4"
      />
      {/* Inner cream ticket frame */}
      <rect
        x="15"
        y="15"
        width="62"
        height="46"
        rx="4"
        fill="#FFF5F5"
        stroke="#18181B"
        strokeWidth="1.8"
        strokeDasharray="3 3"
      />
      {/* Mini checkmark seal */}
      <circle cx="29" cy="38" r="9" fill="#C3F584" stroke="#18181B" strokeWidth="2" />
      <path
        d="M25.5 38.2L28 40.7L33 35.3"
        stroke="#18181B"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* PAID bold letters */}
      <text
        x="43"
        y="42.5"
        fill="#18181B"
        fontSize="13.5"
        fontWeight="800"
        letterSpacing="0.04em"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        PAID
      </text>
      <path
        d="M44 27H68"
        stroke="#FF7D85"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M44 49H64"
        stroke="#FF7D85"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Floating sticker: electric periwinkle star buddy with cheeky eyes */
export function StarBuddySticker({ className }: StickerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 88 88"
      fill="none"
      className={cn(
        "drop-shadow-[0_10px_18px_rgba(17,17,17,0.15)]",
        className
      )}
    >
      {/* White die-cut halo */}
      <path
        d="M44 6L54.4 27.6L78 30.8L60.8 47.4L65 71L44 59.6L23 71L27.2 47.4L10 30.8L33.6 27.6L44 6Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="12"
        strokeLinejoin="round"
      />
      {/* Periwinkle fill */}
      <path
        d="M44 10L53.6 29.8L75.4 32.8L59.5 48.1L63.4 69.8L44 59.3L24.6 69.8L28.5 48.1L12.6 32.8L34.4 29.8L44 10Z"
        fill="#6366F1"
        stroke="#18181B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Expressive white cartoon eyes */}
      <ellipse cx="37.5" cy="41.5" rx="4.2" ry="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.8" />
      <ellipse cx="49.5" cy="41.5" rx="4.2" ry="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.8" />
      <circle cx="38.8" cy="42.2" r="2" fill="#18181B" />
      <circle cx="50.8" cy="42.2" r="2" fill="#18181B" />
      {/* Confident grin */}
      <path
        d="M39.5 50.5C41.5 53 46.5 53 48.5 50.5"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Floating sticker: crisp mint-lime rupee coin */
export function RupeeCoinSticker({ className }: StickerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 76 76"
      fill="none"
      className={cn(
        "drop-shadow-[0_10px_18px_rgba(17,17,17,0.14)]",
        className
      )}
    >
      <circle cx="38" cy="38" r="32" fill="#FFFFFF" />
      <circle
        cx="38"
        cy="38"
        r="26.5"
        fill="#C8F392"
        stroke="#18181B"
        strokeWidth="2.4"
      />
      <circle
        cx="38"
        cy="38"
        r="20.5"
        fill="#E4FABF"
        stroke="#18181B"
        strokeWidth="1.6"
        strokeDasharray="3.5 3.5"
      />
      {/* Crisp ₹ glyph */}
      <path
        d="M31 28H46M31 34H46M34 28C39.5 28 42 30.8 42 34C42 37.8 39 40.5 33.5 40.5H31.5L42.5 50"
        stroke="#18181B"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Floating sticker: golden sparkle trio */
export function SparkleSticker({ className }: StickerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 84 80"
      fill="none"
      className={cn(
        "drop-shadow-[0_10px_18px_rgba(17,17,17,0.13)]",
        className
      )}
    >
      {/* Big sparkle white halo */}
      <path
        d="M36 10C38 25 43 30 58 32C43 34 38 39 36 54C34 39 29 34 14 32C29 30 34 25 36 10Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      {/* Small sparkle white halo */}
      <path
        d="M61 44C62.2 52 65 54.8 73 56C65 57.2 62.2 60 61 68C59.8 60 57 57.2 49 56C57 54.8 59.8 52 61 44Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      {/* Big butter-gold sparkle */}
      <path
        d="M36 13C38 26 42.2 30.2 55 32C42.2 33.8 38 38 36 51C34 38 29.8 33.8 17 32C29.8 30.2 34 26 36 13Z"
        fill="#FFD84D"
        stroke="#18181B"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Small sparkle */}
      <path
        d="M61 46.5C62.1 53 64.5 55 71 56C64.5 57 62.1 59 61 65.5C59.9 59 57.5 57 51 56C57.5 55 59.9 53 61 46.5Z"
        fill="#FFE875"
        stroke="#18181B"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Floating sticker: crisp paper-plane chat nudge */
export function PaperPlaneSticker({ className }: StickerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 86 76"
      fill="none"
      className={cn(
        "drop-shadow-[0_10px_18px_rgba(17,17,17,0.14)]",
        className
      )}
    >
      <path
        d="M12 36L72 14L55 62L38 45L12 36Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="12"
        strokeLinejoin="round"
      />
      <path
        d="M15 36L70 16L54.5 60L39 44.5L15 36Z"
        fill="#93C5FD"
        stroke="#18181B"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M70 16L39 44.5L41 56L48 48.5"
        fill="#DBEAFE"
        stroke="#18181B"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Perched PingCue Mascot sitting right on the top edge of the live demo window
 * (inspired by dusk.bot's perched cat!). Falls asleep with floating z-z-z when
 * the user clicks Pause in the demo!
 */
export function PerchedPingMascot({
  sleeping,
  className,
}: {
  sleeping: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <svg
        viewBox="0 0 112 72"
        fill="none"
        className="h-full w-full drop-shadow-[0_6px_12px_rgba(17,17,17,0.14)]"
      >
        {/* Floating z z z when paused */}
        {sleeping && (
          <g className="animate-pulse">
            <text
              x="76"
              y="22"
              fill="#18181B"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              paintOrder="stroke"
              strokeLinejoin="round"
              fontSize="12"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
            >
              z
            </text>
            <text
              x="86"
              y="14"
              fill="#18181B"
              stroke="#FFFFFF"
              strokeWidth="3"
              paintOrder="stroke"
              strokeLinejoin="round"
              fontSize="10"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
            >
              z
            </text>
            <text
              x="95"
              y="8"
              fill="#52525B"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              paintOrder="stroke"
              strokeLinejoin="round"
              fontSize="8.5"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
            >
              z
            </text>
          </g>
        )}

        {/* White vinyl sticker outline around cute rounded buddy */}
        <path
          d="M24 27L31 15L42 23H58L69 15L76 27C81 32 82 40 82 48V61H18V48C18 40 19 32 24 27Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinejoin="round"
        />

        {/* Little cat-ear envelope buddy body */}
        <path
          d="M25 28L31.5 17.5L41.5 24.5H58.5L68.5 17.5L75 28C79.5 32.5 80 40 80 48V59H20V48C20 40 20.5 32.5 25 28Z"
          fill={sleeping ? "#FFE875" : "#C8F392"}
          stroke="#18181B"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* Inner ear blush */}
        <path d="M31.5 22L36 25.5H28.5L31.5 22Z" fill="#FF9AA2" />
        <path d="M68.5 22L71.5 25.5H64L68.5 22Z" fill="#FF9AA2" />

        {/* Cute eyes: awake vs peaceful snoozing */}
        {sleeping ? (
          <>
            <path
              d="M34 41C35.8 43.8 40.2 43.8 42 41"
              stroke="#18181B"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
            <path
              d="M58 41C59.8 43.8 64.2 43.8 66 41"
              stroke="#18181B"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx="38" cy="40.5" r="3.2" fill="#18181B" />
            <circle cx="62" cy="40.5" r="3.2" fill="#18181B" />
            <circle cx="37" cy="39.4" r="1.1" fill="#FFFFFF" />
            <circle cx="61" cy="39.4" r="1.1" fill="#FFFFFF" />
          </>
        )}

        {/* Rosy cheeks */}
        <ellipse cx="31" cy="45.5" rx="3.8" ry="2.2" fill="#FF8FA3" opacity="0.75" />
        <ellipse cx="69" cy="45.5" rx="3.8" ry="2.2" fill="#FF8FA3" opacity="0.75" />

        {/* Mouth */}
        {sleeping ? (
          <circle cx="50" cy="46.5" r="2.2" fill="#FF8FA3" stroke="#18181B" strokeWidth="1.6" />
        ) : (
          <path
            d="M46.5 45.2C48 47.4 52 47.4 53.5 45.2"
            stroke="#18181B"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}

        {/* Tiny paws gripping the window top edge */}
        <rect
          x="27"
          y="53.5"
          width="14"
          height="9.5"
          rx="4.75"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2.3"
        />
        <rect
          x="59"
          y="53.5"
          width="14"
          height="9.5"
          rx="4.75"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2.3"
        />
      </svg>
    </div>
  );
}
