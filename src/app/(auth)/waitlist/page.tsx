import Link from "next/link";
import type { Metadata } from "next";
import { YantraMark, KolamGrid, LotusRule } from "@/components/indic-motifs";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Waitlist — Fuel Forecast",
};

export default function WaitlistPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F0EB] px-4 py-12">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <KolamGrid className="text-[#D4834A]" />
      </div>
      <div className="absolute bottom-0 right-0 w-40 h-60 opacity-[0.025] pointer-events-none deodar-accent" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8">
          <div className="flex flex-col items-center gap-2">
            <YantraMark size={48} color="#D4834A" />
            <div className="flex flex-col items-center">
              <h1 className="font-[family-name:var(--font-instrument-serif)] text-2xl font-semibold italic tracking-tight text-[#2D2A26]">
                Fuel Forecast
              </h1>
              <p className="font-[family-name:var(--font-inter)] text-[10px] font-medium uppercase tracking-widest text-[#7A6F65]">
                Demand intelligence
              </p>
            </div>
          </div>
          <LotusRule color="#D4834A" className="mx-auto mt-6 w-20" />
        </div>

        <div className="rounded-sm border border-[#E0D6CC] bg-[#FFFAF5] p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0EDE6]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4834A" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h2 className="font-[family-name:var(--font-inter)] text-xl font-normal tracking-tight text-[#2D2A26]">
            You&apos;re on the waitlist
          </h2>
          <p className="mt-3 font-[family-name:var(--font-source-serif)] text-sm leading-relaxed text-[#7A6F65]">
            Fuel Forecast is currently in a private pilot phase. We&apos;ll
            notify you at your registered email once your access is approved.
          </p>
          <div className="mt-6 rounded-xs bg-[#F0EDE6] border border-[#E0D6CC] p-4">
            <p className="text-xs font-medium text-[#7A6F65] uppercase tracking-wider font-[family-name:var(--font-inter)]">
              What happens next
            </p>
            <ol className="mt-3 space-y-2 text-left">
              {[
                "We review your sign-up within 1–2 business days",
                "You receive an email notification when approved",
                "Sign in to configure your pump station and run forecasts",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 font-[family-name:var(--font-source-serif)] text-sm text-[#7A6F65]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(212,131,74,0.1)] text-[10px] font-semibold text-[#D4834A]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="mt-6 text-center font-[family-name:var(--font-source-serif)] text-xs text-[#7A6F65]">
          Signed up with the wrong account?{" "}
          <Link
            href={ROUTES.SIGN_IN}
            className="font-[family-name:var(--font-inter)] text-[#D4834A] hover:text-[#B86A34]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
