import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — Fuel Forecast",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E]">
            Fuel Forecast
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start your free pilot
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border border-border rounded-sm",
              headerTitle: "font-heading text-lg text-[#1A1F2E]",
              headerSubtitle: "text-muted-foreground text-sm",
              formButtonPrimary:
                "bg-[#2C3E50] hover:bg-[#3D5166] text-white font-medium rounded-sm",
              formFieldInput:
                "border-border rounded-sm text-foreground focus:ring-[#C47335]",
              footerActionLink: "text-[#C47335] hover:text-[#A8622D]",
            },
          }}
        />
      </div>
    </div>
  );
}
