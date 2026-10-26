import type { TicketPriority } from './ticket-enums'

export type TicketPayload = {
  title: string
  description: string
  category: string
  priority: TicketPriority
}
