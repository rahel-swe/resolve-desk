import { createFileRoute } from '@tanstack/react-router'
import NewTicketPage from '#/pages/new-ticket-page'
export const Route = createFileRoute('/tickets/new')({ component: NewTicketPage })
