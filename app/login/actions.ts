"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/db";
import { resolveAppOrigin } from "@/lib/site-config";

export type AuthFormState = {
  error?: string;
  success?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  return { email, password };
}

function buildCallbackUrl(nextPath: string): string | undefined {
  const origin =
    resolveAppOrigin() ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : null);
  if (!origin) return undefined;
  return `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase is not configured yet. Follow the setup steps below to add your keys.",
    };
  }

  const parsed = parseCredentials(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const wantsUpgrade = formData.get("upgrade") === "1";

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(wantsUpgrade ? "/dashboard?upgrade=1" : "/dashboard");
}

export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase is not configured yet. Follow the setup steps below to add your keys.",
    };
  }

  const parsed = parseCredentials(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const wantsUpgrade = formData.get("upgrade") === "1";
  const nextPath = wantsUpgrade ? "/dashboard?upgrade=1" : "/dashboard";
  const emailRedirectTo = buildCallbackUrl(nextPath);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
    ...(emailRedirectTo ? { options: { emailRedirectTo } } : {}),
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect(nextPath);
  }

  return {
    success:
      "Account created! Check your email inbox for the confirmation link, then sign in.",
  };
}

export async function requestPasswordResetAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase is not configured yet. Follow the setup steps below to add your keys.",
    };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createSupabaseServerClient();
  const redirectTo = buildCallbackUrl("/auth/reset-password");
  const { error } = await supabase.auth.resetPasswordForEmail(
    email,
    redirectTo ? { redirectTo } : undefined
  );

  if (
    error &&
    (error.status === 429 || error.message.toLowerCase().includes("rate limit"))
  ) {
    return {
      error: "Too many reset requests. Please wait a few minutes and try again.",
    };
  }

  return {
    success:
      "If an account exists for that email, we sent a password reset link. Check your inbox.",
  };
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
