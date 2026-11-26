import type { Metadata } from "next";
import { Suspense } from "react";
import { Check, LogOut } from "lucide-react";
import { StarBuddySticker } from "@/app/components/HeroStickers";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import { signOutAction } from "@/app/login/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-sans text-[28px] font-semibold leading-tight tracking-[-0.035em] text-[#111111] sm:text-[34px]">
          Account settings
        </h1>
        <p className="mt-1 text-sm text-[#52525B]">
          Customize how client reminder emails sign off and choose your default
          currency.
        </p>
      </div>

      {/* Collectible Membership & Billing Card (right up top, matching Landing Pricing) */}
      <div
        className={`relative rounded-[28px] border-2 p-5 sm:p-6 ${
          isPass
            ? "border-[#111111] bg-[#FFFBEB] shadow-[0_16px_40px_-22px_rgba(17,17,17,0.22)]"
            : "border-black/[0.08] bg-[#D9E6FF]"
        }`}
      >
        {isPass && (
          <div className="pointer-events-none absolute right-2 -top-6 z-10 sm:-right-2">
            <StarBuddySticker className="h-[54px] w-[54px] rotate-[10deg] sm:h-[62px] sm:w-[62px]" />
          </div>
        )}

        <div
          aria-hidden="true"
          className="relative mb-4 h-12 w-full overflow-hidden rounded-2xl bg-[#D6F7A3]"
        >
          <svg
            viewBox="0 0 400 80"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full"
            fill="none"
          >
            <rect
              width="400"
              height="80"
              fill={isPass ? "#FFE875" : "#64C7FF"}
            />
            <path
              d="M0 44C90 22 190 56 290 36C340 26 375 30 400 36V80H0V44Z"
              fill={isPass ? "#C8F392" : "#9CE0FF"}
            />
            <path
              d="M0 60C120 46 250 72 400 54V80H0V60Z"
              fill={isPass ? "#A8EC62" : "#C7F584"}
            />
            <circle cx="62" cy="24" r="9" fill="#FFFFFF" opacity="0.9" />
            <circle cx="288" cy="52" r="4.5" fill="#FF9AA2" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-[#111111]">
            {isPass ? "Founding Pass" : "Free plan"}
          </h2>
          <Badge variant={isPass ? "paid" : "neutral"}>
            {isPass ? "Active · Lifetime" : "1 active invoice"}
          </Badge>
        </div>

        {isPass ? (
          <div className="mt-2.5 space-y-3 text-xs leading-relaxed text-[#574C1B] sm:text-sm">
            <p>
              Unlimited active invoices, 1-click WhatsApp nudges, and 12 months
              of V1.5 Document Chaser are unlocked.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {profile.founding_pass_unlocked_at && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[#52525B] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <span>Unlocked</span>
                  <span className="font-mono font-semibold text-[#111111]">
                    {formatDateUtc(profile.founding_pass_unlocked_at)}
                  </span>
                </span>
              )}
              {profile.dodo_payment_id && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[#52525B] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <span>Ref</span>
                  <code className="font-mono font-semibold text-[#111111]">
                    {profile.dodo_payment_id}
                  </code>
                </span>
              )}
            </div>
            <p className="text-xs">
              Billing help:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-[#111111] underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        ) : (
          <div className="mt-2.5 space-y-4">
            <p className="text-sm leading-relaxed text-[#1E335C]">
              Upgrade once for $19—no recurring subscription.
            </p>
            <ul className="space-y-2 text-xs font-medium text-[#111111]">
              {[
                "Unlimited active invoices across INR, USD, EUR & GBP",
                "Zero-API 1-click WhatsApp nudges",
                "12 months of V1.5 Document Chaser included",
              ].map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#C3F584] text-[#111111]"
                  >
                    <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                  </span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <UpgradeCheckoutButton
              label="Unlock Founding Pass — $19"
              className="w-full sm:w-auto"
            />
          </div>
        )}
      </div>

      {/* Sender & Reminder Preferences inside Periwinkle Bento Frame */}
      <div className="rounded-[28px] border border-black/[0.06] bg-[#D9E6FF] p-3 sm:p-4">
        <Card className="rounded-[20px] p-5 shadow-[0_6px_22px_-12px_rgba(15,23,42,0.14)] sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-[#111111]">
            Sender &amp; reminder preferences
          </h2>
          <SettingsForm
            email={accountEmail}
            initialDisplayName={profile.display_name ?? ""}
            initialDefaultCurrency={profile.default_currency}
            initialNotifyOnSend={profile.notify_on_send}
          />
        </Card>
      </div>

      {/* Account Session Card */}
      <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111111]">Signed in as</p>
          <p className="mt-0.5 truncate font-mono text-xs text-[#52525B]">
            {accountEmail}
          </p>
        </div>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full shadow-[0_2px_0_rgba(17,17,17,0.08)] active:translate-y-[1px] active:shadow-none sm:w-auto"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sign out</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-9 w-48 animate-pulse rounded-xl bg-[#F4F4F5]" />
          <div className="h-44 animate-pulse rounded-[28px] bg-[#FFFBEB]" />
          <div className="h-72 animate-pulse rounded-[28px] bg-[#D9E6FF]" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
