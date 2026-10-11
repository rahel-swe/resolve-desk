import { createFileRoute } from '@tanstack/react-router'
import TicketDetailPage from '#/pages/ticket-detail-page'

export const Route = createFileRoute('/tickets/$ticketId')({
  component: TicketRoute,
})
function TicketRoute() {
  const { ticketId } = Route.useParams()
  return <TicketDetailPage key={ticketId} ticketId={Number(ticketId)} />
}
