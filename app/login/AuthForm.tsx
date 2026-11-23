"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, signUpAction, type AuthFormState } from "./actions";

const INITIAL_STATE: AuthFormState = {};

export function AuthForm({ disabled }: { disabled: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInFormAction, signInPending] = useActionState(
    signInAction,
    INITIAL_STATE
  );
  const [signUpState, signUpFormAction, signUpPending] = useActionState(
    signUpAction,
    INITIAL_STATE
  );

  const isSignIn = mode === "signin";
  const activeState = isSignIn ? signInState : signUpState;
  const pending = isSignIn ? signInPending : signUpPending;

  return (
    <div>
      {/* Mode Switcher */}
      <div
        role="tablist"
        aria-label="Authentication mode"
        className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isSignIn}
          onClick={() => setMode("signin")}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isSignIn
              ? "border border-border bg-card text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isSignIn}
          onClick={() => setMode("signup")}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            !isSignIn
              ? "border border-border bg-card text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Create account
        </button>
      </div>

      {activeState.error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-destructive-border bg-destructive-surface px-4 py-3 text-sm text-[#991b1b]"
        >
          {activeState.error}
        </div>
      )}

      {activeState.success && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-success-border bg-success-surface px-4 py-3 text-sm text-success-foreground"
        >
          {activeState.success}
        </div>
      )}

      <form
        action={isSignIn ? signInFormAction : signUpFormAction}
        className="mt-5 space-y-4"
      >
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
          <Label htmlFor="auth-password">Password</Label>
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
    </div>
  );
}
