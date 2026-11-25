import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  getUserProfile,
  isSupabaseConfigured,
} from "@/lib/db";
import { createFoundingPassCheckout, isDodoLiveMode } from "@/lib/dodo";
import { resolveAppOrigin } from "@/lib/site-config";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    );
  }

  if (process.env.NODE_ENV === "production" && !isDodoLiveMode()) {
    return NextResponse.json(
      {
        error:
          "Founding Pass checkout is opening soon while payment verification completes. Join the early-access list on the homepage to be notified first.",
        checkoutUnavailable: true,
      },
      { status: 503 }
    );
  }

  const origin = resolveAppOrigin(request.url);
  if (!origin) {
    return NextResponse.json(
      {
        error:
          "NEXT_PUBLIC_APP_URL must be configured as an HTTPS production URL.",
      },
      { status: 500 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json(
      { error: "Please sign in before purchasing the Founding Pass." },
      { status: 401 }
    );
  }

  const profile = await getUserProfile(user.id, user.email);
  if (profile.plan === "founding_pass") {
    return NextResponse.json({
      alreadyUnlocked: true,
      checkoutUrl: "/dashboard",
    });
  }

  const result = await createFoundingPassCheckout({
    userId: user.id,
    userEmail: user.email,
    returnUrl: `${origin}/dashboard?checkout=return`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ checkoutUrl: result.checkoutUrl });
}
