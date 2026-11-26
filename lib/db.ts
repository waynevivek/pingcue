import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Currency, Invoice, Profile } from "./invoices";
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
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, plan, founding_pass_unlocked_at, display_name, default_currency, notify_on_send, dodo_payment_id"
    )
    .eq("id", userId)
    .maybeSingle();

  if (data) {
    return {
      id: data.id as string,
      email: (data.email as string) || fallbackEmail,
      plan: data.plan === "founding_pass" ? "founding_pass" : "free",
      founding_pass_unlocked_at:
        (data.founding_pass_unlocked_at as string | null) ?? null,
      display_name: (data.display_name as string | null) ?? null,
      default_currency:
        (data.default_currency as Currency | null) ?? "INR",
      notify_on_send:
        typeof data.notify_on_send === "boolean" ? data.notify_on_send : true,
      dodo_payment_id: (data.dodo_payment_id as string | null) ?? null,
    };
  }

  // Fallback for pre-migration schemas so existing Founding Pass accounts keep their plan.
  if (error) {
    const { data: legacy } = await supabase
      .from("profiles")
      .select("id, email, plan, founding_pass_unlocked_at")
      .eq("id", userId)
      .maybeSingle();

    if (legacy) {
      return {
        id: legacy.id as string,
        email: (legacy.email as string) || fallbackEmail,
        plan: legacy.plan === "founding_pass" ? "founding_pass" : "free",
        founding_pass_unlocked_at:
          (legacy.founding_pass_unlocked_at as string | null) ?? null,
        display_name: null,
        default_currency: "INR",
        notify_on_send: true,
        dodo_payment_id: null,
      };
    }
  }

  return {
    id: userId,
    email: fallbackEmail,
    plan: "free",
    founding_pass_unlocked_at: null,
    display_name: null,
    default_currency: "INR",
    notify_on_send: true,
    dodo_payment_id: null,
  };
}

export async function isEmailSuppressed(email: string): Promise<boolean> {
  const suppressed = await listSuppressedEmails([email]);
  return suppressed.has(email.trim().toLowerCase());
}

/** Batch-checks which client email addresses are currently suppressed (hard bounce or spam complaint). */
export async function listSuppressedEmails(
  emails: readonly string[]
): Promise<Set<string>> {
  const result = new Set<string>();
  if (!getSupabaseAdminEnv()) return result;

  const unique = Array.from(
    new Set(
      emails
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0)
    )
  );
  if (unique.length === 0) return result;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("suppressed_emails")
    .select("email")
    .in("email", unique);

  if (error || !data) return result;

  for (const row of data) {
    if (typeof row.email === "string" && row.email.trim()) {
      result.add(row.email.trim().toLowerCase());
    }
  }
  return result;
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

export type SentReminderLogRef = Pick<
  ReminderLog,
  "invoice_id" | "channel" | "offset_days" | "scheduled_for"
>;

/** Batch-loads sent scheduled email logs for all of a user's invoices in a single query. */
export async function listSentEmailLogsByUser(
  userId: string
): Promise<Map<string, SentReminderLogRef[]>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reminder_logs")
    .select("invoice_id, channel, offset_days, scheduled_for")
    .eq("user_id", userId)
    .eq("channel", "email");

  const grouped = new Map<string, SentReminderLogRef[]>();
  if (error || !data) {
    return grouped;
  }

  for (const row of data as SentReminderLogRef[]) {
    const existing = grouped.get(row.invoice_id);
    if (existing) {
      existing.push(row);
    } else {
      grouped.set(row.invoice_id, [row]);
    }
  }

  return grouped;
}
