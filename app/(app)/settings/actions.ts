"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient, requireUser } from "@/lib/db";
import { CURRENCIES, validateDisplayName, type Currency } from "@/lib/invoices";
import { getSupabaseAdminEnv } from "@/lib/supabase-env";

export type SettingsFormState = {
  error?: string;
  success?: string;
};

export async function updateSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const { user } = await requireUser();

  if (!getSupabaseAdminEnv()) {
    return {
      error: "Server configuration is incomplete. Add SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const nameValidation = validateDisplayName(
    String(formData.get("display_name") ?? "")
  );
  if (!nameValidation.ok) {
    return { error: nameValidation.error };
  }

  const currencyRaw = String(formData.get("default_currency") ?? "INR")
    .trim()
    .toUpperCase();
  if (!CURRENCIES.includes(currencyRaw as Currency)) {
    return { error: "Select INR, USD, EUR, or GBP." };
  }

  const notifyOnSend = formData.get("notify_on_send") === "on";
  const admin = createSupabaseAdminClient();

  // Only update safe user-preference fields via service_role; plan and billing stay locked.
  const { error } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email: (user.email ?? "").trim().toLowerCase(),
      display_name: nameValidation.value,
      default_currency: currencyRaw as Currency,
      notify_on_send: notifyOnSend,
    },
    { onConflict: "id" }
  );

  if (error) {
    return { error: error.message || "Could not save settings." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/invoices/new");

  return { success: "Settings saved." };
}
