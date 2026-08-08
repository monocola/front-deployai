import { TicketDetailPage } from "@/features/tickets/pages/ticket-detail-page";

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  return <TicketDetailPage ticketId={ticketId} />;
}
