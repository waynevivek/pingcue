import type { Metadata } from "next";
import { Suspense } from "react";
import { Check, LogOut } from "lucide-react";
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
    <div className="mx-auto max-w-2xl space-y-5 md:space-y-6">
      <div>
        <h1 className="font-sans text-[26px] font-semibold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[32px]">
          Account settings
        </h1>
        <p className="mt-1 text-sm text-[#52525B]">
          Customize how client reminder emails sign off and choose your default
          currency.
        </p>
      </div>

      <Card className="p-5 sm:p-7">
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

      {/* Membership & Billing Card */}
      <Card
        className={`overflow-hidden p-5 sm:p-7 ${
          isPass ? "bg-white" : "border-[#111111]/15 bg-[#FFFBEB]"
        }`}
      >
        <div
          aria-hidden="true"
          className="relative mb-5 h-12 w-full overflow-hidden rounded-2xl bg-[#D6F7A3]"
        >
          <svg
            viewBox="0 0 400 80"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full"
            fill="none"
          >
            <rect width="400" height="80" fill={isPass ? "#FFE875" : "#64C7FF"} />
            <path
              d="M0 44C90 22 190 56 290 36C340 26 375 30 400 36V80H0V44Z"
              fill={isPass ? "#C8F392" : "#9CE0FF"}
            />
            <path
              d="M0 60C120 46 250 72 400 54V80H0V60Z"
              fill={isPass ? "#A8EC62" : "#C7F584"}
            />
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-[#111111]">
            Plan &amp; billing
          </h2>
          <Badge variant={isPass ? "paid" : "neutral"}>
            {isPass ? "Founding Pass · Active" : "Free plan"}
          </Badge>
        </div>

        {isPass ? (
          <div className="mt-3 space-y-3 text-sm text-[#52525B]">
            <p className="leading-relaxed">
              Your one-time Founding Pass is active—unlimited invoices, 1-click
              WhatsApp nudges, and 12 months of V1.5 Document Chaser are
              included.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {profile.founding_pass_unlocked_at && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-[#FAFAFA] px-3 py-1">
                  <span>Unlocked</span>
                  <span className="font-mono font-semibold text-[#111111]">
                    {formatDateUtc(profile.founding_pass_unlocked_at)}
                  </span>
                </span>
              )}
              {profile.dodo_payment_id && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-[#FAFAFA] px-3 py-1">
                  <span>Ref</span>
                  <code className="font-mono font-semibold text-[#111111]">
                    {profile.dodo_payment_id}
                  </code>
                </span>
              )}
            </div>
            <p className="text-xs">
              Need billing help? Email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-[#111111] underline"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            <p className="text-sm leading-relaxed text-[#4B4116]">
              You&apos;re on the Free plan (1 active invoice at a time). Upgrade
              once for $19—no recurring subscription.
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
      </Card>

      {/* Account Session Card (especially clear on mobile) */}
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
            className="w-full sm:w-auto"
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
          <div className="h-9 w-48 animate-pulse rounded-xl bg-black/[0.06]" />
          <div className="h-72 animate-pulse rounded-[24px] border border-black/[0.06] bg-white" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
