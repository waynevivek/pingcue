import { NextResponse } from "next/server";
import { getIndexNowKey } from "@/lib/site-config";

/**
 * Serves the IndexNow ownership verification key at /<INDEXNOW_API_KEY>.txt
 * via the rewrite configured in next.config.ts.
 */
export function GET() {
  const key = getIndexNowKey();
  if (!key) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(key, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
