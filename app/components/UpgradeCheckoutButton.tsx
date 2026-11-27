"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export function UpgradeCheckoutButton({
  label = "Unlock Founding Pass — $19",
  variant = "default",
  className = "",
}: {
  label?: string;
  variant?: "default" | "compact";
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (response.status === 401) {
        trackEvent("checkout_redirect_login");
        router.push("/login?upgrade=1");
        return;
      }

      if (!response.ok || !data.checkoutUrl) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

      trackEvent("checkout_initiated");

      if (data.checkoutUrl.startsWith("/")) {
        router.push(data.checkoutUrl);
        return;
      }

      window.location.assign(data.checkoutUrl);
    } catch {
      setError("Network error starting checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="default"
        size={variant === "compact" ? "sm" : "default"}
        onClick={handleCheckout}
        disabled={loading}
        className={className}
      >
        <span>{loading ? "Opening checkout..." : label}</span>
        {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </Button>
      {error && (
        <p role="alert" className="text-xs font-medium text-[#BE123C]">
          {error}
        </p>
      )}
    </div>
  );
}
