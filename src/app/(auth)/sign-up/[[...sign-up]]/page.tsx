import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { ROUTES } from "@/lib/constants";
import { YantraMark, KolamGrid, LotusRule } from "@/components/indic-motifs";

export const metadata: Metadata = {
  title: "Sign Up — Fuel Forecast",
};

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F0EB] px-4 py-12">
      {/* subtle kolam geometry + deodar silhouette */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <KolamGrid className="text-[#D4834A]" />
      </div>
      <div className="absolute bottom-0 right-0 w-40 h-60 opacity-[0.025] pointer-events-none deodar-accent" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href={ROUTES.HOME} className="inline-flex flex-col items-center gap-2">
            <YantraMark size={48} color="#D4834A" />
            <div className="flex flex-col items-center">
              <h1 className="font-[family-name:var(--font-instrument-serif)] text-2xl font-semibold italic tracking-tight text-[#2D2A26]">
                Fuel Forecast
              </h1>
              <p className="font-[family-name:var(--font-inter)] text-[10px] font-medium uppercase tracking-widest text-[#7A6F65]">
                Demand intelligence
              </p>
            </div>
          </Link>
          <p className="mt-3 font-[family-name:var(--font-source-serif)] text-sm text-[#7A6F65]">
            Start your free pilot
          </p>
          <LotusRule color="#D4834A" className="mx-auto mt-4 w-20" />
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border border-[#E0D6CC] rounded-sm bg-[#FFFAF5]",
              headerTitle: "font-[family-name:var(--font-inter)] text-lg text-[#2D2A26]",
              headerSubtitle: "font-[family-name:var(--font-source-serif)] text-sm text-[#7A6F65]",
              formButtonPrimary:
                "bg-[#2D2A26] hover:bg-[#2D2A26]/90 text-[#FFFAF5] font-[family-name:var(--font-inter)] text-sm font-medium rounded-sm",
              formFieldInput:
                "border-[#E0D6CC] rounded-sm text-[#2D2A26] focus:border-[#D4834A] focus:ring-[#D4834A]",
              footerActionLink: "text-[#D4834A] hover:text-[#B86A34]",
              socialButtonsBlockButton:
                "border-[#E0D6CC] hover:bg-[#F0EDE6] font-[family-name:var(--font-inter)] text-sm text-[#2D2A26] rounded-sm",
              dividerLine: "bg-[#E0D6CC]",
              dividerText: "font-[family-name:var(--font-source-serif)] text-xs text-[#7A6F65]",
            },
          }}
        />

        <p className="mt-6 text-center font-[family-name:var(--font-source-serif)] text-xs text-[#7A6F65]">
          Already have an account?{" "}
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
