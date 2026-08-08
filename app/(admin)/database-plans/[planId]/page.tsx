import { DatabasePlanEditPage } from "@/features/database-plans/pages/database-plan-edit-page";

export default async function DatabasePlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  return <DatabasePlanEditPage planId={planId} />;
}
