"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

type AuthState = "loading" | "authorized" | "waitlisted" | "unauthorized";

/**
 * Client-side auth guard for dashboard pages.
 * Checks access level by hitting a lightweight endpoint.
 */
export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace(ROUTES.SIGN_IN);
      return;
    }

    // Check access level via API
    fetch("/api/auth/check-access")
      .then((res) => res.json())
      .then((data) => {
        if (data.level === "admin" || data.level === "member") {
          setAuthState("authorized");
        } else if (data.level === "waitlisted") {
          router.replace("/waitlist");
        } else {
          setAuthState("unauthorized");
        }
      })
      .catch(() => {
        // If the check API fails (e.g. DB down), allow access
        // to avoid locking users out during DB maintenance
        setAuthState("authorized");
      });
  }, [isLoaded, isSignedIn, user, router]);

  if (authState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0EB]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4834A] border-t-transparent" />
          <p className="font-[family-name:var(--font-inter)] text-sm text-[#7A6F65]">
            <span className="font-[family-name:var(--font-instrument-serif)] italic">Checking</span> access...
          </p>
        </div>
      </div>
    );
  }

  if (authState !== "authorized") {
    return null; // Redirecting
  }

  return <>{children}</>;
}
