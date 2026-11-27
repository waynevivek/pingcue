"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { CURRENCY_SYMBOLS, type Currency } from "@/lib/invoices";
import { cn } from "@/lib/utils";

const ORDERED_CURRENCIES: ReadonlyArray<Currency> = ["USD", "EUR", "GBP", "INR"];

export function CurrencyPicker({
  id,
  name,
  ariaLabelledBy,
  ariaDescribedBy,
  defaultValue = "USD",
  disabled = false,
  onChange,
}: {
  id?: string;
  name: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  defaultValue?: Currency;
  disabled?: boolean;
  onChange?: (currency: Currency) => void;
}) {
  const initial: Currency = ORDERED_CURRENCIES.includes(defaultValue)
    ? defaultValue
    : "USD";

  const [selected, setSelected] = useState<Currency>(initial);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectCurrency(cur: Currency) {
    if (disabled) return;
    setSelected(cur);
    onChange?.(cur);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    if (disabled) return;
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % ORDERED_CURRENCIES.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex =
        (index - 1 + ORDERED_CURRENCIES.length) % ORDERED_CURRENCIES.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = ORDERED_CURRENCIES.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const nextCurrency = ORDERED_CURRENCIES[nextIndex];
      selectCurrency(nextCurrency);
      buttonRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <div
      id={id}
      role="radiogroup"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabelledBy ? undefined : "Currency"}
      className="grid w-full max-w-[384px] grid-cols-4 gap-1 rounded-[10px] border border-black/[0.08] bg-[#F5F6F3] p-[3px]"
    >
      <input type="hidden" name={name} value={selected} />
      {ORDERED_CURRENCIES.map((cur, index) => {
        const isActive = selected === cur;
        return (
          <button
            key={cur}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            onClick={() => selectCurrency(cur)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-1 whitespace-nowrap rounded-[7px] px-2 font-mono text-xs font-semibold transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 sm:gap-1.5 sm:px-2.5",
              isActive
                ? "border border-black/[0.09] bg-white text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.06)]"
                : "border border-transparent text-[#52525B] hover:text-[#111111] active:bg-white/60"
            )}
          >
            <span aria-hidden="true">{CURRENCY_SYMBOLS[cur]}</span>
            <span>{cur}</span>
          </button>
        );
      })}
    </div>
  );
}
