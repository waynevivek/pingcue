"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  countActiveInvoices,
  getInvoiceById,
  getUserProfile,
  requireUser,
} from "@/lib/db";
import {
  addDaysIso,
  getTodayIsoDate,
  parseMajorToMinor,
  validateInvoiceFormData,
  type InvoiceFormState,
} from "@/lib/invoices";

function revalidateInvoicePaths(invoiceId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  if (invoiceId) {
    revalidatePath(`/invoices/${invoiceId}`);
  }
}

export async function createInvoiceAction(
  _prevState: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  const { supabase, user } = await requireUser();
  const parsed = validateInvoiceFormData(formData);

  if (!parsed.ok) {
    return {
      error: "Please fix the highlighted fields before saving.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  const isActive = parsed.data.amount_received_minor < parsed.data.amount_minor;
  if (isActive) {
    const profile = await getUserProfile(user.id, user.email ?? "");
    if (profile.plan === "free") {
      const activeCount = await countActiveInvoices(user.id);
      if (activeCount >= 1) {
        return {
          error:
            "Free plan includes 1 active invoice at a time. Mark your existing invoice paid or unlock the $19 Founding Pass for unlimited invoices.",
        };
      }
    }
  }

  const { data: inserted, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      ...parsed.data,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return {
      error: error?.message ?? "Could not save invoice. Please try again.",
    };
  }

  revalidateInvoicePaths();
  redirect(`/invoices/${inserted.id}`);
}

export async function updateInvoiceAction(
  invoiceId: string,
  _prevState: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  const { supabase, user } = await requireUser();
  const existing = await getInvoiceById(user.id, invoiceId);

  if (!existing) {
    return { error: "Invoice not found." };
  }

  const parsed = validateInvoiceFormData(formData);
  if (!parsed.ok) {
    return {
      error: "Please fix the highlighted fields before saving.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  const wasPaid = existing.amount_received_minor >= existing.amount_minor;
  const willBeActive =
    parsed.data.amount_received_minor < parsed.data.amount_minor;

  if (wasPaid && willBeActive) {
    const profile = await getUserProfile(user.id, user.email ?? "");
    if (profile.plan === "free") {
      const activeCount = await countActiveInvoices(user.id);
      if (activeCount >= 1) {
        return {
          error:
            "Free plan allows 1 active invoice at a time. Mark another invoice paid before reopening this one.",
        };
      }
    }
  }

  const { error } = await supabase
    .from("invoices")
    .update(parsed.data)
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateInvoicePaths(invoiceId);
  return { success: "Invoice updated." };
}

export async function recordPaymentAction(
  invoiceId: string,
  formData: FormData
): Promise<void> {
  const { supabase, user } = await requireUser();
  const invoice = await getInvoiceById(user.id, invoiceId);
  if (!invoice) {
    redirect("/invoices");
  }

  const markFull = formData.get("mark_full") === "1";
  const receivedMinor = markFull
    ? invoice.amount_minor
    : parseMajorToMinor(String(formData.get("amount_received") ?? ""));

  if (receivedMinor === null) {
    return;
  }

  const wasPaid = invoice.amount_received_minor >= invoice.amount_minor;
  const willBeActive = receivedMinor < invoice.amount_minor;
  if (wasPaid && willBeActive) {
    const profile = await getUserProfile(user.id, user.email ?? "");
    if (profile.plan === "free") {
      const activeCount = await countActiveInvoices(user.id);
      if (activeCount >= 1) {
        return;
      }
    }
  }

  await supabase
    .from("invoices")
    .update({ amount_received_minor: receivedMinor })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  revalidateInvoicePaths(invoiceId);
}

export async function pauseInvoiceAction(
  invoiceId: string,
  formData: FormData
): Promise<void> {
  const { supabase, user } = await requireUser();
  const mode = String(formData.get("mode") ?? "");

  let pausedUntil: string | null = null;
  if (mode === "plus7") {
    pausedUntil = addDaysIso(getTodayIsoDate(), 7);
  } else if (mode === "date") {
    const rawDate = String(formData.get("paused_until") ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      return;
    }
    pausedUntil = rawDate;
  } else if (mode !== "resume") {
    return;
  }

  await supabase
    .from("invoices")
    .update({ paused_until: pausedUntil })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  revalidateInvoicePaths(invoiceId);
}

export async function deleteInvoiceAction(invoiceId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  revalidateInvoicePaths();
  redirect("/invoices");
}
