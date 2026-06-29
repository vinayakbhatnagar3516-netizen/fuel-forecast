import Link from "next/link";
import type { Metadata } from "next";
import { ROUTES } from "@/lib/constants";
import { YantraMark, KolamGrid, LotusRule } from "@/components/indic-motifs";

export const metadata: Metadata = {
  title: "Page Not Found — Fuel Forecast",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F0EB] px-4 py-12">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <KolamGrid className="text-[#D4834A]" />
      </div>
      <div className="absolute bottom-0 right-0 w-40 h-60 opacity-[0.025] pointer-events-none deodar-accent" />

      <div className="relative z-10 w-full max-w-sm text-center">
        <YantraMark size={56} color="#D4834A" className="mx-auto opacity-50" />
        <h1 className="mt-6 font-[family-name:var(--font-instrument-serif)] text-4xl font-semibold italic tracking-tight text-[#2D2A26]">
          404
        </h1>
        <p className="mt-2 font-[family-name:var(--font-inter)] text-base text-[#7A6F65]">
          Page not found
        </p>
        <p className="mt-4 font-[family-name:var(--font-source-serif)] text-sm leading-relaxed text-[#7A6F65]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <LotusRule color="#D4834A" className="mx-auto mt-6 w-16" />
        <div className="mt-8">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 rounded-sm border border-[#D4834A] bg-[#2D2A26] px-5 py-2.5 font-[family-name:var(--font-inter)] text-sm font-medium text-[#FFFAF5] transition hover:bg-[#2D2A26]/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
