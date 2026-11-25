import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F4F5] px-3.5 py-1.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#EAEAEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to dashboard</span>
        </Link>
        <h1 className="mt-4 font-sans text-[28px] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[32px]">
          Account settings
        </h1>
        <p className="mt-1 text-sm text-[#52525B]">
          Customize how client reminder emails sign off and choose your default
          currency.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <h2 className="mb-4 text-base font-semibold text-[#111111]">
          Sender &amp; reminder preferences
        </h2>
        <SettingsForm
          email={profile.email || user.email || ""}
          initialDisplayName={profile.display_name ?? ""}
          initialDefaultCurrency={profile.default_currency}
          initialNotifyOnSend={profile.notify_on_send}
        />
      </Card>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-[#111111]">
            Plan &amp; billing
          </h2>
          <Badge variant={isPass ? "paid" : "neutral"}>
            {isPass ? "Founding Pass" : "Free plan"}
          </Badge>
        </div>

        {isPass ? (
          <div className="mt-3 space-y-2 text-sm text-[#52525B]">
            <p>
              Your one-time Founding Pass is active—unlimited invoices, 1-click
              WhatsApp nudges, and 12 months of V1.5 Document Chaser are
              included.
            </p>
            {profile.founding_pass_unlocked_at && (
              <p className="text-xs">
                Unlocked on{" "}
                <span className="font-mono text-[#111111]">
                  {formatDateUtc(profile.founding_pass_unlocked_at)}
                </span>
              </p>
            )}
            {profile.dodo_payment_id && (
              <p className="text-xs">
                Payment reference:{" "}
                <code className="rounded bg-[#F4F4F5] px-1.5 py-0.5 font-mono text-[#111111]">
                  {profile.dodo_payment_id}
                </code>
              </p>
            )}
            <p className="pt-1 text-xs">
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
            <p className="text-sm text-[#52525B]">
              You&apos;re on the Free plan (1 active invoice at a time). Upgrade
              once for $19 to unlock unlimited invoices and 1-click WhatsApp
              nudges—no recurring subscription.
            </p>
            <UpgradeCheckoutButton label="Unlock Founding Pass — $19" />
          </div>
        )}
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
