"use client";

import { usePathname, useRouter } from "next/navigation";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import {
  LayoutDashboard,
  TrendingUp,
  Truck,
  ClipboardPen,
  Settings,
  Activity,
  ChevronDown,
  LogOut,
  User,
  Mountain,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SITE, ROUTES } from "@/lib/constants";

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.TRENDS, label: "Forecast", icon: TrendingUp },
  { href: ROUTES.ORDERS, label: "Orders", icon: Truck },
  { href: ROUTES.DAILY_ENTRY, label: "Daily Entry", icon: ClipboardPen },
  { href: ROUTES.DIAGNOSTICS, label: "Model & Health", icon: Activity },
  { href: ROUTES.SETTINGS, label: "Settings", icon: Settings },
  { href: ROUTES.ACCOUNT, label: "Account", icon: User },
] as const;

function UserNav() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`
    : "?";
  const name = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "User";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-[#B0A89C] hover:bg-[#2A3E32] transition-colors cursor-pointer">
        <Avatar className="size-7">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback className="text-xs bg-[#D4834A] text-white">
            {initials || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 truncate text-left">
          <p className="truncate text-sm font-medium leading-tight text-[#E8E2DA]">{name}</p>
          <p className="truncate text-xs text-[#9A8B7A] leading-tight">
            {email || "No email"}
          </p>
        </div>
        <ChevronDown className="size-3.5 shrink-0 text-[#6A5D50]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        className="w-56 rounded-sm border border-[#2A3E32] bg-[#1A2E22]"
      >
        <DropdownMenuLabel className="font-[family-name:var(--font-inter)] text-sm text-[#E8E2DA]">
          {name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#2A3E32]" />
        <DropdownMenuItem
          onClick={() => router.push(ROUTES.ACCOUNT)}
          className="cursor-pointer text-[#D6D0C8] hover:bg-[#2A3E32]"
        >
          <User className="mr-2 size-4" />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(ROUTES.SETTINGS)}
          className="cursor-pointer text-[#D6D0C8] hover:bg-[#2A3E32]"
        >
          <Settings className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#2A3E32]" />
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: "/" })}
          className="text-[#B84A4A] cursor-pointer hover:bg-[#2A3E32]"
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarLogo() {
  return (
    <div className="flex flex-col px-3 pt-4 pb-3">
      <a href={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-sm bg-[#D4834A] text-white text-base font-[family-name:var(--font-instrument-serif)] font-[400] italic relative overflow-hidden">
          <span className="relative z-10">F</span>
          <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 2 L19 10 L16 7 L13 10 Z" fill="white"/>
            <path d="M16 7 L19 15 L16 12 L13 15 Z" fill="white"/>
            <path d="M16 12 L18 18 L16 16 L14 18 Z" fill="white"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-[family-name:var(--font-instrument-serif)] text-lg font-[400] italic tracking-tight text-[#E8E2DA]">
            Fuel Cast
          </span>
          <span className="text-[9px] font-[600] uppercase tracking-[0.12em] text-[#7A6F65] font-[family-name:var(--font-inter)]">
            {SITE.tagline}
          </span>
        </div>
      </a>
      <svg className="mt-3 h-[1px] w-full" viewBox="0 0 240 1" fill="none" aria-hidden="true">
        <line x1="0" y1="0" x2="240" y2="0" stroke="#3D8B6A" strokeWidth="0.5" opacity="0.3"/>
        <line x1="0" y1="0.5" x2="240" y2="0.5" stroke="#D4834A" strokeWidth="0.3" opacity="0.15"/>
      </svg>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon" className="bg-deodar-sidebar border-r border-[#2A3E32]">
        <SidebarHeader>
          <SidebarLogo />
        </SidebarHeader>

        <SidebarSeparator className="bg-[#2A3E32]" />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-extrabold text-[#6A5D50] uppercase tracking-widest font-[family-name:var(--font-inter)]">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        onClick={() => router.push(item.href)}
                        className={`flex items-center gap-3 text-[15px] font-bold font-[family-name:var(--font-inter)] ${
                          isActive
                            ? "text-[#D4834A] font-extrabold bg-[rgba(212,131,74,0.12)]"
                            : "text-[#D6D0C8] hover:text-[#E8E2DA] hover:bg-[#2A3E32]"
                        }`}
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator className="bg-[#2A3E32]" />

        <SidebarFooter>
          <UserNav />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-warm-glow">
        <DashboardAuthGuard>
        <header className="flex h-14 items-center gap-3 border-b border-[#E0D6CC] bg-[#FFFAF5]/90 backdrop-blur-sm px-4">
          <SidebarTrigger className="text-[#7A6F65] hover:text-[#2D2A26]" />
          <Mountain className="size-4 text-[#D4834A] opacity-60" />
          <div className="flex-1" />
          <span className="text-xs text-[#9A8B7A] hidden sm:block font-[family-name:var(--font-source-serif)] italic">
            {SITE.location}
          </span>
        </header>

        <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
          {children}
        </main>

        <div className="strata-accent" />
        <footer className="border-t border-[#E0D6CC] px-6 py-3 bg-[#FFFAF5]/80">
          <p className="text-center font-[family-name:var(--font-source-serif)] text-xs italic text-[#9A8B7A]">
            {SITE.location} · {SITE.tagline}
          </p>
        </footer>
        </DashboardAuthGuard>
      </SidebarInset>
    </SidebarProvider>
  );
}
