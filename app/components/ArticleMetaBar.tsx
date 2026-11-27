import { FOUNDER_BYLINE } from "@/lib/seo";

function formatDisplayDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function ArticleMetaBar({
  publishedDate,
  updatedDate,
}: {
  publishedDate: string;
  updatedDate?: string;
}) {
  const effectiveUpdated = updatedDate ?? publishedDate;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-[#52525B]">
      <span>
        By <strong className="font-semibold text-[#111111]">{FOUNDER_BYLINE}</strong>
      </span>
      <span aria-hidden="true" className="text-[#D4D4D8]">
        ·
      </span>
      <span>
        Published{" "}
        <time dateTime={publishedDate} className="tabular-nums text-[#111111]">
          {formatDisplayDate(publishedDate)}
        </time>
      </span>
      <span aria-hidden="true" className="text-[#D4D4D8]">
        ·
      </span>
      <span>
        Updated{" "}
        <time dateTime={effectiveUpdated} className="tabular-nums text-[#111111]">
          {formatDisplayDate(effectiveUpdated)}
        </time>
      </span>
    </div>
  );
}
