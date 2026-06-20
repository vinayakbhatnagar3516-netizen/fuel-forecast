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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-12">
      {/* subtle kolam geometry */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <KolamGrid className="text-ink" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href={ROUTES.HOME} className="inline-flex flex-col items-center gap-2">
            <YantraMark size={48} color="#1A1F2E" />
            <div className="flex flex-col items-center">
              <h1 className="font-[family-name:var(--font-instrument-serif)] text-2xl font-semibold italic tracking-tight text-ink">
                Fuel Forecast
              </h1>
              <p className="font-[family-name:var(--font-inter)] text-[10px] font-medium uppercase tracking-widest text-ink-muted">
                Demand intelligence
              </p>
            </div>
          </Link>
          <p className="mt-3 font-[family-name:var(--font-source-serif)] text-sm text-ink-muted">
            Start your free pilot
          </p>
          <LotusRule color="#C47335" className="mx-auto mt-4 w-20" />
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border border-hairline rounded-sm bg-white",
              headerTitle: "font-[family-name:var(--font-inter)] text-lg text-ink",
              headerSubtitle: "font-[family-name:var(--font-source-serif)] text-sm text-ink-muted",
              formButtonPrimary:
                "bg-ink hover:bg-ink/90 text-canvas font-[family-name:var(--font-inter)] text-sm font-medium rounded-sm",
              formFieldInput:
                "border-hairline rounded-sm text-ink focus:border-saffron focus:ring-saffron",
              footerActionLink: "text-saffron hover:text-saffron-deep",
              socialButtonsBlockButton:
                "border-hairline hover:bg-canvas font-[family-name:var(--font-inter)] text-sm text-ink rounded-sm",
              dividerLine: "bg-hairline",
              dividerText: "font-[family-name:var(--font-source-serif)] text-xs text-ink-muted",
            },
          }}
        />

        <p className="mt-6 text-center font-[family-name:var(--font-source-serif)] text-xs text-ink-muted">
          Already have an account?{" "}
          <Link
            href={ROUTES.SIGN_IN}
            className="font-[family-name:var(--font-inter)] text-saffron hover:text-saffron-deep"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
