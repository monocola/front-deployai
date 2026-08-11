"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  CreditCard,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogOut,
  Package,
} from "lucide-react";
import { clearAuthSession, getStoredUser } from "@/core/auth/auth-api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboards", label: "Dashboards", icon: LayoutDashboard, match: (p: string) => p.startsWith("/dashboards") },
  {
    href: "/manager-resource",
    label: "Recursos",
    icon: Lock,
    match: (p: string) => p.startsWith("/manager-resource"),
  },
  {
    href: "/transfer-resource",
    label: "Transferir",
    icon: ArrowRightLeft,
    match: (p: string) => p.startsWith("/transfer-resource"),
  },
  { href: "/payments", label: "Pagos", icon: CreditCard, match: (p: string) => p.startsWith("/payments") },
  {
    href: "/plans",
    label: "Planes",
    icon: Package,
    match: (p: string) =>
      p.startsWith("/plans") ||
      p.startsWith("/database-plans") ||
      p.startsWith("/email-plans") ||
      p.startsWith("/coupons"),
  },
  { href: "/tickets", label: "Soporte", icon: LifeBuoy, match: (p: string) => p.startsWith("/tickets") },
] as const;

function initialsFromEmail(email: string | undefined): string {
  if (!email) return "M";
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuthSession();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.12),_transparent_65%)]"
      />

      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/dashboards"
            className="group flex shrink-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-gradient-to-br from-primary/25 to-primary/5 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors group-hover:border-primary/40">
              <Layers className="h-4 w-4" />
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-[13px] font-semibold tracking-tight text-foreground">DeployAI</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Admin Console
              </p>
            </div>
          </Link>

          <div className="hidden h-6 w-px bg-border/80 md:block" />

          <nav
            className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:flex"
            aria-label="Navegación principal"
          >
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-card-elevated text-foreground ring-1 ring-inset ring-border"
                      : "text-muted hover:bg-card/60 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn("h-3.5 w-3.5", active ? "text-primary" : "text-muted-foreground")}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2.5 rounded-lg border border-border/70 bg-card/50 py-1.5 pl-1.5 pr-3 sm:flex">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-md bg-card-elevated text-[11px] font-semibold tracking-wide text-foreground"
                aria-hidden
              >
                {initialsFromEmail(user?.email)}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="max-w-[180px] truncate text-[12px] font-medium text-foreground">
                  {user?.email ?? "—"}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
                  Manager
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav
          className="flex gap-1 overflow-x-auto border-t border-border/60 px-3 py-2 md:hidden"
          aria-label="Navegación móvil"
        >
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
                  active
                    ? "bg-card-elevated text-foreground"
                    : "text-muted hover:bg-card/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", active ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
