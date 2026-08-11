import { CouponEditPage } from "@/features/coupons/pages/coupon-edit-page";

export default async function CouponDetailPage({
  params,
}: {
  params: Promise<{ couponId: string }>;
}) {
  const { couponId } = await params;
  return <CouponEditPage couponId={couponId} />;
}
