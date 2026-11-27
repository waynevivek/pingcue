import { NextResponse } from "next/server";
import { isTimingSafeBearerMatch } from "@/lib/security";
import { getPublicAbsoluteUrls } from "@/lib/seo-routes";
import {
  getIndexNowKey,
  getSiteUrl,
  isIndexingAllowed,
} from "@/lib/site-config";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Authenticated endpoint to push all public canonical URLs to IndexNow
 * (Bing, ChatGPT Search, Yandex, Seznam) after deploys or content updates.
 *
 * Authorize with: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim() ?? "";
  if (
    !cronSecret ||
    !isTimingSafeBearerMatch(request.headers.get("authorization"), cronSecret)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isIndexingAllowed()) {
    return NextResponse.json(
      { error: "Indexing is disabled on this environment." },
      { status: 400 }
    );
  }

  const key = getIndexNowKey();
  if (!key) {
    return NextResponse.json(
      { error: "INDEXNOW_API_KEY is not configured or invalid." },
      { status: 503 }
    );
  }

  const siteUrl = getSiteUrl();
  let parsedSite: URL;
  try {
    parsedSite = new URL(siteUrl);
  } catch {
    return NextResponse.json(
      { error: "Invalid canonical site URL." },
      { status: 500 }
    );
  }

  if (
    parsedSite.protocol !== "https:" ||
    parsedSite.hostname === "localhost" ||
    parsedSite.hostname === "127.0.0.1"
  ) {
    return NextResponse.json(
      {
        error:
          "IndexNow requires a live HTTPS NEXT_PUBLIC_APP_URL (not localhost).",
      },
      { status: 400 }
    );
  }

  const urlList = getPublicAbsoluteUrls(siteUrl);
  const payload = {
    host: parsedSite.host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList,
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return NextResponse.json(
        {
          ok: false,
          status: response.status,
          detail: detail.slice(0, 300),
          submittedCount: urlList.length,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      status: response.status,
      host: parsedSite.host,
      submittedCount: urlList.length,
      urls: urlList,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to contact IndexNow.",
      },
      { status: 502 }
    );
  }
}
