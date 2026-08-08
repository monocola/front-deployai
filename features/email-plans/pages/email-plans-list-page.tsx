"use client";

import Link from "next/link";
import { Copy, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { EmailPlan } from "@/features/email-plans/models/email-plan.model";
import { formatEmailPlanPrice } from "@/features/email-plans/models/email-plan.model";
import {
  useAdminEmailPlans,
  useDeleteAdminEmailPlan,
  useDuplicateAdminEmailPlan,
} from "@/features/email-plans/data-access/use-admin-email-plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/core/errors/api-error.model";

export function EmailPlansList({ embedded = false }: { embedded?: boolean }) {
  const { data: plans, isLoading, error } = useAdminEmailPlans();
  const deletePlan = useDeleteAdminEmailPlan();
  const duplicatePlan = useDuplicateAdminEmailPlan();

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
      {!embedded && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Planes de correo</h1>
            <p className="mt-1 text-sm text-muted">
              Precios, cuotas Mailcow y volumen mensual administrables.
            </p>
          </div>
          <Button asChild>
            <Link href="/email-plans/new">
              <Plus className="h-4 w-4" />
              Nuevo plan
            </Link>
          </Button>
        </div>
      )}
      {embedded && (
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/email-plans/new">
              <Plus className="h-4 w-4" />
              Nuevo plan
            </Link>
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-card-elevated/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Cuotas</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {plans?.map((plan) => (
              <EmailPlanRow
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

function EmailPlanRow({
  plan,
  onDelete,
  onDuplicate,
  deleting,
  duplicating,
}: {
  plan: EmailPlan;
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
        {formatEmailPlanPrice(plan.priceCentsMonthly, plan.currency, plan.customPricing)}
        {plan.emailsPerMonth != null && (
          <div className="text-xs text-muted">
            {plan.emailsPerMonth.toLocaleString()} emails/mes
          </div>
        )}
      </td>
      <td className="px-4 py-4 text-muted">
        {plan.mailboxes == null || plan.mailboxes <= 0 ? "∞" : plan.mailboxes} mbx ·{" "}
        {plan.aliases} aliases · rl {plan.rlValue}/{plan.rlFrame}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          {plan.enabled ? (
            <Badge variant="success">Activo</Badge>
          ) : (
            <Badge variant="muted">Inactivo</Badge>
          )}
          {plan.recommended && <Badge>Más popular</Badge>}
          {plan.customPricing && <Badge variant="muted">Custom</Badge>}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/email-plans/${plan.id}`}>
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
