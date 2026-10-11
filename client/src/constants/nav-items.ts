import {
  BookOpen01Icon,
  DashboardSquare01Icon,
  Ticket01Icon,
  UserGroupIcon,
  ChartHistogramIcon,
} from '@hugeicons/core-free-icons'

export const navItems = [
  {
    label: 'Overview',
    to: '/dashboard',
    icon: DashboardSquare01Icon,
    preview: false,
  },
  { label: 'Tickets', to: '/tickets', icon: Ticket01Icon, preview: false },
  {
    label: 'Knowledge',
    to: '/knowledge',
    icon: BookOpen01Icon,
    preview: false,
  },
  { label: 'Team', to: '/team', icon: UserGroupIcon, preview: true },
  { label: 'Reports', to: '/reports', icon: ChartHistogramIcon, preview: true },
] as const
