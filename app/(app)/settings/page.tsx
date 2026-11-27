import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Check, LogOut } from "lucide-react";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import { signOutAction } from "@/app/login/actions";
import { getUserProfile, requireUser } from "@/lib/db";
import { SUPPORT_EMAIL } from "@/lib/site-config";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = {
  title: "Settings — PingCue",
};

function formatDateUtc(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

async function SettingsContent() {
  await connection();
  const { user } = await requireUser();
  const profile = await getUserProfile(user.id, user.email ?? "");
  const isPass = profile.plan === "founding_pass";
  const accountEmail = profile.email || user.email || "";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sans text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[24px]">
          Settings
        </h1>
        <p className="mt-1 text-xs text-[#52525B]">
          Personalize how reminder emails appear in your client&apos;s inbox and
          manage your workspace plan.
        </p>
      </div>

      {/* Section 1: Plan & Membership Receipt Card */}
      <section
        aria-label="Plan and billing"
        className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.03),0_10px_28px_-20px_rgba(17,17,17,0.12)]"
      >
        <div
          aria-hidden="true"
          className={`h-[3px] w-full ${
            isPass ? "bg-[#C3F584]" : "bg-[#ECEEE8]"
          }`}
        />

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
          <div className="space-y-1">
            <h2 className="text-[13px] font-semibold text-[#111111]">
              Plan &amp; billing
            </h2>
            <p className="text-pretty text-xs leading-relaxed text-[#63636A]">
              {isPass
                ? "One-time membership active on this account."
                : "Start free with 1 active invoice or unlock unlimited once."}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#111111]">
                {isPass ? "Founding Pass" : "Free plan"}
              </p>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] border px-2 py-0.5 text-[11.5px] font-medium ${
                  isPass
                    ? "border-[#BFE883] bg-[#F4FCE6] text-[#1A2E05]"
                    : "border-black/[0.09] bg-[#F8F9F6] text-[#52525B]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    isPass ? "bg-[#16A34A]" : "bg-[#63636A]"
                  }`}
                />
                <span>{isPass ? "Active · Lifetime" : "1 active invoice"}</span>
              </span>
            </div>

            {isPass ? (
              <div className="mt-2.5 space-y-3 text-xs leading-relaxed text-[#52525B]">
                <p>
                  Unlimited active invoices, 1-tap WhatsApp nudges, and 12
                  months of V1.5 Document Chaser are unlocked.
                </p>

                {(profile.founding_pass_unlocked_at ||
                  profile.dodo_payment_id) && (
                  <div className="flex flex-wrap gap-2">
                    {profile.founding_pass_unlocked_at && (
                      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] border border-black/[0.08] bg-[#F8F9F6] px-2.5 py-1 text-[11px] text-[#52525B]">
                        <span>Unlocked</span>
                        <span className="font-mono font-medium text-[#111111] tabular-nums">
                          {formatDateUtc(profile.founding_pass_unlocked_at)}
                        </span>
                      </span>
                    )}
                    {profile.dodo_payment_id && (
                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-[7px] border border-black/[0.08] bg-[#F8F9F6] px-2.5 py-1 text-[11px] text-[#52525B]">
                        <span className="shrink-0">Ref</span>
                        <code className="truncate font-mono font-medium text-[#111111]">
                          {profile.dodo_payment_id}
                        </code>
                      </span>
                    )}
                  </div>
                )}

                <p className="text-[11.5px] text-[#63636A]">
                  Billing help:{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="font-medium text-[#111111] underline decoration-black/25 underline-offset-2 hover:decoration-black"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              </div>
            ) : (
              <div className="mt-2.5 space-y-4">
                <p className="text-xs leading-relaxed text-[#52525B]">
                  Upgrade once for $19 — no recurring subscription.
                </p>
                <ul className="space-y-2 text-xs text-[#27272A]">
                  {[
                    "Unlimited active invoices across USD, EUR, GBP & INR",
                    "Zero-API 1-tap WhatsApp nudges",
                    "12 months of V1.5 Document Chaser included",
                  ].map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F4FCE6] text-[#1A2E05]"
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                      </span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <UpgradeCheckoutButton
                  variant="compact"
                  label="Unlock Founding Pass — $19"
                  className="w-full rounded-[8px] sm:w-auto"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Sender & Reminder Preferences */}
      <section
        aria-label="Sender and reminder preferences"
        className="rounded-[18px] border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(17,17,17,0.03),0_10px_28px_-20px_rgba(17,17,17,0.12)] sm:p-6"
      >
        <SettingsForm
          email={accountEmail}
          initialDisplayName={profile.display_name ?? ""}
          initialDefaultCurrency={profile.default_currency}
          initialNotifyOnSend={profile.notify_on_send}
        />
      </section>

      {/* Section 3: Account Session */}
      <section
        aria-label="Account session"
        className="flex flex-col gap-3 rounded-[18px] border border-black/[0.08] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(17,17,17,0.03),0_10px_28px_-20px_rgba(17,17,17,0.12)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#111111]">Signed in as</p>
          <p className="mt-0.5 truncate font-mono text-xs text-[#52525B]">
            {accountEmail}
          </p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] border border-black/[0.1] bg-white px-3 text-xs font-medium text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#F5F6F3] active:bg-[#ECEEE6] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:h-8 sm:w-auto"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </form>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-5">
          <div className="h-12 w-44 animate-pulse rounded-lg bg-[#F5F6F3]" />
          <div className="h-36 animate-pulse rounded-[14px] border border-black/[0.06] bg-[#F8F9F6]" />
          <div className="h-72 animate-pulse rounded-[14px] border border-black/[0.06] bg-[#F8F9F6]" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
