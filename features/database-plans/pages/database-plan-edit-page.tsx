"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import type {
  CreateDatabasePlanPayload,
  UpdateDatabasePlanPayload,
} from "@/features/database-plans/models/database-plan.model";
import {
  useAdminDatabasePlan,
  useCreateAdminDatabasePlan,
  useUpdateAdminDatabasePlan,
} from "@/features/database-plans/data-access/use-admin-database-plans";
import { DatabasePlanForm } from "@/features/database-plans/components/database-plan-form";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/core/errors/api-error.model";

interface DatabasePlanEditPageProps {
  planId: string | null;
}

export function DatabasePlanEditPage({ planId }: DatabasePlanEditPageProps) {
  const router = useRouter();
  const isNew = planId === "new";
  const { data: plan, isLoading, error } = useAdminDatabasePlan(planId ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createPlan = useCreateAdminDatabasePlan();
  const updatePlan = useUpdateAdminDatabasePlan(planId ?? "");
  const saving = createPlan.isPending || updatePlan.isPending;

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
          <Link href="/plans?tab=databases">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNew ? "Nuevo plan de DB" : plan!.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isNew
              ? "Define precio y límites para un plan de base de datos."
              : `Código: ${plan!.code}`}
          </p>
        </div>
      </div>

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
        <DatabasePlanForm
          plan={isNew ? undefined : plan}
          isNew={isNew}
          saving={saving}
          onSubmit={async (payload) => {
            try {
              setFormError(null);
              if (isNew) {
                const created = await createPlan.mutateAsync(
                  payload as CreateDatabasePlanPayload
                );
                showSuccess("Plan creado");
                router.replace(`/database-plans/${created.id}`);
              } else {
                await updatePlan.mutateAsync(payload as UpdateDatabasePlanPayload);
                showSuccess("Cambios guardados");
              }
            } catch (err) {
              setFormError(getErrorMessage(err));
            }
          }}
        />
      </div>
    </div>
  );
}
