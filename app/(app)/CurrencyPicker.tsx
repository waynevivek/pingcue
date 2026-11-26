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
      className="grid grid-cols-4 gap-1 rounded-[10px] bg-[#EFEFED] p-[3px]"
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
              "inline-flex h-9 items-center justify-center gap-1 rounded-[7px] px-2 font-mono text-xs font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316] disabled:cursor-not-allowed disabled:opacity-60",
              isActive
                ? "bg-white text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]"
                : "text-[#63636A] hover:text-[#131316]"
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
