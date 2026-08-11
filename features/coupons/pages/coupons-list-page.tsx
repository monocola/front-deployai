"use client";

import Link from "next/link";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Coupon } from "@/features/coupons/models/coupon.model";
import {
  formatCouponDiscount,
  formatCouponWindow,
} from "@/features/coupons/models/coupon.model";
import {
  useAdminCoupons,
  useDeleteAdminCoupon,
} from "@/features/coupons/data-access/use-admin-coupons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/core/errors/api-error.model";

export function CouponsList({ embedded = false }: { embedded?: boolean }) {
  const { data: coupons, isLoading, error } = useAdminCoupons();
  const deleteCoupon = useDeleteAdminCoupon();

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
            <h1 className="text-2xl font-semibold tracking-tight">Cupones</h1>
            <p className="mt-1 text-sm text-muted">
              Descuentos por código para el plan Emprendedor (básico de pago).
            </p>
          </div>
          <Button asChild>
            <Link href="/coupons/new">
              <Plus className="h-4 w-4" />
              Nuevo cupón
            </Link>
          </Button>
        </div>
      )}
      {embedded && (
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/coupons/new">
              <Plus className="h-4 w-4" />
              Nuevo cupón
            </Link>
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-card-elevated/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Cupón</th>
              <th className="px-4 py-3 font-medium">Descuento</th>
              <th className="px-4 py-3 font-medium">Vigencia</th>
              <th className="px-4 py-3 font-medium">Usos</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {coupons?.length ? (
              coupons.map((coupon) => (
                <CouponRow
                  key={coupon.id}
                  coupon={coupon}
                  onDelete={() => deleteCoupon.mutate(coupon.id)}
                  deleting={deleteCoupon.isPending}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                  No hay cupones todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CouponRow({
  coupon,
  onDelete,
  deleting,
}: {
  coupon: Coupon;
  onDelete: () => void;
  deleting: boolean;
}) {
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el cupón "${coupon.code}"?`)) onDelete();
  };
  const now = Date.now();
  const started = new Date(coupon.startsAt).getTime() <= now;
  const ended = new Date(coupon.endsAt).getTime() < now;
  const exhausted =
    coupon.maxUses != null && coupon.usedCount >= coupon.maxUses;

  return (
    <tr className="border-b border-border/60 transition-colors hover:bg-card-elevated/30">
      <td className="px-4 py-4">
        <div className="font-medium text-foreground">{coupon.code}</div>
        <div className="text-xs text-muted">{coupon.name}</div>
      </td>
      <td className="px-4 py-4">{formatCouponDiscount(coupon)}</td>
      <td className="px-4 py-4 text-muted">
        {formatCouponWindow(coupon.startsAt, coupon.endsAt)}
      </td>
      <td className="px-4 py-4 text-muted">
        {coupon.usedCount}
        {coupon.maxUses == null ? " / ∞" : ` / ${coupon.maxUses}`}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          {!coupon.enabled ? (
            <Badge variant="muted">Inactivo</Badge>
          ) : ended ? (
            <Badge variant="muted">Expirado</Badge>
          ) : !started ? (
            <Badge variant="muted">Programado</Badge>
          ) : exhausted ? (
            <Badge variant="muted">Agotado</Badge>
          ) : (
            <Badge variant="success">Activo</Badge>
          )}
          <Badge variant="muted">{coupon.applicablePlanCode}</Badge>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/coupons/${coupon.id}`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 text-error" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
