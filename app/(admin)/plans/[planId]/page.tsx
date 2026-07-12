import { PlanEditPage } from "@/features/plans/pages/plan-edit-page";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  return <PlanEditPage planId={planId} />;
}
