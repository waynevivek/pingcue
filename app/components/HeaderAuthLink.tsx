"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Keeps the homepage statically cacheable (no server cookie reads / no-store)
 * while upgrading "Sign in" to "Dashboard" locally via getSession() when a
 * Supabase browser session cookie is already present.
 */
export function HeaderAuthLink() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anonKey = (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )?.trim();

    if (!url || !anonKey) return;

    let cancelled = false;
    try {
      const supabase = createBrowserClient(url, anonKey);
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (!cancelled && data.session?.user) {
            setIsSignedIn(true);
          }
        })
        .catch(() => {});
    } catch {
      // Fall back to Sign in link
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href={isSignedIn ? "/dashboard" : "/login"}
      className="inline-flex min-w-[66px] items-center justify-center whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#F4F4F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:min-w-[92px] sm:px-4 sm:text-[13.5px]"
    >
      {isSignedIn ? "Dashboard" : "Sign in"}
    </Link>
  );
}
