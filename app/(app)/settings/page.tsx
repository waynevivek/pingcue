import type { Metadata } from "next";
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
  const { user } = await requireUser();
  const profile = await getUserProfile(user.id, user.email ?? "");
  const isPass = profile.plan === "founding_pass";
  const accountEmail = profile.email || user.email || "";

  return (
    <div className="mx-auto max-w-xl space-y-4 md:space-y-5">
      <div>
        <h1 className="font-sans text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#131316] sm:text-[24px]">
          Settings
        </h1>
        <p className="mt-1 text-xs text-[#63636A]">
          Personalize how reminder emails appear in your client&apos;s inbox and
          manage your workspace.
        </p>
      </div>

      {/* Apple Wallet-Inspired Collectible Membership Pass */}
      <div
        className={`relative overflow-hidden rounded-[18px] border border-black/[0.08] shadow-[0_1px_2px_rgba(19,19,22,0.03),0_10px_28px_-18px_rgba(19,19,22,0.1)] ${
          isPass
            ? "bg-gradient-to-br from-[#FFFFFF] via-[#FFFDF8] to-[#F7FBE8]"
            : "bg-white"
        }`}
      >
        <div
          aria-hidden="true"
          className={`h-[3px] w-full ${
            isPass
              ? "bg-gradient-to-r from-[#C3F584] via-[#E5F29E] to-[#FDE68A]"
              : "bg-[#EFEFED]"
          }`}
        />

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#131316]">
              {isPass ? "Founding Pass" : "Free plan"}
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                isPass
                  ? "bg-[#F0FDF4] text-[#15803D]"
                  : "bg-[#F4F4F2] text-[#52525B]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                  isPass ? "bg-[#16A34A]" : "bg-[#A1A1AA]"
                }`}
              />
              <span>{isPass ? "Active · Lifetime" : "1 active invoice"}</span>
            </span>
          </div>

          {isPass ? (
            <div className="mt-2.5 space-y-3 text-xs leading-relaxed text-[#63636A]">
              <p>
                Unlimited active invoices, 1-tap WhatsApp nudges, and 12 months
                of V1.5 Document Chaser are unlocked.
              </p>

              {(profile.founding_pass_unlocked_at || profile.dodo_payment_id) && (
                <div className="flex flex-wrap gap-2">
                  {profile.founding_pass_unlocked_at && (
                    <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-black/[0.07] bg-white px-2.5 py-1 text-[11px] text-[#63636A]">
                      <span>Unlocked</span>
                      <span className="font-mono font-medium text-[#131316] tabular-nums">
                        {formatDateUtc(profile.founding_pass_unlocked_at)}
                      </span>
                    </span>
                  )}
                  {profile.dodo_payment_id && (
                    <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-black/[0.07] bg-white px-2.5 py-1 text-[11px] text-[#63636A]">
                      <span>Ref</span>
                      <code className="font-mono font-medium text-[#131316]">
                        {profile.dodo_payment_id}
                      </code>
                    </span>
                  )}
                </div>
              )}

              <p className="text-[11.5px] text-[#71717A]">
                Billing help:{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-[#131316] underline decoration-black/25 underline-offset-2 hover:decoration-black"
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>
          ) : (
            <div className="mt-2.5 space-y-4">
              <p className="text-xs leading-relaxed text-[#63636A]">
                Upgrade once for $19 — no recurring subscription.
              </p>
              <ul className="space-y-2 text-xs text-[#27272A]">
                {[
                  "Unlimited active invoices across INR, USD, EUR & GBP",
                  "Zero-API 1-tap WhatsApp nudges",
                  "12 months of V1.5 Document Chaser included",
                ].map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[#15803D]"
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
                className="w-full rounded-[9px] sm:w-auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* Sender & Reminder Preferences */}
      <div className="rounded-[18px] border border-black/[0.07] bg-white p-5 shadow-[0_1px_2px_rgba(19,19,22,0.03),0_10px_28px_-18px_rgba(19,19,22,0.1)] sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-[#131316]">
          Sender &amp; reminder preferences
        </h2>
        <SettingsForm
          email={accountEmail}
          initialDisplayName={profile.display_name ?? ""}
          initialDefaultCurrency={profile.default_currency}
          initialNotifyOnSend={profile.notify_on_send}
        />
      </div>

      {/* Account Session */}
      <div className="flex flex-col gap-3 rounded-[18px] border border-black/[0.07] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(19,19,22,0.03)] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#131316]">Signed in as</p>
          <p className="mt-0.5 truncate font-mono text-xs text-[#63636A]">
            {accountEmail}
          </p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-[8px] border border-black/10 bg-white px-3 text-xs font-medium text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.04)] transition-colors hover:bg-[#F5F5F3] cursor-pointer sm:w-auto"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl space-y-4">
          <div className="h-8 w-36 animate-pulse rounded-lg bg-black/[0.06]" />
          <div className="h-36 animate-pulse rounded-[18px] bg-white" />
          <div className="h-72 animate-pulse rounded-[18px] bg-white" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
