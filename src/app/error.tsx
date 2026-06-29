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
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#F5F0EB] px-4">
          <div className="w-full max-w-sm text-center">
            <YantraMark size={48} color="#A04040" />
            <h1 className="mt-6 font-[family-name:var(--font-inter)] text-2xl font-normal tracking-tight text-[#2D2A26]">
              Something went wrong
            </h1>
            <p className="mt-3 font-[family-name:var(--font-source-serif)] text-sm leading-relaxed text-[#7A6F65]">
              An unexpected error occurred. Our team has been notified.
            </p>
            {process.env.NODE_ENV === "development" && (
              <p className="mt-4 rounded-xs border border-[#E0D6CC] bg-red-50 p-3 font-mono text-xs text-red-700 text-left break-all">
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
                className="inline-flex items-center gap-2 rounded-sm border border-[#D4834A] bg-[#2D2A26] px-5 py-2.5 font-[family-name:var(--font-inter)] text-sm font-medium text-[#FFFAF5] transition hover:bg-[#2D2A26]/90"
              >
                Try again
              </button>
              <Link
                href={ROUTES.HOME}
                className="inline-flex items-center gap-2 rounded-sm border border-[#E0D6CC] px-5 py-2.5 font-[family-name:var(--font-inter)] text-sm font-medium text-[#2D2A26] transition hover:bg-[#F0EDE6]"
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
