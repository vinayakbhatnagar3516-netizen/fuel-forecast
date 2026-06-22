"use client";

import { UserProfile } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="page-heading"><span className="accent">My</span> Account</div>
        <div className="page-sub">Profile · Notifications · Sign out</div>
      </div>

      <div className="card-slate overflow-hidden">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0 bg-transparent",
              navbar: "hidden",
              pageScrollBox: "p-6",
              headerTitle: "font-[family-name:var(--font-inter)] text-lg text-[#1a1d21]",
              headerSubtitle: "font-[family-name:var(--font-inter)] text-sm text-[#5a626d]",
              formButtonPrimary: "bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-[family-name:var(--font-inter)] text-sm font-medium rounded-sm",
              formFieldInput: "border-[#d0d5db] rounded-sm text-[#1a1d21] focus:border-[#2563eb] focus:ring-[#2563eb]",
              footerActionLink: "text-[#2563eb] hover:text-[#1d4ed8]",
              profileSectionTitle: "font-[family-name:var(--font-inter)] text-base text-[#1a1d21]",
              profileSectionContent: "font-[family-name:var(--font-inter)] text-sm text-[#5a626d]",
            },
          }}
        />
      </div>

      {/* Notification Preferences */}
      <div className="card-accent accent-blue">
        <h3 className="heading-sm mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[#e4e8ed]">
            <span className="text-[13px]">Daily forecast ready</span>
            <span className="badge badge-green">ON</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#e4e8ed]">
            <span className="text-[13px]">Stockout alert (≤3 days stock)</span>
            <span className="badge badge-green">ON</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#e4e8ed]">
            <span className="text-[13px]">Weekly P&amp;L summary</span>
            <span className="badge badge-blue">OFF</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[13px]">System health alerts</span>
            <span className="badge badge-green">ON</span>
          </div>
        </div>
      </div>

      {/* Session */}
      <div className="card-accent accent-slate">
        <h3 className="heading-sm mb-2">Session</h3>
        <p className="text-[13px] text-[#5a626d] mb-3">Sign out from Fuel Forecast on this device.</p>
        <SignOutButton redirectUrl="/">
          <Button variant="outline" className="rounded-sm border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white font-[family-name:var(--font-inter)]">
            <LogOut className="mr-2 size-4" />
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
