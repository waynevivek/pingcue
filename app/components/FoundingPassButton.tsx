"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UpgradeCheckoutButton } from "./UpgradeCheckoutButton";

type FoundingPassButtonProps = {
  label?: string;
  mobileLabel?: string;
  source: "nav" | "hero" | "pricing" | "footer";
  variant?: "primary" | "compact" | "inverted";
  className?: string;
  checkoutLive?: boolean;
};

export function FoundingPassButton({
  label = "Get Founding Pass — $19",
  mobileLabel,
  source,
  variant = "primary",
  className = "",
  checkoutLive = false,
}: FoundingPassButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  function handleOpen() {
    setOpen(true);
    setStatus("idle");
    setErrorMessage("");

    // Log Founding Pass click intent immediately without blocking modal open
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "founding_pass_click", source }),
      keepalive: true,
    }).catch(() => {});
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "founding_pass_email",
          source,
          email: trimmed,
          website,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  const buttonVariant = variant === "inverted" ? "inverted" : "default";
  const buttonSize = variant === "compact" ? "sm" : "lg";

  return (
    <>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        onClick={handleOpen}
        className={className}
      >
        {mobileLabel ? (
          <>
            <span className="sm:hidden">{mobileLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
        <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="pt-5 sm:pt-5">
          <div className="flex h-8 items-center pr-10">
            <span className="inline-flex items-center rounded-full bg-[#111111] px-3 py-1 text-[11px] font-semibold text-white">
              One-time · No subscription
            </span>
          </div>

          <div
            aria-hidden="true"
            className="relative mt-3.5 mb-5 h-[56px] w-full overflow-hidden rounded-2xl bg-[#D6F7A3]"
          >
            <svg
              viewBox="0 0 400 80"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
              fill="none"
            >
              <rect width="400" height="80" fill="#FFE875" />
              <path
                d="M0 44C90 22 190 56 290 36C340 26 375 30 400 36V80H0V44Z"
                fill="#C8F392"
              />
              <path
                d="M0 60C120 46 250 72 400 54V80H0V60Z"
                fill="#A8EC62"
              />
              <circle cx="62" cy="24" r="10" fill="#FFFFFF" opacity="0.9" />
              <circle cx="152" cy="56" r="4" fill="#FFFFFF" />
              <circle cx="288" cy="52" r="4.5" fill="#FF9AA2" />
            </svg>
          </div>

          <DialogHeader>
            <DialogTitle>Lock in your $19 Founding Pass</DialogTitle>
            <DialogDescription>
              One-time $19 payment with no subscription. Unlocks unlimited active
              invoices, 1-click WhatsApp nudges, and 12 months of V1.5 Document
              Chaser.
            </DialogDescription>
          </DialogHeader>

          {status === "done" ? (
            <div className="mt-4 rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] p-4 text-[#14532D]">
              <p className="text-sm font-semibold">
                {checkoutLive
                  ? "You're on the updates list."
                  : "You're on the Founding Pass list."}
              </p>
              <p className="mt-1 text-sm text-[#14532D]/90">
                We recorded <span className="font-mono">{email.trim()}</span>.{" "}
                {checkoutLive
                  ? "We'll share major PingCue updates and let you know when V1.5 Document Chaser lands."
                  : "As soon as Dodo Payments checkout switches to live mode, we'll send your $19 one-time link first."}
              </p>
              <Button
                type="button"
                variant="default"
                className="mt-4 w-full"
                onClick={() => setOpen(false)}
              >
                Back to PingCue
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              {checkoutLive && (
                <>
                  <UpgradeCheckoutButton
                    label="Continue to $19 Checkout"
                    className="w-full"
                  />
                  <p className="mt-2 text-center text-xs text-[#52525B]">
                    7-day no-questions-asked refund · Secure checkout via Dodo
                    Payments
                  </p>

                  <div className="relative my-4 flex items-center">
                    <div className="grow border-t border-black/[0.08]" />
                    <span className="mx-3 shrink-0 text-xs text-[#52525B]">
                      or get product &amp; V1.5 updates
                    </span>
                    <div className="grow border-t border-black/[0.08]" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                <div className="sr-only" aria-hidden="true">
                  <Label htmlFor={`founding-website-${source}`}>Website</Label>
                  <Input
                    id={`founding-website-${source}`}
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`founding-email-${source}`}>Work email</Label>
                  <Input
                    id={`founding-email-${source}`}
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus={!checkoutLive}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") {
                        setStatus("idle");
                        setErrorMessage("");
                      }
                    }}
                    placeholder="you@studio.com"
                    aria-invalid={status === "error"}
                    className="mt-1.5"
                  />
                  {status === "error" && errorMessage && (
                    <p
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-[#BE123C]"
                    >
                      {errorMessage}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant={checkoutLive ? "outline" : "default"}
                  size="lg"
                  disabled={status === "submitting"}
                  className="w-full"
                >
                  {status === "submitting"
                    ? "Saving..."
                    : checkoutLive
                      ? "Send me product updates"
                      : "Lock in $19 Founding Pass"}
                </Button>

                <p className="text-center text-xs text-[#52525B]">
                  {checkoutLive
                    ? "No spam. Occasional launch & V1.5 Document Chaser updates only."
                    : "No spam. One email when checkout opens. No subscription ever."}
                </p>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
