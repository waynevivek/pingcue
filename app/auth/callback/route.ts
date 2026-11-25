import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeRedirectPath } from "@/lib/auth";
import { getSupabasePublicEnv } from "@/lib/supabase-env";

type CallbackOtpType =
  | "signup"
  | "recovery"
  | "magiclink"
  | "email"
  | "invite"
  | "email_change";

const ALLOWED_OTP_TYPES = new Set<CallbackOtpType>([
  "signup",
  "recovery",
  "magiclink",
  "email",
  "invite",
  "email_change",
]);

/** Exchanges Supabase PKCE codes or email token hashes into session cookies. */
export async function GET(request: NextRequest) {
  const env = getSupabasePublicEnv();
  if (!env) {
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const safeNext = sanitizeRedirectPath(searchParams.get("next"), "/dashboard");

  const pendingCookies: Array<{
    name: string;
    value: string;
    options: CookieOptions;
  }> = [];
  const pendingHeaders: Record<string, string> = {};

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach((cookie) => pendingCookies.push(cookie));
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            pendingHeaders[key] = value;
          });
        }
      },
    },
  });

  let authError: Error | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  } else if (
    tokenHash &&
    type &&
    ALLOWED_OTP_TYPES.has(type as CallbackOtpType)
  ) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as CallbackOtpType,
    });
    authError = error;
  } else {
    return NextResponse.redirect(
      new URL("/login?error=auth_callback_failed", request.nextUrl.origin)
    );
  }

  if (authError) {
    return NextResponse.redirect(
      new URL("/login?error=auth_callback_failed", request.nextUrl.origin)
    );
  }

  const response = NextResponse.redirect(
    new URL(safeNext, request.nextUrl.origin)
  );
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  Object.entries(pendingHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
