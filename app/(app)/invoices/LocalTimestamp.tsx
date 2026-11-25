"use client";

import { useSyncExternalStore } from "react";

const EMPTY_SUBSCRIBE = () => () => {};

function formatTimestamp(iso: string, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

/** Renders UTC on SSR and switches cleanly to the browser's local timezone on hydration. */
export function LocalTimestamp({ iso }: { iso: string }) {
  const isClient = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => true,
    () => false
  );

  if (!isClient) {
    return (
      <time dateTime={iso} className="font-mono text-[#52525B]">
        {formatTimestamp(iso, "UTC")} UTC
      </time>
    );
  }

  return (
    <time
      dateTime={iso}
      title={`${formatTimestamp(iso, "UTC")} UTC`}
      className="font-mono text-[#52525B]"
    >
      {formatTimestamp(iso)}
    </time>
  );
}
