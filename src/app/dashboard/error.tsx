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
        <YantraMark size={40} color="#A04040" className="mx-auto" />
        <h2 className="mt-4 font-[family-name:var(--font-inter)] text-lg font-normal text-[#2D2A26]">
          Dashboard error
        </h2>
        <p className="mt-2 font-[family-name:var(--font-source-serif)] text-sm text-[#7A6F65]">
          Something went wrong loading this section.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-3 rounded-xs border border-[#E0D6CC] bg-red-50 p-2 font-mono text-xs text-red-700 text-left break-all">
            {error.message || "Unknown error"}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-sm border border-[#D4834A] bg-[#2D2A26] px-4 py-2 font-[family-name:var(--font-inter)] text-sm font-medium text-[#FFFAF5] transition hover:bg-[#2D2A26]/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
