"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogOut,
} from "lucide-react";
import { clearAuthSession, getStoredUser } from "@/core/auth/auth-api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboards" className="flex items-center gap-2 font-semibold text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              DeployAI Admin
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <Link
                href="/dashboards"
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith("/dashboards")
                    ? "bg-card-elevated text-foreground"
                    : "text-muted hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboards
                </span>
              </Link>
              <Link
                href="/manager-resource"
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith("/manager-resource")
                    ? "bg-card-elevated text-foreground"
                    : "text-muted hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Manager Resource
                </span>
              </Link>
              <Link
                href="/payments"
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith("/payments")
                    ? "bg-card-elevated text-foreground"
                    : "text-muted hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Pagos
                </span>
              </Link>
              <Link
                href="/plans"
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith("/plans") ||
                    pathname.startsWith("/database-plans") ||
                    pathname.startsWith("/email-plans")
                    ? "bg-card-elevated text-foreground"
                    : "text-muted hover:text-foreground"
                )}
              >
                Planes
              </Link>
              <Link
                href="/tickets"
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith("/tickets")
                    ? "bg-card-elevated text-foreground"
                    : "text-muted hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <LifeBuoy className="h-3.5 w-3.5" />
                  Soporte
                </span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{user?.email}</span>
            <BadgeManager />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

function BadgeManager() {
  return (
    <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      MANAGER
    </span>
  );
}
