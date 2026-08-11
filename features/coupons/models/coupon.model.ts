export type CouponDiscountType = "PERCENT" | "FIXED_AMOUNT";

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string;
  endsAt: string;
  enabled: boolean;
  applicablePlanCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  code: string;
  name: string;
  description?: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  maxUses?: number | null;
  startsAt: string;
  endsAt: string;
  enabled: boolean;
}

export interface UpdateCouponPayload {
  code?: string;
  name?: string;
  description?: string | null;
  discountType?: CouponDiscountType;
  discountValue?: number;
  maxUses?: number | null;
  clearMaxUses?: boolean;
  startsAt?: string;
  endsAt?: string;
  enabled?: boolean;
}

type RawCoupon = Omit<Coupon, "discountValue" | "maxUses" | "description"> & {
  discountValue: number | string;
  maxUses?: number | null;
  description?: string | null;
};

export function mapCoupon(raw: RawCoupon): Coupon {
  return {
    ...raw,
    description: raw.description ?? null,
    discountValue: Number(raw.discountValue),
    maxUses: raw.maxUses ?? null,
  };
}

export function formatCouponDiscount(coupon: Coupon): string {
  if (coupon.discountType === "PERCENT") {
    return `${coupon.discountValue}%`;
  }
  return `$${coupon.discountValue.toFixed(coupon.discountValue % 1 === 0 ? 0 : 2)} USD`;
}

export function formatCouponWindow(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" });
  return `${fmt(start)} → ${fmt(end)}`;
}
