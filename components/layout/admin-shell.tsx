"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  CreditCard,
  FileText,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { clearAuthSession, getStoredUser } from "@/core/auth/auth-api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboards", label: "Dashboards", icon: LayoutDashboard, match: (p: string) => p.startsWith("/dashboards") },
  {
    href: "/customers",
    label: "Clientes",
    icon: Users,
    match: (p: string) => p.startsWith("/customers"),
  },
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
  { href: "/invoices", label: "Facturación", icon: FileText, match: (p: string) => p.startsWith("/invoices") },
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
  {
    href: "/auditoria",
    label: "Auditoría",
    icon: ShieldCheck,
    match: (p: string) => p.startsWith("/auditoria"),
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
  const [mobileOpen, setMobileOpen] = useState(false);

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

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border/80 bg-background/95 backdrop-blur-xl",
          "transition-transform duration-200 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-border/80 px-4">
          <Link
            href="/dashboards"
            onClick={() => setMobileOpen(false)}
            className="group flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-gradient-to-br from-primary/25 to-primary/5 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors group-hover:border-primary/40">
              <Layers className="h-4 w-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-[13px] font-semibold tracking-tight text-foreground">DeployAI</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Admin Console
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-card-elevated text-foreground ring-1 ring-inset ring-border"
                    : "text-muted hover:bg-card/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-border/80 p-3">
          <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card/50 py-1.5 pl-1.5 pr-3">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-card-elevated text-[11px] font-semibold tracking-wide text-foreground"
              aria-hidden
            >
              {initialsFromEmail(user?.email)}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[12px] font-medium text-foreground">{user?.email ?? "—"}</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-primary">Manager</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/80 bg-background/80 px-4 backdrop-blur-xl md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <p className="text-[13px] font-semibold tracking-tight text-foreground">DeployAI Admin</p>
        </header>
        <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
