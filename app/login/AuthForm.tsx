"use client";

import { useActionState, useState } from "react";
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
        className="grid grid-cols-2 rounded-xl bg-slate-100 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isSignIn}
          onClick={() => setMode("signin")}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            isSignIn
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isSignIn}
          onClick={() => setMode("signup")}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            !isSignIn
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Create account
        </button>
      </div>

      {activeState.error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {activeState.error}
        </div>
      )}

      {activeState.success && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {activeState.success}
        </div>
      )}

      <form
        action={isSignIn ? signInFormAction : signUpFormAction}
        className="mt-5 space-y-4"
      >
        <div>
          <label
            htmlFor="auth-email"
            className="block text-sm font-medium text-slate-800"
          >
            Email
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={disabled}
            placeholder="you@studio.com"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="block text-sm font-medium text-slate-800"
          >
            Password
          </label>
          <input
            id="auth-password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={isSignIn ? "current-password" : "new-password"}
            disabled={disabled}
            placeholder="At least 6 characters"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={disabled || pending}
          className="w-full rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
        >
          {pending
            ? isSignIn
              ? "Signing in..."
              : "Creating account..."
            : isSignIn
              ? "Sign in to PingCue"
              : "Create free account"}
        </button>
      </form>
    </div>
  );
}
