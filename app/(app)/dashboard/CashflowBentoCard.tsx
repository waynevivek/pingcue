"use client";

import { useState } from "react";
import {
  formatMoney,
  type Currency,
  type CurrencyTotals,
} from "@/lib/invoices";
import { cn } from "@/lib/utils";

export function CashflowBentoCard({
  buckets,
}: {
  buckets: CurrencyTotals[];
}) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    buckets[0]?.currency ?? "INR"
  );

  const bucket =
    buckets.find((b) => b.currency === selectedCurrency) ?? buckets[0];

  if (!bucket) return null;

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
    <div className="flex flex-col justify-between overflow-hidden rounded-[18px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(19,19,22,0.03),0_10px_28px_-18px_rgba(19,19,22,0.1)]">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#63636A]">
            Outstanding balance
          </span>

          {buckets.length > 1 ? (
            <div
              role="tablist"
              aria-label="Currency filter"
              className="inline-flex items-center gap-0.5 rounded-[8px] bg-[#F5F5F3] p-[2px]"
            >
              {buckets.map((item) => {
                const active = item.currency === bucket.currency;
                return (
                  <button
                    key={item.currency}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCurrency(item.currency)}
                    className={cn(
                      "rounded-[6px] px-2 py-0.5 font-mono text-[10.5px] font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316]",
                      active
                        ? "bg-white text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.08)]"
                        : "text-[#71717A] hover:text-[#131316]"
                    )}
                  >
                    {item.currency}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="rounded-[6px] bg-[#F5F5F3] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-[#52525B]">
              {bucket.currency}
            </span>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[32px] font-semibold leading-none tracking-[-0.04em] text-[#131316] tabular-nums sm:text-[36px]">
            {formatMoney(bucket.owedMinor, bucket.currency)}
          </p>
          <span className="font-mono text-[11px] text-[#71717A] tabular-nums">
            {collectedPct}% collected of{" "}
            {formatMoney(totalBilled, bucket.currency)}
          </span>
        </div>

        {/* Proportional 3-Segment Composition Rail */}
        <div
          aria-hidden="true"
          className="mt-4 flex h-[5px] w-full gap-0.5 overflow-hidden rounded-full bg-[#EFEFED]"
        >
          {collectedPct > 0 && (
            <div
              style={{ width: `${collectedPct}%` }}
              className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
            />
          )}
          {overduePct > 0 && (
            <div
              style={{ width: `${overduePct}%` }}
              className="h-full rounded-full bg-[#FB7185] transition-all duration-300"
            />
          )}
          {upcomingPct > 0 && (
            <div
              style={{ width: `${upcomingPct}%` }}
              className="h-full rounded-full bg-[#D4D4D0] transition-all duration-300"
            />
          )}
        </div>
      </div>

      {/* Hairline-Divided 3-Stat Footer */}
      <div className="grid grid-cols-3 divide-x divide-black/[0.06] border-t border-black/[0.06] bg-[#FCFDFB]">
        <div className="min-w-0 px-3.5 py-3 sm:px-5 sm:py-3.5">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#63636A]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#A1A1AA]"
            />
            <span className="truncate">Upcoming</span>
          </p>
          <p className="mt-1 truncate font-mono text-[13px] font-semibold text-[#131316] tabular-nums sm:text-sm">
            {formatMoney(upcomingMinor, bucket.currency)}
          </p>
        </div>

        <div className="min-w-0 px-3.5 py-3 sm:px-5 sm:py-3.5">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#63636A]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E11D48]"
            />
            <span className="truncate">Overdue</span>
          </p>
          <p
            className={cn(
              "mt-1 truncate font-mono text-[13px] font-semibold tabular-nums sm:text-sm",
              bucket.overdueMinor > 0 ? "text-[#BE123C]" : "text-[#131316]"
            )}
          >
            {formatMoney(bucket.overdueMinor, bucket.currency)}
          </p>
        </div>

        <div className="min-w-0 px-3.5 py-3 sm:px-5 sm:py-3.5">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#63636A]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#16A34A]"
            />
            <span className="truncate">Collected</span>
          </p>
          <p
            className={cn(
              "mt-1 truncate font-mono text-[13px] font-semibold tabular-nums sm:text-sm",
              bucket.collectedMinor > 0 ? "text-[#15803D]" : "text-[#131316]"
            )}
          >
            {formatMoney(bucket.collectedMinor, bucket.currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
