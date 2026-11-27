"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  formatMoney,
  type Currency,
  type CurrencyTotals,
} from "@/lib/invoices";
import { cn } from "@/lib/utils";

const DISPLAY_ORDER: ReadonlyArray<Currency> = ["USD", "EUR", "GBP", "INR"];

export function CashflowBentoCard({
  buckets,
  defaultCurrency,
}: {
  buckets: CurrencyTotals[];
  defaultCurrency?: Currency;
}) {
  const orderedBuckets = [...buckets].sort(
    (a, b) =>
      DISPLAY_ORDER.indexOf(a.currency) - DISPLAY_ORDER.indexOf(b.currency)
  );

  const preferredDefault: Currency =
    (defaultCurrency &&
      orderedBuckets.find((b) => b.currency === defaultCurrency)?.currency) ??
    orderedBuckets.find((b) => b.currency === "USD")?.currency ??
    orderedBuckets[0]?.currency ??
    "USD";

  const [selectedCurrency, setSelectedCurrency] =
    useState<Currency>(preferredDefault);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const bucket =
    orderedBuckets.find((b) => b.currency === selectedCurrency) ??
    orderedBuckets[0];

  if (!bucket) return null;

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % orderedBuckets.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (index - 1 + orderedBuckets.length) % orderedBuckets.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = orderedBuckets.length - 1;
    }
    if (nextIndex !== null) {
      event.preventDefault();
      setSelectedCurrency(orderedBuckets[nextIndex].currency);
      tabRefs.current[nextIndex]?.focus();
    }
  }

  const upcomingMinor = Math.max(0, bucket.owedMinor - bucket.overdueMinor);
  const totalBilled = bucket.collectedMinor + bucket.owedMinor;
  const collectedPct =
    totalBilled > 0
      ? Math.round((bucket.collectedMinor / totalBilled) * 100)
      : 0;
  const overduePct =
    totalBilled > 0
      ? Math.round((bucket.overdueMinor / totalBilled) * 100)
      : 0;
  const upcomingPct =
    totalBilled > 0 ? Math.max(0, 100 - collectedPct - overduePct) : 0;

  return (
    <section
      aria-label="Cashflow summary"
      className="flex h-full flex-col justify-between overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.03),0_10px_28px_-20px_rgba(17,17,17,0.12)]"
    >
      <div className="flex flex-1 flex-col justify-between gap-5 p-5">
        {/* Top Bar: Label + Currency Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[#111111]"
              />
              <span>Outstanding</span>
            </span>
            <span className="font-mono text-[11px] text-[#63636A] tabular-nums">
              · {collectedPct}% collected
            </span>
          </div>

          {orderedBuckets.length > 1 ? (
            <div
              role="tablist"
              aria-label="Currency filter"
              className="inline-flex items-center gap-0.5 rounded-[8px] border border-black/[0.07] bg-[#F6F7F2] p-[2px]"
            >
              {orderedBuckets.map((item, index) => {
                const active = item.currency === bucket.currency;
                return (
                  <button
                    key={item.currency}
                    id={`cashflow-tab-${item.currency}`}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="cashflow-panel"
                    tabIndex={active ? 0 : -1}
                    onClick={() => setSelectedCurrency(item.currency)}
                    onKeyDown={(e) => handleTabKeyDown(e, index)}
                    className={cn(
                      "min-h-6 whitespace-nowrap rounded-[6px] px-2.5 py-1 font-mono text-[10.5px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:px-2 sm:py-1",
                      active
                        ? "bg-[#111111] text-white"
                        : "text-[#52525B] hover:text-[#111111]"
                    )}
                  >
                    {item.currency}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="shrink-0 whitespace-nowrap rounded-[7px] border border-black/[0.08] bg-[#F6F7F2] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-[#52525B]">
              {bucket.currency}
            </span>
          )}
        </div>

        {/* Currency Totals Panel */}
        <div
          id="cashflow-panel"
          role={orderedBuckets.length > 1 ? "tabpanel" : undefined}
          aria-labelledby={
            orderedBuckets.length > 1
              ? `cashflow-tab-${bucket.currency}`
              : undefined
          }
          className="flex flex-1 flex-col justify-between gap-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="font-mono text-[32px] font-semibold leading-none tracking-[-0.04em] text-[#111111] tabular-nums sm:text-[36px]">
              {formatMoney(bucket.owedMinor, bucket.currency)}
            </p>
            <p className="font-mono text-[11.5px] text-[#63636A] tabular-nums">
              {bucket.activeCount}{" "}
              {bucket.activeCount === 1 ? "active invoice" : "active invoices"}{" "}
              · {formatMoney(totalBilled, bucket.currency)} billed
            </p>
          </div>

          {/* 3 Soft Pastel Semantic Inner Bento Mini-Tiles */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {/* Upcoming */}
          <div className="min-w-0 rounded-[13px] border border-black/[0.06] bg-[#F6F7F2] px-3.5 py-3">
            <p className="flex h-4 items-center gap-1.5 text-[11px] font-medium text-[#52525B]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#63636A]"
              />
              <span>Upcoming</span>
            </p>
            <p className="mt-1.5 truncate font-mono text-[17px] font-semibold leading-none tracking-[-0.03em] text-[#111111] tabular-nums">
              {formatMoney(upcomingMinor, bucket.currency)}
            </p>
            <p className="mt-1.5 font-mono text-[10.5px] text-[#63636A] tabular-nums">
              {upcomingPct}% of billed
            </p>
          </div>

          {/* Overdue */}
          <div
            className={cn(
              "min-w-0 rounded-[13px] border px-3.5 py-3",
              bucket.overdueMinor > 0
                ? "border-[#FECDD3] bg-[#FFF5F6]"
                : "border-black/[0.06] bg-[#F6F7F2]"
            )}
          >
            <p
              className={cn(
                "flex h-4 items-center gap-1.5 text-[11px] font-medium",
                bucket.overdueMinor > 0 ? "text-[#9F1239]" : "text-[#52525B]"
              )}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E11D48]"
              />
              <span>Overdue</span>
            </p>
            <p
              className={cn(
                "mt-1.5 truncate font-mono text-[17px] font-semibold leading-none tracking-[-0.03em] tabular-nums",
                bucket.overdueMinor > 0 ? "text-[#BE123C]" : "text-[#111111]"
              )}
            >
              {formatMoney(bucket.overdueMinor, bucket.currency)}
            </p>
            <p
              className={cn(
                "mt-1.5 font-mono text-[10.5px] tabular-nums",
                bucket.overdueMinor > 0 ? "text-[#9F1239]" : "text-[#63636A]"
              )}
            >
              {bucket.overdueCount > 0
                ? `${bucket.overdueCount} past due`
                : "None overdue"}
            </p>
          </div>

          {/* Collected */}
          <div
            className={cn(
              "min-w-0 rounded-[13px] border px-3.5 py-3",
              bucket.collectedMinor > 0
                ? "border-[#BBF7D0] bg-[#F2FDF5]"
                : "border-black/[0.06] bg-[#F6F7F2]"
            )}
          >
            <p
              className={cn(
                "flex h-4 items-center gap-1.5 text-[11px] font-medium",
                bucket.collectedMinor > 0 ? "text-[#14532D]" : "text-[#52525B]"
              )}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#16A34A]"
              />
              <span>Collected</span>
            </p>
            <p
              className={cn(
                "mt-1.5 truncate font-mono text-[17px] font-semibold leading-none tracking-[-0.03em] tabular-nums",
                bucket.collectedMinor > 0 ? "text-[#15803D]" : "text-[#111111]"
              )}
            >
              {formatMoney(bucket.collectedMinor, bucket.currency)}
            </p>
            <p
              className={cn(
                "mt-1.5 font-mono text-[10.5px] tabular-nums",
                bucket.collectedMinor > 0
                  ? "text-[#14532D]"
                  : "text-[#63636A]"
              )}
            >
              {collectedPct}% settled
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Flush 3px Proportional Composition Bar */}
      <div
        aria-hidden="true"
        className="flex h-[3px] w-full gap-0.5 bg-[#ECEEE6]"
      >
        {collectedPct > 0 && (
          <div
            style={{ width: `${collectedPct}%` }}
            className="h-full bg-[#16A34A] transition-all duration-300"
          />
        )}
        {overduePct > 0 && (
          <div
            style={{ width: `${overduePct}%` }}
            className="h-full bg-[#E11D48] transition-all duration-300"
          />
        )}
        {upcomingPct > 0 && (
          <div
            style={{ width: `${upcomingPct}%` }}
            className="h-full bg-[#C3F584] transition-all duration-300"
          />
        )}
      </div>
    </section>
  );
}
