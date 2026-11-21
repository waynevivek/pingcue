import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  getUserProfile,
  isSupabaseConfigured,
} from "@/lib/db";
import { createFoundingPassCheckout } from "@/lib/dodo";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
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

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    new URL(request.url).origin;

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
