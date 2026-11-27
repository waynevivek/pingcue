import { buildLlmsFullTxt } from "@/lib/llms";

export function GET() {
  return new Response(buildLlmsFullTxt(), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
