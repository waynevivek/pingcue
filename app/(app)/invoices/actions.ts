"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  countActiveInvoices,
  createSupabaseAdminClient,
  getInvoiceById,
  getUserProfile,
  isEmailSuppressed,
  listReminderLogs,
  requireUser,
} from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";
import {
  addDaysIso,
  formatOffsetBadge,
  getTodayIsoDate,
  isInvoiceActive,
  isValidIsoDate,
  parseMajorToMinor,
  validateInvoiceFormData,
  type InvoiceFormState,
} from "@/lib/invoices";
import {
  buildReminderEmail,
  getNextReminderOffset,
  getSentOffsetsForDueDate,
} from "@/lib/reminders";
import { getManualSendDailyLimit } from "@/lib/security";
import { getSupabaseAdminEnv } from "@/lib/supabase-env";

const TEST_EMAIL_HOURLY_LIMIT = 5;
const TEST_EMAIL_DAILY_LIMIT = 10;

function revalidateInvoicePaths(invoiceId?: string) {
  revalidatePath("/(app)", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  revalidatePath("/invoices/new");
  if (invoiceId) {
    revalidatePath(`/invoices/${invoiceId}`);
  }
}

function isFreePlanLimitError(
  error: { message?: string } | null | undefined
): boolean {
  return Boolean(error?.message?.includes("FREE_PLAN_LIMIT"));
}

function redirectWithActionError(invoiceId: string, message: string): never {
  redirect(`/invoices/${invoiceId}?actionError=${encodeURIComponent(message)}`);
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
    if (isFreePlanLimitError(error)) {
      return {
        error:
          "Free plan includes 1 active invoice at a time. Mark your existing invoice paid or unlock the $19 Founding Pass for unlimited invoices.",
      };
    }
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
    if (isFreePlanLimitError(error)) {
      return {
        error:
          "Free plan allows 1 active invoice at a time. Mark another invoice paid before reopening this one.",
      };
    }
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
    redirectWithActionError(
      invoiceId,
      "Enter a valid amount received (0 or more, up to 2 decimals)."
    );
  }

  if (receivedMinor > invoice.amount_minor) {
    redirectWithActionError(
      invoiceId,
      "Amount received cannot exceed the invoice amount."
    );
  }

  const wasPaid = invoice.amount_received_minor >= invoice.amount_minor;
  const willBeActive = receivedMinor < invoice.amount_minor;
  if (wasPaid && willBeActive) {
    const profile = await getUserProfile(user.id, user.email ?? "");
    if (profile.plan === "free") {
      const activeCount = await countActiveInvoices(user.id);
      if (activeCount >= 1) {
        redirectWithActionError(
          invoiceId,
          "Free plan allows 1 active invoice at a time. Mark another invoice paid before reopening this one."
        );
      }
    }
  }

  const { error } = await supabase
    .from("invoices")
    .update({ amount_received_minor: receivedMinor })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    if (isFreePlanLimitError(error)) {
      redirectWithActionError(
        invoiceId,
        "Free plan allows 1 active invoice at a time. Mark another invoice paid before reopening this one."
      );
    }
    redirectWithActionError(
      invoiceId,
      error.message || "Could not save payment progress. Please try again."
    );
  }

  revalidateInvoicePaths(invoiceId);
  const notice =
    markFull || receivedMinor >= invoice.amount_minor
      ? "marked_paid"
      : "payment_saved";
  redirect(`/invoices/${invoiceId}?actionNotice=${notice}`);
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
    if (!isValidIsoDate(rawDate)) {
      redirectWithActionError(invoiceId, "Pick a valid pause date.");
    }
    pausedUntil = rawDate;
  } else if (mode !== "resume") {
    redirectWithActionError(invoiceId, "Invalid pause action.");
  }

  const { error } = await supabase
    .from("invoices")
    .update({ paused_until: pausedUntil })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    redirectWithActionError(
      invoiceId,
      error.message || "Could not update reminder pause setting."
    );
  }

  revalidateInvoicePaths(invoiceId);
  redirect(
    `/invoices/${invoiceId}?actionNotice=${mode === "resume" ? "resumed" : "paused"}`
  );
}

export type DeleteInvoiceState = {
  error?: string;
};

export async function deleteInvoiceAction(
  invoiceId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: DeleteInvoiceState
): Promise<DeleteInvoiceState> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    return {
      error: error.message || "Could not delete invoice. Please try again.",
    };
  }

  revalidateInvoicePaths();
  redirect("/invoices");
}

export type TestEmailState = {
  error?: string;
  success?: string;
};

export async function sendTestEmailAction(
  invoiceId: string,
  _prevState: TestEmailState,
  formData?: FormData
): Promise<TestEmailState> {
  const { user } = await requireUser();
  if (!user.email) {
    return { error: "Your account does not have an email address set." };
  }

  if (!getSupabaseAdminEnv()) {
    return {
      error:
        "Server email configuration is incomplete. Add SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const admin = createSupabaseAdminClient();
  const now = Date.now();
  const hourAgoMs = now - 60 * 60 * 1000;
  const dayAgoIso = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const { data: recentTestLogs, error: rateLimitError } = await admin
    .from("reminder_logs")
    .select("sent_at")
    .eq("user_id", user.id)
    .eq("channel", "test_email")
    .gte("sent_at", dayAgoIso);

  if (rateLimitError) {
    return { error: "Could not verify test email quota. Please try again." };
  }

  const recentList = recentTestLogs ?? [];
  if (recentList.length >= TEST_EMAIL_DAILY_LIMIT) {
    return {
      error: `Daily test email limit reached (${TEST_EMAIL_DAILY_LIMIT} per 24 hours).`,
    };
  }

  const hourlyCount = recentList.filter((row) => {
    const sentAtMs = Date.parse(String(row.sent_at ?? ""));
    return Number.isFinite(sentAtMs) && sentAtMs >= hourAgoMs;
  }).length;

  if (hourlyCount >= TEST_EMAIL_HOURLY_LIMIT) {
    return {
      error: `Hourly test email limit reached (${TEST_EMAIL_HOURLY_LIMIT} per hour). Please wait before sending another test.`,
    };
  }

  const [invoice, profile, logs] = await Promise.all([
    getInvoiceById(user.id, invoiceId),
    getUserProfile(user.id, user.email),
    listReminderLogs(user.id, invoiceId),
  ]);
  if (!invoice) {
    return { error: "Invoice not found." };
  }

  const sentOffsets = getSentOffsetsForDueDate(logs, invoice.due_date);
  const rawRequestedOffset = formData?.get("offset_days");
  const parsedRequestedOffset =
    typeof rawRequestedOffset === "string" &&
    /^[+-]?\d+$/.test(rawRequestedOffset.trim())
      ? Number.parseInt(rawRequestedOffset.trim(), 10)
      : null;
  const offsetDays =
    parsedRequestedOffset !== null &&
    invoice.reminder_offsets.includes(parsedRequestedOffset)
      ? parsedRequestedOffset
      : getNextReminderOffset(invoice, sentOffsets, getTodayIsoDate());

  const email = buildReminderEmail({
    invoice,
    offsetDays,
    freelancerEmail: user.email,
    freelancerName: profile.display_name,
    isTest: true,
  });

  const result = await sendReminderEmail({
    to: user.email,
    replyTo: user.email,
    fromName: profile.display_name,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  const { error: logError } = await admin.from("reminder_logs").insert({
    invoice_id: invoice.id,
    user_id: user.id,
    offset_days: offsetDays,
    channel: "test_email",
    recipient_email: user.email,
    delivery_status: "sent",
    resend_id: result.id || null,
  });

  if (logError) {
    console.error("Failed to record test_email log:", logError.message);
  }

  revalidateInvoicePaths(invoiceId);
  return {
    success: `Test email (${formatOffsetBadge(offsetDays)}) sent to ${user.email}.`,
  };
}

export type SendNowState = {
  error?: string;
  success?: string;
};

export async function sendReminderNowAction(
  invoiceId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: SendNowState
): Promise<SendNowState> {
  const { user } = await requireUser();
  if (!user.email) {
    return { error: "Your account does not have an email address set." };
  }

  if (!user.email_confirmed_at) {
    return {
      error:
        "Please confirm your account email address before sending reminders to clients.",
    };
  }

  if (!getSupabaseAdminEnv()) {
    return {
      error:
        "Server email configuration is incomplete. Add SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const [invoice, profile, logs] = await Promise.all([
    getInvoiceById(user.id, invoiceId),
    getUserProfile(user.id, user.email),
    listReminderLogs(user.id, invoiceId),
  ]);

  if (!invoice) {
    return { error: "Invoice not found." };
  }

  if (!isInvoiceActive(invoice)) {
    return { error: "This invoice is already marked paid." };
  }

  if (await isEmailSuppressed(invoice.client_email)) {
    return {
      error:
        "This client email previously bounced or marked reminders as spam, so sending is paused to protect delivery.",
    };
  }

  const todayIso = getTodayIsoDate();
  const sentOffsets = getSentOffsetsForDueDate(logs, invoice.due_date);
  const offsetDays = getNextReminderOffset(invoice, sentOffsets, todayIso);
  if (sentOffsets.has(offsetDays)) {
    return {
      error:
        "All scheduled reminder steps for the current due date have already been sent.",
    };
  }

  const scheduledFor = addDaysIso(invoice.due_date, offsetDays);
  const admin = createSupabaseAdminClient();

  const dailyLimit = getManualSendDailyLimit(profile.plan);
  const dayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentClientSends, error: rateLimitError } = await admin
    .from("reminder_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("channel", "email")
    .gte("sent_at", dayAgoIso);

  if (rateLimitError) {
    return {
      error: "Could not verify client reminder quota. Please try again.",
    };
  }

  if ((recentClientSends ?? 0) >= dailyLimit) {
    return {
      error: `Daily client reminder limit reached (${dailyLimit} per 24 hours). Scheduled cron reminders continue normally.`,
    };
  }

  const { data: claimed, error: claimError } = await admin
    .from("reminder_logs")
    .insert({
      invoice_id: invoice.id,
      user_id: user.id,
      offset_days: offsetDays,
      channel: "email",
      recipient_email: invoice.client_email,
      delivery_status: "sent",
      scheduled_for: scheduledFor,
      resend_id: null,
    })
    .select("id")
    .single();

  if (claimError) {
    if (claimError.code === "23505") {
      return {
        error:
          "This reminder step was already sent for the current due date.",
      };
    }
    return { error: `Could not prepare reminder send: ${claimError.message}` };
  }

  if (!claimed) {
    return { error: "Could not acquire reminder send lock." };
  }

  const email = buildReminderEmail({
    invoice,
    offsetDays,
    freelancerEmail: user.email,
    freelancerName: profile.display_name,
    isTest: false,
  });

  const result = await sendReminderEmail({
    to: invoice.client_email,
    replyTo: user.email,
    fromName: profile.display_name,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  if (!result.ok) {
    await admin.from("reminder_logs").delete().eq("id", claimed.id);
    return { error: result.error };
  }

  const { error: updateError } = await admin
    .from("reminder_logs")
    .update({ resend_id: result.id || null })
    .eq("id", claimed.id);

  if (updateError) {
    console.error("Failed to store manual reminder resend_id:", updateError.message);
  }

  revalidateInvoicePaths(invoiceId);
  return {
    success: `Reminder (${formatOffsetBadge(offsetDays)}) sent to ${invoice.client_email}.`,
  };
}

export async function logWhatsappNudgeAction(
  invoiceId: string,
  offsetDays: number
): Promise<void> {
  if (!Number.isInteger(offsetDays)) return;
  if (!getSupabaseAdminEnv()) return;

  const { user } = await requireUser();
  const [invoice, profile] = await Promise.all([
    getInvoiceById(user.id, invoiceId),
    getUserProfile(user.id, user.email ?? ""),
  ]);

  if (!invoice || profile.plan !== "founding_pass") {
    return;
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("reminder_logs").insert({
    invoice_id: invoice.id,
    user_id: user.id,
    offset_days: offsetDays,
    channel: "whatsapp",
    recipient_email: invoice.client_whatsapp ?? invoice.client_email,
    delivery_status: "sent",
    resend_id: null,
  });

  if (error) {
    console.error("Failed to record whatsapp nudge log:", error.message);
    return;
  }

  revalidatePath(`/invoices/${invoiceId}`);
}
