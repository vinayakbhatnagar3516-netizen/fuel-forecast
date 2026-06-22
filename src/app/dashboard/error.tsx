"use client";

import { YantraMark } from "@/components/indic-motifs";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm text-center">
        <YantraMark size={40} color="#8B3A3A" className="mx-auto" />
        <h2 className="mt-4 font-[family-name:var(--font-inter)] text-lg font-normal text-ink">
          Dashboard error
        </h2>
        <p className="mt-2 font-[family-name:var(--font-source-serif)] text-sm text-ink-muted">
          Something went wrong loading this section.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-3 rounded-xs border border-hairline bg-red-50 p-2 font-mono text-xs text-red-700 text-left break-all">
            {error.message || "Unknown error"}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-sm border border-saffron bg-ink px-4 py-2 font-[family-name:var(--font-inter)] text-sm font-medium text-canvas transition hover:bg-ink/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
