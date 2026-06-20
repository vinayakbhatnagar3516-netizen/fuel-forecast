"use client";

import { UserProfile } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotusRule } from "@/components/indic-motifs";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 font-[family-name:var(--font-inter)] text-2xl font-normal tracking-tight text-ink">
          Manage your profile
        </h1>
        <p className="mt-1 font-[family-name:var(--font-source-serif)] text-sm text-ink-muted">
          Update your photo, email, password, and connected accounts.
        </p>
        <LotusRule color="#C47335" className="mt-4 w-24" />
      </div>

      <Card className="design-card shadow-none overflow-hidden">
        <CardContent className="p-0">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent",
                navbar: "hidden",
                pageScrollBox: "p-6",
                headerTitle: "font-[family-name:var(--font-inter)] text-lg text-ink",
                headerSubtitle: "font-[family-name:var(--font-source-serif)] text-sm text-ink-muted",
                formButtonPrimary:
                  "bg-ink hover:bg-ink/90 text-canvas font-[family-name:var(--font-inter)] text-sm font-medium rounded-sm",
                formFieldInput:
                  "border-hairline rounded-sm text-ink focus:border-saffron focus:ring-saffron",
                footerActionLink: "text-saffron hover:text-saffron-deep",
                profileSectionTitle: "font-[family-name:var(--font-inter)] text-base text-ink",
                profileSectionContent: "font-[family-name:var(--font-source-serif)] text-sm text-ink-muted",
              },
            }}
          />
        </CardContent>
      </Card>

      <Card className="design-card shadow-none">
        <CardContent className="p-6">
          <h2 className="font-[family-name:var(--font-inter)] text-base font-medium text-ink">
            Session
          </h2>
          <p className="mt-1 font-[family-name:var(--font-source-serif)] text-sm text-ink-muted">
            Sign out from Fuel Forecast on this device.
          </p>
          <SignOutButton redirectUrl="/">
            <Button
              variant="outline"
              className="mt-4 rounded-sm border-burgundy text-burgundy hover:bg-burgundy hover:text-white font-[family-name:var(--font-inter)]"
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          </SignOutButton>
        </CardContent>
      </Card>
    </div>
  );
}
