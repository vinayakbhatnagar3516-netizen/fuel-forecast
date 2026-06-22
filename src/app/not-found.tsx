import Link from "next/link";
import type { Metadata } from "next";
import { ROUTES } from "@/lib/constants";
import { YantraMark, KolamGrid, LotusRule } from "@/components/indic-motifs";

export const metadata: Metadata = {
  title: "Page Not Found — Fuel Forecast",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-12">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <KolamGrid className="text-ink" />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
        <YantraMark size={56} color="#C47335" className="mx-auto opacity-50" />
        <h1 className="mt-6 font-[family-name:var(--font-instrument-serif)] text-4xl font-semibold italic tracking-tight text-ink">
          404
        </h1>
        <p className="mt-2 font-[family-name:var(--font-inter)] text-base text-ink-muted">
          Page not found
        </p>
        <p className="mt-4 font-[family-name:var(--font-source-serif)] text-sm leading-relaxed text-ink-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <LotusRule color="#C47335" className="mx-auto mt-6 w-16" />
        <div className="mt-8">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 rounded-sm border border-saffron bg-ink px-5 py-2.5 font-[family-name:var(--font-inter)] text-sm font-medium text-canvas transition hover:bg-ink/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
