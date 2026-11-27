"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [prevWantsUpgrade, setPrevWantsUpgrade] = useState(wantsUpgrade);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  if (wantsUpgrade !== prevWantsUpgrade) {
    setPrevWantsUpgrade(wantsUpgrade);
    if (upgradeError !== null) {
      setUpgradeError(null);
    }
  }

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
    if (!wantsUpgrade || !isFree || checkoutReturn) {
      return;
    }

    const controller = new AbortController();

    async function resumeCheckout() {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          signal: controller.signal,
        });
        const data = (await response.json().catch(() => ({}))) as {
          checkoutUrl?: string;
          error?: string;
        };

        if (controller.signal.aborted) return;

        if (!response.ok || !data.checkoutUrl) {
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
      } catch (err) {
        if (
          controller.signal.aborted ||
          (err instanceof DOMException && err.name === "AbortError")
        ) {
          return;
        }
        setUpgradeError("Network error starting checkout.");
      }
    }

    resumeCheckout();

    return () => {
      controller.abort();
    };
  }, [wantsUpgrade, isFree, checkoutReturn, router]);

  const pollTimedOut =
    checkoutReturn && !checkoutFailed && isFree && attempts >= MAX_POLL_ATTEMPTS;
  const upgradeStatus = !wantsUpgrade || !isFree || checkoutReturn
    ? "idle"
    : upgradeError
      ? "error"
      : "starting";

  return (
    <>
      {passwordReset && (
        <div
          role="status"
          className="rounded-[12px] border border-[#BBF7D0] bg-[#F2FDF5] px-4 py-3 text-xs font-medium text-[#14532D] sm:text-[13px]"
        >
          Your password has been updated.
        </div>
      )}

      {checkoutFailed && (
        <div
          role="alert"
          className="rounded-[12px] border border-[#FDE68A] bg-[#FEFDF0] px-4 py-3 text-xs text-[#713F12] sm:text-[13px]"
        >
          Payment didn&apos;t go through. No charge was made—try another
          payment method or retry anytime.
        </div>
      )}

      {checkoutReturn && !checkoutFailed && !isFree && (
        <div
          role="status"
          className="rounded-[12px] border border-[#BFE883] bg-[#F4FCE6] px-4 py-3 text-xs font-medium text-[#1A2E05] sm:text-[13px]"
        >
          Founding Pass unlocked! Unlimited active invoices and 1-tap WhatsApp
          nudges are now active.
        </div>
      )}

      {checkoutReturn && !checkoutFailed && isFree && !pollTimedOut && (
        <div
          role="status"
          className="rounded-[12px] border border-[#BBF7D0] bg-[#F2FDF5] px-4 py-3 text-xs font-medium text-[#14532D] sm:text-[13px]"
        >
          {checkoutExplicitSuccess
            ? "Payment received! Confirming your Founding Pass..."
            : "Checking your Founding Pass status..."}
        </div>
      )}

      {pollTimedOut && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-[12px] border border-[#FDE68A] bg-[#FEFDF0] px-4 py-3.5 text-xs text-[#713F12] sm:flex-row sm:items-center sm:justify-between sm:text-[13px]"
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
            className="shrink-0 rounded-[8px]"
          >
            Check status
          </Button>
        </div>
      )}

      {wantsUpgrade &&
        !checkoutReturn &&
        isFree &&
        upgradeStatus === "starting" && (
          <div
            role="status"
            className="rounded-[12px] border border-black/[0.08] bg-[#F8F9F6] px-4 py-3 text-xs font-medium text-[#111111] sm:text-[13px]"
          >
            Opening $19 Founding Pass checkout...
          </div>
        )}

      {wantsUpgrade && !checkoutReturn && isFree && upgradeStatus === "error" && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-[12px] border border-[#FECDD3] bg-[#FFF5F6] px-4 py-3.5 text-xs text-[#9F1239] sm:flex-row sm:items-center sm:justify-between sm:text-[13px]"
        >
          <p>{upgradeError}</p>
          <UpgradeCheckoutButton
            variant="compact"
            label="Retry $19 checkout"
            className="shrink-0 rounded-[8px]"
          />
        </div>
      )}

      {wantsUpgrade && !checkoutReturn && !isFree && (
        <div
          role="status"
          className="rounded-[12px] border border-[#BFE883] bg-[#F4FCE6] px-4 py-3 text-xs font-medium text-[#1A2E05] sm:text-[13px]"
        >
          You already have the Founding Pass unlocked.
        </div>
      )}
    </>
  );
}
