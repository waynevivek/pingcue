import { connection, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db";
import { getSupabaseAdminEnv } from "@/lib/supabase-env";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export async function GET() {
  await connection();

  const timestamp = new Date().toISOString();

  if (!getSupabaseAdminEnv()) {
    return NextResponse.json(
      { ok: false, database: "unconfigured", timestamp },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("processed_webhooks")
      .select("webhook_id")
      .limit(1);

    if (error) {
      console.error("Health check database query failed:", error.message);
      return NextResponse.json(
        { ok: false, database: "error", timestamp },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: true, database: "ok", timestamp },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error(
      "Health check failed:",
      err instanceof Error ? err.message : "unknown error"
    );
    return NextResponse.json(
      { ok: false, database: "error", timestamp },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }
}
