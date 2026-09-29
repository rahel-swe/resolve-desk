import {
  BookOpen01Icon,
  DashboardSquare01Icon,
  Ticket01Icon,
} from '@hugeicons/core-free-icons'

export const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: DashboardSquare01Icon,
  },
  {
    label: 'Tickets',
    to: '/tickets',
    icon: Ticket01Icon,
  },
  {
    label: 'Knowledge',
    to: '/knowledge',
    icon: BookOpen01Icon,
  },
] as const
