"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import { Button } from "@/components/ui/button";

const MAX_POLL_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 2000;

export function CheckoutReturnHandler({
  isFree,
  checkoutReturn,
  checkoutFailed,
  checkoutExplicitSuccess,
  wantsUpgrade,
  passwordReset,
  supportEmail,
}: {
  isFree: boolean;
  checkoutReturn: boolean;
  checkoutFailed: boolean;
  checkoutExplicitSuccess: boolean;
  wantsUpgrade: boolean;
  passwordReset: boolean;
  supportEmail: string;
}) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [upgradeStatus, setUpgradeStatus] = useState<
    "idle" | "starting" | "error"
  >(wantsUpgrade && isFree && !checkoutReturn ? "starting" : "idle");
  const [upgradeError, setUpgradeError] = useState("");
  const upgradeStartedRef = useRef(false);

  const shouldPoll =
    checkoutReturn && !checkoutFailed && isFree && attempts < MAX_POLL_ATTEMPTS;

  useEffect(() => {
    if (!shouldPoll) return;
    const timer = window.setTimeout(() => {
      setAttempts((prev) => prev + 1);
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [shouldPoll, attempts, router]);

  useEffect(() => {
    if (
      !wantsUpgrade ||
      !isFree ||
      checkoutReturn ||
      upgradeStartedRef.current
    ) {
      return;
    }

    upgradeStartedRef.current = true;
    let active = true;

    async function resumeCheckout() {
      try {
        const response = await fetch("/api/checkout", { method: "POST" });
        const data = (await response.json().catch(() => ({}))) as {
          checkoutUrl?: string;
          error?: string;
        };

        if (!active) return;

        if (!response.ok || !data.checkoutUrl) {
          setUpgradeStatus("error");
          setUpgradeError(
            data.error ?? "Could not start checkout. Please try again."
          );
          return;
        }

        if (data.checkoutUrl.startsWith("/")) {
          router.push(data.checkoutUrl);
          return;
        }

        window.location.assign(data.checkoutUrl);
      } catch {
        if (!active) return;
        setUpgradeStatus("error");
        setUpgradeError("Network error starting checkout.");
      }
    }

    resumeCheckout();

    return () => {
      active = false;
    };
  }, [wantsUpgrade, isFree, checkoutReturn, router]);

  const pollTimedOut =
    checkoutReturn && !checkoutFailed && isFree && attempts >= MAX_POLL_ATTEMPTS;

  return (
    <>
      {passwordReset && (
        <div
          role="status"
          className="rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] px-5 py-3.5 text-sm font-medium text-[#14532D]"
        >
          Your password has been updated.
        </div>
      )}

      {checkoutFailed && (
        <div
          role="alert"
          className="rounded-2xl border border-[#FDE047] bg-[#FEF9C3] px-5 py-3.5 text-sm text-[#713F12]"
        >
          Payment didn&apos;t go through. No charge was made—try another
          payment method or retry anytime.
        </div>
      )}

      {checkoutReturn && !checkoutFailed && !isFree && (
        <div
          role="status"
          className="rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] px-5 py-3.5 text-sm text-[#14532D]"
        >
          Founding Pass unlocked! Unlimited active invoices and 1-click WhatsApp
          nudges are now active.
        </div>
      )}

      {checkoutReturn && !checkoutFailed && isFree && !pollTimedOut && (
        <div
          role="status"
          className="rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] px-5 py-3.5 text-sm text-[#14532D]"
        >
          {checkoutExplicitSuccess
            ? "Payment received! Confirming your Founding Pass..."
            : "Checking your Founding Pass status..."}
        </div>
      )}

      {pollTimedOut && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-2xl border border-[#FDE047] bg-[#FEF9C3] px-5 py-4 text-sm text-[#713F12] sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            Still waiting for payment confirmation. If you cancelled checkout,
            no charge was made; if you completed payment, check again or email{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="font-semibold text-[#111111] underline"
            >
              {supportEmail}
            </a>
            .
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAttempts(0);
              router.refresh();
            }}
            className="shrink-0"
          >
            Check status
          </Button>
        </div>
      )}

      {wantsUpgrade && !checkoutReturn && isFree && upgradeStatus === "starting" && (
        <div
          role="status"
          className="rounded-2xl border border-black/[0.08] bg-[#FFF1A8] px-5 py-3.5 text-sm font-medium text-[#4B4116]"
        >
          Opening $19 Founding Pass checkout...
        </div>
      )}

      {wantsUpgrade && !checkoutReturn && isFree && upgradeStatus === "error" && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-[#FECDD3] bg-[#FFE4E6] px-5 py-4 text-sm text-[#9F1239] sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{upgradeError}</p>
          <UpgradeCheckoutButton
            variant="compact"
            label="Retry $19 checkout"
            className="shrink-0"
          />
        </div>
      )}

      {wantsUpgrade && !checkoutReturn && !isFree && (
        <div
          role="status"
          className="rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] px-5 py-3.5 text-sm text-[#14532D]"
        >
          You already have the Founding Pass unlocked.
        </div>
      )}
    </>
  );
}
