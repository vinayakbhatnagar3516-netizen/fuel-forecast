"use client";

import { usePathname, useRouter } from "next/navigation";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import {
  LayoutDashboard,
  TrendingUp,
  Truck,
  Settings,
  Activity,
  ChevronDown,
  LogOut,
  User,
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
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer">
        <Avatar className="size-7">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback className="text-xs bg-[#2563eb] text-white">
            {initials || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 truncate text-left">
          <p className="truncate text-sm font-medium leading-tight">{name}</p>
          <p className="truncate text-xs text-muted-foreground leading-tight">
            {email || "No email"}
          </p>
        </div>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        className="w-56 rounded-sm border-border"
      >
        <DropdownMenuLabel className="font-[family-name:var(--font-inter)] text-sm text-[#1a1d21]">
          {name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push(ROUTES.ACCOUNT)}
          className="cursor-pointer"
        >
          <User className="mr-2 size-4" />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(ROUTES.SETTINGS)}
          className="cursor-pointer"
        >
          <Settings className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: "/" })}
          className="text-[#dc2626] cursor-pointer"
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
    <div className="flex flex-col px-3 py-3">
      <a href={ROUTES.DASHBOARD} className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-sm bg-[#2563eb] text-white text-sm font-semibold font-[family-name:var(--font-inter)]">
          F
        </div>
        <span className="font-[family-name:var(--font-inter)] text-base font-semibold tracking-tight text-[#1a1d21]">
          Fuel Cast
        </span>
      </a>
      <p className="mt-0.5 text-xs text-[#5a626d] font-[family-name:var(--font-inter)]">
        {SITE.tagline}
      </p>
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
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <SidebarLogo />
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-extrabold text-[#5a626d] uppercase tracking-widest font-[family-name:var(--font-inter)]">
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
                            ? "text-[#2563eb] font-extrabold"
                            : "text-[#1a1d21]"
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

        <SidebarSeparator />

        <SidebarFooter>
          <UserNav />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <DashboardAuthGuard>
        <header className="flex h-14 items-center gap-3 border-b border-[#d0d5db] bg-[#ffffff] px-4">
          <SidebarTrigger className="text-[#5a626d] hover:text-[#1a1d21]" />
          <div className="flex-1" />
          <span className="text-xs text-[#8a94a0] hidden sm:block font-[family-name:var(--font-inter)]">
            {SITE.location}
          </span>
        </header>

        <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
          {children}
        </main>

        <footer className="border-t border-[#d0d5db] px-6 py-4">
          <p className="text-center font-[family-name:var(--font-inter)] text-xs text-[#8a94a0]">
            {SITE.location} · {SITE.tagline}
          </p>
        </footer>
        </DashboardAuthGuard>
      </SidebarInset>
    </SidebarProvider>
  );
}
