"use client";

import { useEffect, useId, useRef, useState } from "react";

type FoundingPassButtonProps = {
  label?: string;
  source: "nav" | "hero" | "pricing" | "footer";
  variant?: "accent" | "primary" | "compact";
  className?: string;
};

export function FoundingPassButton({
  label = "Get Founding Pass — $19",
  source,
  variant = "accent",
  className = "",
}: FoundingPassButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const titleId = useId();
  const inputId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

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

  const buttonStyles = {
    accent:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#9A3412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer",
    primary:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer",
    compact:
      "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C2410C] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#9A3412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer",
  }[variant];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`${buttonStyles} ${className}`.trim()}
      >
        <span>{label}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4 shrink-0"
        >
          <path
            d="M4.5 10h11m0 0-4-4m4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-medium uppercase tracking-wider text-blue-700">
                  Founding Pass · $19 one-time
                </p>
                <h2
                  id={titleId}
                  className="mt-1 font-display text-2xl text-slate-900"
                >
                  Lock in your Founding Pass
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5"
                >
                  <path
                    d="M5.5 5.5 14.5 14.5M14.5 5.5 5.5 14.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {status === "done" ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-900">
                  You&apos;re on the Founding Pass list.
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  We recorded <span className="font-mono">{email.trim()}</span>.
                  As soon as Dodo Payments checkout switches to live mode,
                  we&apos;ll send your $19 one-time link first.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
                >
                  Back to PingCue
                </button>
              </div>
            ) : (
              <>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Live checkout is going through Dodo Payments verification now.
                  Leave your email and we&apos;ll lock in your{" "}
                  <strong className="text-slate-900">$19 one-time</strong>{" "}
                  Founding Pass (unlimited active invoices, 1-click WhatsApp
                  nudges, plus 12 months of V1.5 Document Chaser).
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
                  <div>
                    <label
                      htmlFor={inputId}
                      className="block text-sm font-medium text-slate-800"
                    >
                      Work email
                    </label>
                    <input
                      ref={inputRef}
                      id={inputId}
                      type="email"
                      required
                      autoComplete="email"
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
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    {status === "error" && errorMessage && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full rounded-lg bg-[#C2410C] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
                  >
                    {status === "submitting"
                      ? "Saving..."
                      : "Lock in $19 Founding Pass"}
                  </button>

                  <p className="text-center text-xs text-slate-500">
                    No spam. One email when checkout opens. No subscription ever.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
