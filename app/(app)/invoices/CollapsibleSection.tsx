"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.03),0_10px_28px_-20px_rgba(17,17,17,0.12)]">
      <h2 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F8F9F6] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#111111] sm:px-5 sm:py-4"
        >
          <span className="min-w-0">
            <span className="block text-[13.5px] font-semibold text-[#111111]">
              {title}
            </span>
            {description && (
              <span className="mt-0.5 block text-xs font-normal text-[#52525B]">
                {description}
              </span>
            )}
          </span>
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-black/[0.08] bg-[#F5F6F3] text-[#111111]"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-150",
                open && "rotate-180"
              )}
            />
          </span>
        </button>
      </h2>

      {open && (
        <div id={panelId} className="border-t border-black/[0.06] p-4 sm:p-5">
          {children}
        </div>
      )}
    </div>
  );
}
