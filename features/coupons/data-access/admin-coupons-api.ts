import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/features/coupons/models/coupon.model";
import { mapCoupon } from "@/features/coupons/models/coupon.model";

export async function listAdminCoupons(): Promise<Coupon[]> {
  const coupons = await apiClient.get<Coupon[]>(apiEndpoints.adminCoupons.list());
  return coupons.map(mapCoupon);
}

export async function getAdminCoupon(couponId: string): Promise<Coupon> {
  const coupon = await apiClient.get<Coupon>(apiEndpoints.adminCoupons.get(couponId));
  return mapCoupon(coupon);
}

export async function createAdminCoupon(payload: CreateCouponPayload): Promise<Coupon> {
  const coupon = await apiClient.post<Coupon>(apiEndpoints.adminCoupons.create(), payload);
  return mapCoupon(coupon);
}

export async function updateAdminCoupon(
  couponId: string,
  payload: UpdateCouponPayload
): Promise<Coupon> {
  const coupon = await apiClient.put<Coupon>(
    apiEndpoints.adminCoupons.update(couponId),
    payload
  );
  return mapCoupon(coupon);
}

export async function deleteAdminCoupon(couponId: string): Promise<void> {
  await apiClient.delete(apiEndpoints.adminCoupons.delete(couponId));
}
