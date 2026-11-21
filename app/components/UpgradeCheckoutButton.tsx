"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpgradeCheckoutButton({
  label = "Unlock Founding Pass — $19",
  variant = "accent",
  className = "",
}: {
  label?: string;
  variant?: "accent" | "compact";
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
        router.push("/login?upgrade=1");
        return;
      }

      if (!response.ok || !data.checkoutUrl) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

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

  const baseStyles =
    variant === "compact"
      ? "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C2410C] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#9A3412] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
      : "inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[#9A3412] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer";

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={`${baseStyles} ${className}`.trim()}
      >
        <span>{loading ? "Opening checkout..." : label}</span>
      </button>
      {error && (
        <p role="alert" className="text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
