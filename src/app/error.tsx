"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { YantraMark } from "@/components/indic-motifs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
          <div className="w-full max-w-sm text-center">
            <YantraMark size={48} color="#8B3A3A" />
            <h1 className="mt-6 font-[family-name:var(--font-inter)] text-2xl font-normal tracking-tight text-ink">
              Something went wrong
            </h1>
            <p className="mt-3 font-[family-name:var(--font-source-serif)] text-sm leading-relaxed text-ink-muted">
              An unexpected error occurred. Our team has been notified.
            </p>
            {process.env.NODE_ENV === "development" && (
              <p className="mt-4 rounded-xs border border-hairline bg-red-50 p-3 font-mono text-xs text-red-700 text-left break-all">
                {error.message || "Unknown error"}
                {error.digest && (
                  <>
                    <br />
                    Digest: {error.digest}
                  </>
                )}
              </p>
            )}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-sm border border-saffron bg-ink px-5 py-2.5 font-[family-name:var(--font-inter)] text-sm font-medium text-canvas transition hover:bg-ink/90"
              >
                Try again
              </button>
              <Link
                href={ROUTES.HOME}
                className="inline-flex items-center gap-2 rounded-sm border border-hairline px-5 py-2.5 font-[family-name:var(--font-inter)] text-sm font-medium text-ink transition hover:bg-slate-50"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
