import type { FaqSchemaItem } from "@/lib/seo";

/**
 * Always-visible Q&A cards for editorial guide, template, and comparison pages
 * so key answers remain immediately readable without collapsed/hidden states.
 */
export function OpenFaqList({ items }: { items: readonly FaqSchemaItem[] }) {
  return (
    <div className="space-y-3.5">
      {items.map((item) => (
        <div
          key={item.q}
          className="rounded-[20px] border border-black/[0.08] bg-white p-5 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.12)] sm:p-6"
        >
          <h3 className="font-sans text-[16px] font-semibold leading-snug tracking-[-0.015em] text-[#111111] sm:text-[17px]">
            {item.q}
          </h3>
          <p className="mt-2 max-w-[66ch] text-[14.5px] leading-[1.65] text-[#3F3F46] sm:text-[15px]">
            {item.a}
          </p>
        </div>
      ))}
    </div>
  );
}
