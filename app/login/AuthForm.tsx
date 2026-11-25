"use client";

import { useActionState, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  type AuthFormState,
} from "./actions";

const INITIAL_STATE: AuthFormState = {};

export type AuthMode = "signin" | "signup" | "forgot";

export function AuthForm({
  disabled,
  upgrade = false,
  initialMode = "signin",
  callbackError,
}: {
  disabled: boolean;
  upgrade?: boolean;
  initialMode?: AuthMode;
  callbackError?: string;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [hideCallbackError, setHideCallbackError] = useState(false);

  const [signInState, signInFormAction, signInPending] = useActionState(
    signInAction,
    INITIAL_STATE
  );
  const [signUpState, signUpFormAction, signUpPending] = useActionState(
    signUpAction,
    INITIAL_STATE
  );
  const [resetState, resetFormAction, resetPending] = useActionState(
    requestPasswordResetAction,
    INITIAL_STATE
  );

  const isSignIn = mode === "signin";
  const isForgot = mode === "forgot";
  const activeState = isForgot
    ? resetState
    : isSignIn
      ? signInState
      : signUpState;
  const pending = isForgot
    ? resetPending
    : isSignIn
      ? signInPending
      : signUpPending;

  const visibleError =
    activeState.error ??
    (!hideCallbackError && !activeState.success ? callbackError : undefined);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setHideCallbackError(true);
  }

  return (
    <div>
      {upgrade && (
        <div
          role="note"
          className="mb-4 rounded-2xl border border-black/[0.08] bg-[#FFF1A8] px-4 py-3 text-xs font-medium leading-relaxed text-[#4B4116]"
        >
          Sign in or create a free account to continue to your{" "}
          <span className="font-semibold text-[#111111]">
            $19 Founding Pass
          </span>{" "}
          checkout.
        </div>
      )}

      {isForgot ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#111111]">
              Reset your password
            </h2>
            <p className="mt-0.5 text-xs text-[#52525B]">
              We&apos;ll email you a secure link to choose a new password.
            </p>
          </div>
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F4F4F5] px-3 py-1.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#EAEAEF] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            <span>Sign in</span>
          </button>
        </div>
      ) : (
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="grid grid-cols-2 gap-1 rounded-full bg-[#F4F4F5] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isSignIn}
            onClick={() => switchMode("signin")}
            className={`rounded-full py-2 text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] ${
              isSignIn
                ? "bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#52525B] hover:text-[#111111]"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isSignIn}
            onClick={() => switchMode("signup")}
            className={`rounded-full py-2 text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] ${
              !isSignIn
                ? "bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#52525B] hover:text-[#111111]"
            }`}
          >
            Create account
          </button>
        </div>
      )}

      {visibleError && (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-[#FECDD3] bg-[#FFE4E6] px-4 py-3 text-sm text-[#9F1239]"
        >
          {visibleError}
        </div>
      )}

      {activeState.success && (
        <div
          role="status"
          className="mt-4 rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] px-4 py-3 text-sm text-[#14532D]"
        >
          {activeState.success}
        </div>
      )}

      {isForgot ? (
        <form action={resetFormAction} className="mt-5 space-y-4">
          <div>
            <Label htmlFor="reset-email">Account email</Label>
            <Input
              id="reset-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={disabled}
              placeholder="you@studio.com"
              className="mt-1.5"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={disabled || pending}
            className="w-full"
          >
            {pending ? "Sending reset link..." : "Send reset link"}
          </Button>
        </form>
      ) : (
        <form
          action={isSignIn ? signInFormAction : signUpFormAction}
          className="mt-5 space-y-4"
        >
          {upgrade && <input type="hidden" name="upgrade" value="1" />}

          <div>
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={disabled}
              placeholder="you@studio.com"
              className="mt-1.5"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="auth-password">Password</Label>
              {isSignIn && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-xs font-medium text-[#52525B] underline transition-colors hover:text-[#111111] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <Input
              id="auth-password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              disabled={disabled}
              placeholder="At least 6 characters"
              className="mt-1.5"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={disabled || pending}
            className="w-full"
          >
            {pending
              ? isSignIn
                ? "Signing in..."
                : "Creating account..."
              : isSignIn
                ? "Sign in to PingCue"
                : "Create free account"}
          </Button>
        </form>
      )}
    </div>
  );
}
