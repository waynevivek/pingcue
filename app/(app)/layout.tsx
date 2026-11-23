import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { BrandMark } from "@/app/components/BrandMark";
import { signOutAction } from "@/app/login/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserProfile, requireUser } from "@/lib/db";

async function UserNavStatus() {
  const { user } = await requireUser();
  const profile = await getUserProfile(user.id, user.email ?? "");
  const isPass = profile.plan === "founding_pass";

  return (
    <div className="flex items-center gap-3">
      <Badge
        variant={isPass ? "primary" : "neutral"}
        className="hidden sm:inline-flex"
      >
        {isPass ? "Founding Pass" : "Free plan"}
      </Badge>
      <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground md:inline">
        {profile.email || user.email}
      </span>
      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5 sm:gap-6">
            <Link
              href="/dashboard"
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <BrandMark />
            </Link>

            <nav
              aria-label="App navigation"
              className="flex items-center gap-2 sm:gap-3 text-sm font-medium"
            >
              <Link
                href="/dashboard"
                className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Dashboard
              </Link>
              <Link
                href="/invoices"
                className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Invoices
              </Link>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/invoices/new">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>New invoice</span>
                </Link>
              </Button>
            </nav>
          </div>

          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="h-8 w-32 animate-pulse rounded-lg bg-muted"
              />
            }
          >
            <UserNavStatus />
          </Suspense>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
