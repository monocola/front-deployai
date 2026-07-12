"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { CreatePlanPayload, Plan, UpdatePlanPayload } from "@/features/plans/models/plan.model";
import {
  useAdminPlan,
  useCreateAdminPlan,
  useUpdateAdminPlan,
  useUpdateAdminPlanFeatures,
  useUpdateAdminPlanLimits,
} from "@/features/plans/data-access/use-admin-plans";
import { PlanDetailsForm } from "@/features/plans/components/plan-details-form";
import { PlanLimitsForm } from "@/features/plans/components/plan-limits-form";
import { PlanFeaturesForm } from "@/features/plans/components/plan-features-form";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/core/errors/api-error.model";
import { cn } from "@/lib/utils";

type Tab = "details" | "limits" | "features";

interface PlanEditPageProps {
  planId: string | null;
}

export function PlanEditPage({ planId }: PlanEditPageProps) {
  const router = useRouter();
  const isNew = planId === "new";
  const { data: plan, isLoading, error } = useAdminPlan(planId ?? "");
  const [tab, setTab] = useState<Tab>("details");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createPlan = useCreateAdminPlan();
  const updatePlan = useUpdateAdminPlan(planId ?? "");
  const updateLimits = useUpdateAdminPlanLimits(planId ?? "");
  const updateFeatures = useUpdateAdminPlanFeatures(planId ?? "");

  const saving =
    createPlan.isPending ||
    updatePlan.isPending ||
    updateLimits.isPending ||
    updateFeatures.isPending;

  const showSuccess = (text: string) => {
    setMessage(text);
    setFormError(null);
    setTimeout(() => setMessage(null), 3000);
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isNew && (error || !plan)) {
    return (
      <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
        {error ? getErrorMessage(error) : "Plan no encontrado"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/plans">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNew ? "Nuevo plan" : plan!.name}
          </h1>
          {!isNew && <p className="text-sm text-muted">{plan!.code}</p>}
        </div>
      </div>

      {!isNew && (
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {(
            [
              ["details", "Detalles"],
              ["limits", "Límites"],
              ["features", "Características"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                tab === key
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {message && (
        <p className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          {message}
        </p>
      )}
      {formError && (
        <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {formError}
        </p>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        {(isNew || tab === "details") && (
          <PlanDetailsForm
            plan={plan}
            isNew={isNew}
            saving={saving}
            onSubmit={async (payload) => {
              try {
                if (isNew) {
                  const created = await createPlan.mutateAsync(payload as CreatePlanPayload);
                  router.push(`/plans/${created.id}`);
                } else {
                  await updatePlan.mutateAsync(payload);
                  showSuccess("Detalles actualizados");
                }
              } catch (err) {
                setFormError(getErrorMessage(err));
              }
            }}
          />
        )}

        {!isNew && tab === "limits" && plan && (
          <PlanLimitsForm
            limits={plan.limits}
            saving={saving}
            onSubmit={async (payload) => {
              try {
                await updateLimits.mutateAsync(payload);
                showSuccess("Límites actualizados");
              } catch (err) {
                setFormError(getErrorMessage(err));
              }
            }}
          />
        )}

        {!isNew && tab === "features" && plan && (
          <PlanFeaturesForm
            plan={plan}
            saving={saving}
            onSubmit={async (payload) => {
              try {
                await updateFeatures.mutateAsync(payload);
                showSuccess("Características actualizadas");
              } catch (err) {
                setFormError(getErrorMessage(err));
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
