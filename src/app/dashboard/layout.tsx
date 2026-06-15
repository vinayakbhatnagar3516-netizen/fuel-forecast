"use client";

import { usePathname, useRouter } from "next/navigation";
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

/* ------------------------------------------------------------------ */
/*  Navigation items                                                   */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.TRENDS, label: "Trends", icon: TrendingUp },
  { href: ROUTES.ORDERS, label: "Orders", icon: Truck },
  { href: ROUTES.SETTINGS, label: "Settings", icon: Settings },
  { href: ROUTES.DIAGNOSTICS, label: "Diagnostics", icon: Activity },
] as const;

/* ------------------------------------------------------------------ */
/*  Kolam ornament — decorative divider                                */
/* ------------------------------------------------------------------ */

function KolamOrnament() {
  return (
    <div className="kolam-ornament flex items-center justify-center gap-1">
      <svg width="48" height="12" viewBox="0 0 48 12" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="6" r="1.5" fill="#C47335" opacity="0.4" />
        <circle cx="20" cy="6" r="1.5" fill="#C47335" opacity="0.4" />
        <circle cx="32" cy="6" r="1.5" fill="#C47335" opacity="0.4" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  User nav — avatar + dropdown in sidebar footer                     */
/* ------------------------------------------------------------------ */

function UserNav() {
  const { user } = useUser();
  const { signOut } = useClerk();

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
          <AvatarFallback className="text-xs bg-[#C47335] text-white">
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
        <DropdownMenuLabel className="font-heading text-sm text-[#1A1F2E]">
          {name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => window.location.href = ROUTES.SETTINGS}
          className="cursor-pointer"
        >
          <User className="mr-2 size-4" />
          Profile & Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: "/" })}
          className="text-burgundy cursor-pointer"
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar logo                                                       */
/* ------------------------------------------------------------------ */

function SidebarLogo() {
  return (
    <div className="flex flex-col px-3 py-3">
      <a href={ROUTES.DASHBOARD} className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-sm bg-[#2C3E50] text-white text-sm font-semibold font-heading">
          FF
        </div>
        <span className="font-heading text-base font-semibold text-[#1A1F2E]">
          Fuel Forecast
        </span>
      </a>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {SITE.tagline}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard Layout — the main shell                                  */
/* ------------------------------------------------------------------ */

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
        {/* -------- Header -------- */}
        <SidebarHeader>
          <SidebarLogo />
        </SidebarHeader>

        <SidebarSeparator />

        {/* -------- Navigation -------- */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                        className={`flex items-center gap-3 ${
                          isActive
                            ? "text-[#C47335] font-medium"
                            : "text-sidebar-foreground"
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

        {/* -------- Footer: User -------- */}
        <SidebarFooter>
          <UserNav />
        </SidebarFooter>

        {/* Kolam dot background */}
        <div className="sidebar-kolam absolute inset-0 pointer-events-none opacity-50" />
      </Sidebar>

      {/* -------- Main Content -------- */}
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b border-border bg-warm-bg px-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground hidden sm:block">
            {SITE.location}
          </span>
        </header>

        <main className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-6 py-4">
          <KolamOrnament />
          <p className="text-center font-heading text-xs text-muted-foreground">
            {SITE.location}
          </p>
          <p className="text-center text-[10px] text-muted-foreground mt-0.5">
            {SITE.tagline}
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
