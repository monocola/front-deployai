"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import type {
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/features/coupons/models/coupon.model";
import {
  useAdminCoupon,
  useCreateAdminCoupon,
  useUpdateAdminCoupon,
} from "@/features/coupons/data-access/use-admin-coupons";
import { CouponForm } from "@/features/coupons/components/coupon-form";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/core/errors/api-error.model";

interface CouponEditPageProps {
  couponId: string | null;
}

export function CouponEditPage({ couponId }: CouponEditPageProps) {
  const router = useRouter();
  const isNew = couponId === "new";
  const { data: coupon, isLoading, error } = useAdminCoupon(couponId ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createCoupon = useCreateAdminCoupon();
  const updateCoupon = useUpdateAdminCoupon(couponId ?? "");
  const saving = createCoupon.isPending || updateCoupon.isPending;

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

  if (!isNew && (error || !coupon)) {
    return (
      <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
        {error ? getErrorMessage(error) : "Cupón no encontrado"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/plans?tab=coupons">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNew ? "Nuevo cupón" : coupon!.code}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isNew
              ? "Define código, descuento, vigencia y límite de usos para Emprendedor."
              : coupon!.name}
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
        <CouponForm
          coupon={isNew ? undefined : coupon}
          isNew={isNew}
          saving={saving}
          onSubmit={async (payload) => {
            try {
              setFormError(null);
              if (isNew) {
                const created = await createCoupon.mutateAsync(
                  payload as CreateCouponPayload
                );
                showSuccess("Cupón creado");
                router.replace(`/coupons/${created.id}`);
              } else {
                await updateCoupon.mutateAsync(payload as UpdateCouponPayload);
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
