"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Copy, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Plan } from "@/features/plans/models/plan.model";
import {
  useAdminPlans,
  useDeleteAdminPlan,
  useDuplicateAdminPlan,
} from "@/features/plans/data-access/use-admin-plans";
import { DatabasePlansListPage } from "@/features/database-plans/pages/database-plans-list-page";
import { EmailPlansList } from "@/features/email-plans/pages/email-plans-list-page";
import { CouponsList } from "@/features/coupons/pages/coupons-list-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/core/errors/api-error.model";
import { cn } from "@/lib/utils";

type PlansTab = "applications" | "databases" | "email" | "coupons";

function resolveTab(raw: string | null): PlansTab {
  if (raw === "databases" || raw === "email" || raw === "coupons") return raw;
  return "applications";
}

export function PlansListPage() {
  const searchParams = useSearchParams();
  const tab = resolveTab(searchParams.get("tab"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Planes</h1>
        <p className="mt-1 text-sm text-muted">
          Catálogo unificado: aplicaciones, bases de datos, correo y cupones.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card-elevated/40 p-1">
        <TabLink href="/plans?tab=applications" active={tab === "applications"}>
          Aplicaciones
        </TabLink>
        <TabLink href="/plans?tab=databases" active={tab === "databases"}>
          Bases de datos
        </TabLink>
        <TabLink href="/plans?tab=email" active={tab === "email"}>
          Correo
        </TabLink>
        <TabLink href="/plans?tab=coupons" active={tab === "coupons"}>
          Cupones
        </TabLink>
      </div>

      {tab === "applications" && <ApplicationPlansPanel />}
      {tab === "databases" && <DatabasePlansEmbedded />}
      {tab === "email" && <EmailPlansList embedded />}
      {tab === "coupons" && <CouponsList embedded />}
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

function ApplicationPlansPanel() {
  const { data: plans, isLoading, error } = useAdminPlans();
  const deletePlan = useDeleteAdminPlan();
  const duplicatePlan = useDuplicateAdminPlan();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
        {getErrorMessage(error)}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/plans/new">
            <Plus className="h-4 w-4" />
            Nuevo plan
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-card-elevated/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Recursos</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {plans?.map((plan) => (
              <PlanRow
                key={plan.id}
                plan={plan}
                onDelete={() => deletePlan.mutate(plan.id)}
                onDuplicate={() => duplicatePlan.mutate(plan.id)}
                deleting={deletePlan.isPending}
                duplicating={duplicatePlan.isPending}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DatabasePlansEmbedded() {
  return <DatabasePlansListPage embedded />;
}

function PlanRow({
  plan,
  onDelete,
  onDuplicate,
  deleting,
  duplicating,
}: {
  plan: Plan;
  onDelete: () => void;
  onDuplicate: () => void;
  deleting: boolean;
  duplicating: boolean;
}) {
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el plan "${plan.name}"?`)) onDelete();
  };

  return (
    <tr className="border-b border-border/60 transition-colors hover:bg-card-elevated/30">
      <td className="px-4 py-4">
        <div className="font-medium text-foreground">{plan.name}</div>
        <div className="text-xs text-muted">{plan.code}</div>
      </td>
      <td className="px-4 py-4">
        ${plan.monthlyPrice} {plan.currency}
      </td>
      <td className="px-4 py-4 text-muted">
        {plan.limits.cpu} vCPU · {plan.limits.memoryMb} MB · {plan.limits.diskGb} GB
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          {plan.enabled ? (
            <Badge variant="success">Activo</Badge>
          ) : (
            <Badge variant="muted">Inactivo</Badge>
          )}
          {plan.recommended && <Badge>Más popular</Badge>}
          {plan.firstMonthFree && <Badge variant="success">Primer mes gratis</Badge>}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/plans/${plan.id}`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onDuplicate} disabled={duplicating}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 text-error" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
