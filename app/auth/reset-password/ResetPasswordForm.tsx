"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordAction, type ResetPasswordState } from "./actions";

const INITIAL_STATE: ResetPasswordState = {};

export function ResetPasswordForm({ email }: { email?: string }) {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    INITIAL_STATE
  );

  return (
    <form action={formAction} className="space-y-4">
      {email && (
        <p className="rounded-xl border border-black/[0.06] bg-[#FAFAFA] px-3.5 py-2 text-xs text-[#52525B]">
          Account: <span className="font-mono text-[#111111]">{email}</span>
        </p>
      )}

      {state.error && (
        <div
          role="alert"
          className="rounded-2xl border border-[#FECDD3] bg-[#FFE4E6] px-4 py-3 text-sm text-[#9F1239]"
        >
          {state.error}
        </div>
      )}

      <div>
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          name="confirm_password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          className="mt-1.5"
        />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Updating password..." : "Update password"}
      </Button>
    </form>
  );
}
