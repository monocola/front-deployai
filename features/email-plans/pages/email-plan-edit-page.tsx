"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import type {
  CreateEmailPlanPayload,
  UpdateEmailPlanPayload,
} from "@/features/email-plans/models/email-plan.model";
import {
  useAdminEmailPlan,
  useCreateAdminEmailPlan,
  useUpdateAdminEmailPlan,
} from "@/features/email-plans/data-access/use-admin-email-plans";
import { EmailPlanForm } from "@/features/email-plans/components/email-plan-form";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/core/errors/api-error.model";

interface EmailPlanEditPageProps {
  planId: string | null;
}

export function EmailPlanEditPage({ planId }: EmailPlanEditPageProps) {
  const router = useRouter();
  const isNew = planId === "new";
  const { data: plan, isLoading, error } = useAdminEmailPlan(planId ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createPlan = useCreateAdminEmailPlan();
  const updatePlan = useUpdateAdminEmailPlan(planId ?? "");
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
          <Link href="/plans?tab=email">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNew ? "Nuevo plan de correo" : plan!.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isNew
              ? "Define precio, volumen y cuotas Mailcow."
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
        <EmailPlanForm
          plan={isNew ? undefined : plan}
          isNew={isNew}
          saving={saving}
          onSubmit={async (payload) => {
            try {
              setFormError(null);
              if (isNew) {
                const created = await createPlan.mutateAsync(
                  payload as CreateEmailPlanPayload
                );
                showSuccess("Plan creado");
                router.replace(`/email-plans/${created.id}`);
              } else {
                await updatePlan.mutateAsync(payload as UpdateEmailPlanPayload);
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
