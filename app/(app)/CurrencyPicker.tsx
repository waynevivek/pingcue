"use client";

import { useState } from "react";
import { CURRENCIES, CURRENCY_SYMBOLS, type Currency } from "@/lib/invoices";
import { cn } from "@/lib/utils";

export function CurrencyPicker({
  id,
  name,
  defaultValue = "INR",
  disabled = false,
  onChange,
}: {
  id?: string;
  name: string;
  defaultValue?: Currency;
  disabled?: boolean;
  onChange?: (currency: Currency) => void;
}) {
  const [selected, setSelected] = useState<Currency>(defaultValue);

  function selectCurrency(cur: Currency) {
    if (disabled) return;
    setSelected(cur);
    onChange?.(cur);
  }

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Currency"
      className="grid grid-cols-4 gap-2"
    >
      <input type="hidden" name={name} value={selected} />
      {CURRENCIES.map((cur) => {
        const isActive = selected === cur;
        return (
          <button
            key={cur}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => selectCurrency(cur)}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border px-2 font-mono text-xs font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm",
              isActive
                ? "border-[#111111] bg-[#111111] text-white shadow-[0_2px_0_rgba(17,17,17,0.28)]"
                : "border-black/10 bg-[#FAFAFA] text-[#111111] shadow-[0_2px_0_rgba(17,17,17,0.06)] hover:bg-white"
            )}
          >
            <span>{CURRENCY_SYMBOLS[cur]}</span>
            <span>{cur}</span>
          </button>
        );
      })}
    </div>
  );
}
