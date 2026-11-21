"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  countActiveInvoices,
  createSupabaseAdminClient,
  getInvoiceById,
  getUserProfile,
  listReminderLogs,
  requireUser,
} from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";
import {
  addDaysIso,
  formatOffsetBadge,
  getTodayIsoDate,
  parseMajorToMinor,
  validateInvoiceFormData,
  type InvoiceFormState,
} from "@/lib/invoices";
import { buildReminderEmail, getNextReminderOffset } from "@/lib/reminders";

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

export type TestEmailState = {
  error?: string;
  success?: string;
};

export async function sendTestEmailAction(
  invoiceId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: TestEmailState
): Promise<TestEmailState> {
  const { user } = await requireUser();
  if (!user.email) {
    return { error: "Your account does not have an email address set." };
  }

  const invoice = await getInvoiceById(user.id, invoiceId);
  if (!invoice) {
    return { error: "Invoice not found." };
  }

  const logs = await listReminderLogs(user.id, invoiceId);
  const sentOffsets = new Set(
    logs.filter((log) => log.channel === "email").map((log) => log.offset_days)
  );
  const offsetDays = getNextReminderOffset(
    invoice,
    sentOffsets,
    getTodayIsoDate()
  );

  const email = buildReminderEmail({
    invoice,
    offsetDays,
    freelancerEmail: user.email,
    isTest: true,
  });

  const result = await sendReminderEmail({
    to: user.email,
    replyTo: user.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createSupabaseAdminClient();
    await admin.from("reminder_logs").insert({
      invoice_id: invoice.id,
      user_id: user.id,
      offset_days: offsetDays,
      channel: "test_email",
      recipient_email: user.email,
      resend_id: result.id || null,
    });
  }

  revalidateInvoicePaths(invoiceId);
  return {
    success: `Test email (${formatOffsetBadge(offsetDays)}) sent to ${user.email}.`,
  };
}
