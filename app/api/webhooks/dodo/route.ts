import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db";
import {
  extractDodoCustomerId,
  extractDodoMetadataString,
  extractDodoPaymentId,
  isDodoLiveMode,
  isFoundingPassPaymentEvent,
  isRevocationWebhookEvent,
  verifyDodoWebhook,
  type DodoWebhookEvent,
} from "@/lib/dodo";
import { getSupabaseAdminEnv } from "@/lib/supabase-env";

type AdminSupabaseClient = ReturnType<typeof createSupabaseAdminClient>;

function extractBuyerIdentity(event: DodoWebhookEvent) {
  const metadata = event.data?.metadata;
  const userId = extractDodoMetadataString(metadata, "user_id");
  const rawCustomerEmail =
    typeof event.data?.customer?.email === "string"
      ? event.data.customer.email.trim()
      : null;
  const rawEmail =
    extractDodoMetadataString(metadata, "user_email") ??
    (rawCustomerEmail || null);
  const fallbackEmail = rawEmail ? rawEmail.toLowerCase() : null;

  return {
    userId,
    fallbackEmail,
    paymentId: extractDodoPaymentId(event),
    customerId: extractDodoCustomerId(event),
  };
}

async function findProfileForRevocation(
  supabase: AdminSupabaseClient,
  identity: ReturnType<typeof extractBuyerIdentity>
): Promise<{ id: string } | null> {
  if (identity.paymentId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("dodo_payment_id", identity.paymentId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to look up profile by payment ID: ${error.message}`);
    }
    if (data?.id) {
      return { id: data.id as string };
    }
  }

  if (identity.userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", identity.userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to look up profile by user ID: ${error.message}`);
    }
    if (data?.id) {
      return { id: data.id as string };
    }
  }

  if (identity.fallbackEmail) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", identity.fallbackEmail)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to look up profile by email: ${error.message}`);
    }
    if (data?.id) {
      return { id: data.id as string };
    }
  }

  return null;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim();
  if (!webhookSecret || webhookSecret === "whsec_your-dodo-webhook-secret") {
    return NextResponse.json(
      { error: "DODO_PAYMENTS_WEBHOOK_KEY is not configured." },
      { status: 500 }
    );
  }

  if (process.env.NODE_ENV === "production" && !isDodoLiveMode()) {
    return NextResponse.json(
      {
        error:
          "Dodo webhooks are disabled in production while DODO_PAYMENTS_ENVIRONMENT is not live_mode.",
      },
      { status: 503 }
    );
  }

  if (!getSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "Supabase service credentials are not configured." },
      { status: 500 }
    );
  }

  const webhookId = request.headers.get("webhook-id");
  const webhookSignature = request.headers.get("webhook-signature");
  const webhookTimestamp = request.headers.get("webhook-timestamp");

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    return NextResponse.json(
      { error: "Missing Standard Webhooks headers." },
      { status: 400 }
    );
  }

  // Must verify against raw unparsed body bytes.
  const rawBody = await request.text();

  let event: DodoWebhookEvent;
  try {
    event = verifyDodoWebhook(rawBody, {
      "webhook-id": webhookId,
      "webhook-signature": webhookSignature,
      "webhook-timestamp": webhookTimestamp,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const eventType = event.type ?? event.event_type ?? "unknown";
  const supabase = createSupabaseAdminClient();

  // Enforce idempotency before mutating profiles so replayed deliveries cannot re-unlock after a refund.
  const { data: alreadyProcessed, error: dedupeError } = await supabase
    .from("processed_webhooks")
    .select("webhook_id")
    .eq("webhook_id", webhookId)
    .maybeSingle();

  if (dedupeError) {
    return NextResponse.json(
      { error: `Failed to check webhook idempotency: ${dedupeError.message}` },
      { status: 500 }
    );
  }

  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  let unmatchedRevocation = false;

  if (eventType === "payment.succeeded") {
    const expectedProductId = process.env.DODO_FOUNDING_PASS_PRODUCT_ID?.trim();
    if (!isFoundingPassPaymentEvent(event, expectedProductId)) {
      console.info(
        JSON.stringify({
          tag: "PINGCUE_DODO_IGNORED",
          webhookId,
          eventType,
          paymentId: event.data?.payment_id ?? null,
        })
      );
      return NextResponse.json({ received: true, ignored: true });
    }

    const { userId, fallbackEmail, paymentId, customerId } =
      extractBuyerIdentity(event);

    if (!userId && !fallbackEmail) {
      return NextResponse.json(
        { error: "Webhook missing buyer identity." },
        { status: 500 }
      );
    }

    const unlockPatch = {
      plan: "founding_pass" as const,
      refunded_at: null,
      ...(paymentId ? { dodo_payment_id: paymentId } : {}),
      ...(customerId ? { dodo_customer_id: customerId } : {}),
    };

    try {
      const nowIso = new Date().toISOString();
      let unlockedProfileId: string | null = null;

      if (userId) {
        const { data: existingProfile, error: profileReadError } = await supabase
          .from("profiles")
          .select("id, founding_pass_unlocked_at")
          .eq("id", userId)
          .maybeSingle();

        if (profileReadError) {
          return NextResponse.json(
            {
              error: `Failed to load buyer profile: ${profileReadError.message}`,
            },
            { status: 500 }
          );
        }

        if (existingProfile) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from("profiles")
            .update({
              ...unlockPatch,
              founding_pass_unlocked_at:
                existingProfile.founding_pass_unlocked_at ?? nowIso,
            })
            .eq("id", userId)
            .select("id")
            .maybeSingle();

          if (updateError || !updatedProfile) {
            return NextResponse.json(
              {
                error: `Failed to unlock Founding Pass: ${
                  updateError?.message ?? "no profile updated"
                }`,
              },
              { status: 500 }
            );
          }

          unlockedProfileId = updatedProfile.id as string;
        } else {
          const { data: authData, error: authError } =
            await supabase.auth.admin.getUserById(userId);

          if (authError && !fallbackEmail) {
            return NextResponse.json(
              {
                error: `Failed to resolve auth user: ${authError.message}`,
              },
              { status: 500 }
            );
          }

          if (authData?.user) {
            const resolvedEmail = (
              authData.user.email ??
              fallbackEmail ??
              ""
            )
              .trim()
              .toLowerCase();

            const { data: upsertedProfile, error: upsertError } = await supabase
              .from("profiles")
              .upsert(
                {
                  id: authData.user.id,
                  email: resolvedEmail,
                  ...unlockPatch,
                  founding_pass_unlocked_at: nowIso,
                },
                { onConflict: "id" }
              )
              .select("id")
              .maybeSingle();

            if (upsertError || !upsertedProfile) {
              return NextResponse.json(
                {
                  error: `Failed to create unlocked profile: ${
                    upsertError?.message ?? "upsert failed"
                  }`,
                },
                { status: 500 }
              );
            }

            unlockedProfileId = upsertedProfile.id as string;
          }
        }
      }

      if (!unlockedProfileId && fallbackEmail) {
        const { data: existingByEmail, error: emailReadError } = await supabase
          .from("profiles")
          .select("id, founding_pass_unlocked_at")
          .eq("email", fallbackEmail)
          .maybeSingle();

        if (emailReadError) {
          return NextResponse.json(
            {
              error: `Failed to look up profile by email: ${emailReadError.message}`,
            },
            { status: 500 }
          );
        }

        if (existingByEmail) {
          const { data: updatedByEmail, error: emailUpdateError } =
            await supabase
              .from("profiles")
              .update({
                ...unlockPatch,
                founding_pass_unlocked_at:
                  existingByEmail.founding_pass_unlocked_at ?? nowIso,
              })
              .eq("id", existingByEmail.id)
              .select("id")
              .maybeSingle();

          if (emailUpdateError || !updatedByEmail) {
            return NextResponse.json(
              {
                error: `Failed to unlock Founding Pass: ${
                  emailUpdateError?.message ?? "no profile updated"
                }`,
              },
              { status: 500 }
            );
          }

          unlockedProfileId = updatedByEmail.id as string;
        }
      }

      if (!unlockedProfileId) {
        return NextResponse.json(
          { error: "No matching profile found to unlock Founding Pass." },
          { status: 500 }
        );
      }

      console.info(
        JSON.stringify({
          tag: "PINGCUE_DODO_UNLOCK",
          webhookId,
          paymentId,
          userId: unlockedProfileId,
        })
      );
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Unexpected error unlocking Founding Pass.",
        },
        { status: 500 }
      );
    }
  } else if (isRevocationWebhookEvent(eventType, event)) {
    const identity = extractBuyerIdentity(event);
    try {
      const matchedProfile = await findProfileForRevocation(supabase, identity);

      if (matchedProfile) {
        const { error: revokeError } = await supabase
          .from("profiles")
          .update({
            plan: "free",
            refunded_at: new Date().toISOString(),
          })
          .eq("id", matchedProfile.id);

        if (revokeError) {
          return NextResponse.json(
            {
              error: `Failed to revoke Founding Pass: ${revokeError.message}`,
            },
            { status: 500 }
          );
        }

        console.info(
          JSON.stringify({
            tag: "PINGCUE_DODO_REVOKE",
            webhookId,
            eventType,
            paymentId: identity.paymentId,
            userId: matchedProfile.id,
          })
        );
      } else {
        unmatchedRevocation = true;
        console.info(
          JSON.stringify({
            tag: "PINGCUE_DODO_REVOKE_UNMATCHED",
            webhookId,
            eventType,
            paymentId: identity.paymentId,
          })
        );
      }
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Unexpected error processing revocation webhook.",
        },
        { status: 500 }
      );
    }
  }

  // Record audit entry after fulfillment succeeds so retries are never swallowed on failure.
  const { error: auditError } = await supabase
    .from("processed_webhooks")
    .upsert(
      { webhook_id: webhookId, event_type: eventType },
      { onConflict: "webhook_id", ignoreDuplicates: true }
    );

  if (auditError) {
    console.error(
      "Failed to record processed_webhooks audit row:",
      auditError.message
    );
  }

  return NextResponse.json(
    unmatchedRevocation ? { received: true, unmatched: true } : { received: true }
  );
}
