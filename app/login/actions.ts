"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/db";

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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

function resolveEmailRedirectTo(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return undefined;
  try {
    const parsed = new URL(raw);
    const isValidHttp =
      parsed.protocol === "https:" ||
      (parsed.protocol === "http:" &&
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"));
    if (isValidHttp && parsed.hostname !== "your-domain.com") {
      return `${parsed.origin}/login`;
    }
  } catch {
    return undefined;
  }
  return undefined;
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

  const supabase = await createSupabaseServerClient();
  const emailRedirectTo = resolveEmailRedirectTo();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
    ...(emailRedirectTo ? { options: { emailRedirectTo } } : {}),
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    success:
      "Account created! Check your email inbox for the confirmation link, then sign in.",
  };
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
