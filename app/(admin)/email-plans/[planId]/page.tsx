import { EmailPlanEditPage } from "@/features/email-plans/pages/email-plan-edit-page";

export default async function EmailPlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  return <EmailPlanEditPage planId={planId} />;
}
