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
  source: "nav" | "hero" | "pricing" | "footer";
  variant?: "primary" | "compact" | "inverted";
  className?: string;
  checkoutLive?: boolean;
};

export function FoundingPassButton({
  label = "Get Founding Pass — $19",
  source,
  variant = "primary",
  className = "",
  checkoutLive = false,
}: FoundingPassButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
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
        <span>{label}</span>
        <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lock in your $19 Founding Pass</DialogTitle>
            <DialogDescription>
              One-time $19 payment with no subscription. Unlocks unlimited active
              invoices, 1-click WhatsApp nudges, and 12 months of V1.5 Document
              Chaser.
            </DialogDescription>
          </DialogHeader>

          {status === "done" ? (
            <div className="mt-4 rounded-lg border border-success-border bg-success-surface p-4">
              <p className="text-sm font-semibold text-success-foreground">
                You&apos;re on the Founding Pass list.
              </p>
              <p className="mt-1 text-sm text-success-foreground/90">
                We recorded <span className="font-mono">{email.trim()}</span>. As
                soon as Dodo Payments checkout switches to live mode, we&apos;ll
                send your $19 one-time link first.
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

                  <div className="relative my-4 flex items-center">
                    <div className="grow border-t border-border" />
                    <span className="mx-3 shrink-0 text-xs text-muted-foreground">
                      or save your email for launch updates
                    </span>
                    <div className="grow border-t border-border" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                <div>
                  <Label htmlFor={`founding-email-${source}`}>Work email</Label>
                  <Input
                    id={`founding-email-${source}`}
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus
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
                      className="mt-1.5 text-xs font-medium text-[#991b1b]"
                    >
                      {errorMessage}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "submitting"}
                  className="w-full"
                >
                  {status === "submitting"
                    ? "Saving..."
                    : "Lock in $19 Founding Pass"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  No spam. One email when checkout opens. No subscription ever.
                </p>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
