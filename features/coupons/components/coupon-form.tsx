"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type {
  Coupon,
  CouponDiscountType,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/features/coupons/models/coupon.model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CouponFormProps {
  coupon?: Coupon;
  isNew: boolean;
  saving: boolean;
  onSubmit: (payload: CreateCouponPayload | UpdateCouponPayload) => Promise<void>;
}

function toLocalInputValue(iso: string | undefined, fallbackDaysOffset = 0): string {
  const date = iso ? new Date(iso) : new Date();
  if (!iso) {
    date.setDate(date.getDate() + fallbackDaysOffset);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}

function formatDiscountInputValue(
  value: number | string | null | undefined,
  type: CouponDiscountType
): string {
  if (value == null || value === "") {
    return type === "PERCENT" ? "10" : "5";
  }
  const num = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (!Number.isFinite(num) || num <= 0) {
    return type === "PERCENT" ? "10" : "5";
  }
  if (type === "PERCENT") {
    return String(num);
  }
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

export function CouponForm({ coupon, isNew, saving, onSubmit }: CouponFormProps) {
  const [code, setCode] = useState(coupon?.code ?? "");
  const [name, setName] = useState(coupon?.name ?? "");
  const [description, setDescription] = useState(coupon?.description ?? "");
  const [discountType, setDiscountType] = useState<CouponDiscountType>(
    coupon?.discountType ?? "PERCENT"
  );
  const [discountValue, setDiscountValue] = useState(() =>
    formatDiscountInputValue(coupon?.discountValue, coupon?.discountType ?? "PERCENT")
  );
  const [unlimitedUses, setUnlimitedUses] = useState(coupon != null && coupon.maxUses == null);
  const [maxUses, setMaxUses] = useState(
    coupon?.maxUses != null ? String(coupon.maxUses) : "100"
  );
  const [startsAt, setStartsAt] = useState(toLocalInputValue(coupon?.startsAt, 0));
  const [endsAt, setEndsAt] = useState(toLocalInputValue(coupon?.endsAt, 30));
  const [enabled, setEnabled] = useState(coupon?.enabled ?? true);
  const [valueError, setValueError] = useState<string | null>(null);

  const handleDiscountTypeChange = (next: CouponDiscountType) => {
    setDiscountType(next);
    setValueError(null);
    setDiscountValue((current) => {
      const parsed = Number(current);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return next === "PERCENT" ? "10" : "5";
      }
      return formatDiscountInputValue(parsed, next);
    });
  };

  const handleDiscountValueChange = (raw: string) => {
    setValueError(null);
    if (discountType === "PERCENT") {
      // Allow empty while typing; only digits and one optional decimal separator.
      if (raw === "" || /^\d{0,3}([.,]\d{0,2})?$/.test(raw)) {
        setDiscountValue(raw.replace(",", "."));
      }
      return;
    }
    if (raw === "" || /^\d{0,8}([.,]\d{0,2})?$/.test(raw)) {
      setDiscountValue(raw.replace(",", "."));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedValue = Number(String(discountValue).replace(",", "."));
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setValueError("Ingresa un valor de descuento válido mayor a 0.");
      return;
    }
    if (discountType === "PERCENT" && parsedValue > 100) {
      setValueError("El porcentaje no puede ser mayor a 100.");
      return;
    }

    const base = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || null,
      discountType,
      discountValue: parsedValue,
      startsAt: localInputToIso(startsAt),
      endsAt: localInputToIso(endsAt),
      enabled,
    };

    if (isNew) {
      const payload: CreateCouponPayload = {
        ...base,
        maxUses: unlimitedUses ? null : Number(maxUses),
      };
      await onSubmit(payload);
      return;
    }

    const payload: UpdateCouponPayload = {
      ...base,
      ...(unlimitedUses
        ? { clearMaxUses: true, maxUses: undefined }
        : { clearMaxUses: false, maxUses: Number(maxUses) }),
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
      <Field label="Código" htmlFor="coupon-code">
        <Input
          id="coupon-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="PROMO10"
          required
        />
        <p className="mt-1 text-xs text-muted">Se normaliza a mayúsculas.</p>
      </Field>
      <Field label="Nombre" htmlFor="coupon-name">
        <Input
          id="coupon-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Descuento lanzamiento"
          required
        />
      </Field>

      <Field label="Tipo de descuento" htmlFor="coupon-type">
        <select
          id="coupon-type"
          value={discountType}
          onChange={(e) => handleDiscountTypeChange(e.target.value as CouponDiscountType)}
          className="flex h-9 w-full rounded-md border border-border bg-card px-3 text-sm"
        >
          <option value="PERCENT">Porcentaje (%)</option>
          <option value="FIXED_AMOUNT">Monto fijo (USD)</option>
        </select>
      </Field>
      <Field
        label={discountType === "PERCENT" ? "Porcentaje" : "Monto USD"}
        htmlFor="coupon-value"
      >
        <Input
          id="coupon-value"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={discountType === "PERCENT" ? "Ej: 10" : "Ej: 5.00"}
          value={discountValue}
          onChange={(e) => handleDiscountValueChange(e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-muted">
          {discountType === "PERCENT"
            ? "Entre 0.01 y 100. Aplica solo al plan Emprendedor."
            : "Monto en USD. Aplica solo al plan Emprendedor."}
        </p>
        {valueError && <p className="mt-1 text-xs text-error">{valueError}</p>}
      </Field>

      <Field label="Inicio" htmlFor="coupon-starts">
        <Input
          id="coupon-starts"
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          required
        />
      </Field>
      <Field label="Fin" htmlFor="coupon-ends">
        <Input
          id="coupon-ends"
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          required
        />
      </Field>

      <div className="space-y-3 lg:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={unlimitedUses}
            onChange={(e) => setUnlimitedUses(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Usos ilimitados
        </label>
        {!unlimitedUses && (
          <Field label="Cantidad máxima de usos" htmlFor="coupon-max-uses">
            <Input
              id="coupon-max-uses"
              type="number"
              min="1"
              step="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              required
            />
          </Field>
        )}
      </div>

      <Field label="Descripción" htmlFor="coupon-description" className="lg:col-span-2">
        <textarea
          id="coupon-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          placeholder="Opcional"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm lg:col-span-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        Cupón activo
      </label>

      <div className="lg:col-span-2">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isNew ? "Crear cupón" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
