import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupon,
  listAdminCoupons,
  updateAdminCoupon,
} from "@/features/coupons/data-access/admin-coupons-api";
import type {
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/features/coupons/models/coupon.model";

export const adminCouponKeys = {
  all: ["admin-coupons"] as const,
  list: () => [...adminCouponKeys.all, "list"] as const,
  detail: (couponId: string) => [...adminCouponKeys.all, "detail", couponId] as const,
};

export function useAdminCoupons() {
  return useQuery({
    queryKey: adminCouponKeys.list(),
    queryFn: listAdminCoupons,
  });
}

export function useAdminCoupon(couponId: string) {
  return useQuery({
    queryKey: adminCouponKeys.detail(couponId),
    queryFn: () => getAdminCoupon(couponId),
    enabled: !!couponId && couponId !== "new",
  });
}

export function useCreateAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCouponPayload) => createAdminCoupon(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCouponKeys.all }),
  });
}

export function useUpdateAdminCoupon(couponId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCouponPayload) => updateAdminCoupon(couponId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponKeys.all });
      queryClient.invalidateQueries({ queryKey: adminCouponKeys.detail(couponId) });
    },
  });
}

export function useDeleteAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponId: string) => deleteAdminCoupon(couponId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCouponKeys.all }),
  });
}
