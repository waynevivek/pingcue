import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Invoice, Profile } from "./invoices";
import type { ReminderLog } from "./reminders";
import {
  getSupabaseAdminEnv,
  getSupabasePublicEnv,
  isSupabaseConfigured,
} from "./supabase-env";

export { isSupabaseConfigured };

/** Creates a cookie-bound Supabase client for Server Components and Server Actions. */
export async function createSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(
      "Supabase environment variables are missing or invalid. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components cannot mutate cookies; proxy.ts handles token refresh.
        }
      },
    },
  });
}

/** Creates a service-role Supabase client for cron jobs and verified webhooks. */
export function createSupabaseAdminClient() {
  const env = getSupabaseAdminEnv();
  if (!env) {
    throw new Error(
      "Missing or invalid NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(env.url, env.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function requireUser() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function getUserProfile(
  userId: string,
  fallbackEmail: string
): Promise<Profile> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, plan, founding_pass_unlocked_at")
    .eq("id", userId)
    .maybeSingle();

  if (data) {
    return data as Profile;
  }

  return {
    id: userId,
    email: fallbackEmail,
    plan: "free",
    founding_pass_unlocked_at: null,
  };
}

export async function listInvoices(userId: string): Promise<Invoice[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load invoices: ${error.message}`);
  }

  return (data ?? []) as Invoice[];
}

export async function getInvoiceById(
  userId: string,
  invoiceId: string
): Promise<Invoice | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return (data as Invoice | null) ?? null;
}

export async function countActiveInvoices(userId: string): Promise<number> {
  const invoices = await listInvoices(userId);
  return invoices.filter(
    (inv) => inv.amount_received_minor < inv.amount_minor
  ).length;
}

export async function listReminderLogs(
  userId: string,
  invoiceId: string
): Promise<ReminderLog[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reminder_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("invoice_id", invoiceId)
    .order("sent_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []) as ReminderLog[];
}
