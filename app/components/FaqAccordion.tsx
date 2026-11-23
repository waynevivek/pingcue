"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = {
  q: string;
  a: string;
};

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const triggerId = `faq-trigger-${index}`;
        const panelId = `faq-panel-${index}`;

        return (
          <div
            key={item.q}
            className={cn(
              "rounded-[20px] border transition-all duration-200",
              isOpen
                ? "border-[#111111] bg-white shadow-[0_12px_28px_-16px_rgba(17,24,39,0.18)]"
                : "border-black/[0.08] bg-[#FAFAFA] hover:border-black/15 hover:bg-[#F4F4F5]"
            )}
          >
            <h3 className="m-0">
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold tracking-[-0.015em] text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 sm:px-6 sm:py-5 sm:text-[16px] cursor-pointer rounded-[20px]"
              >
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                    isOpen
                      ? "border-[#111111] bg-[#C8F392] text-[#111111]"
                      : "border-black/10 bg-white text-[#52525B]"
                  )}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                    strokeWidth={2}
                  />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className="px-5 pb-5 pr-12 sm:px-6 sm:pb-6 sm:pr-16"
            >
              <p className="max-w-[64ch] text-[14px] leading-[1.65] text-[#52525B] sm:text-[15px]">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
