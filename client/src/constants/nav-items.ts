import {
  BookOpen02Icon,
  Home03Icon,
  BubbleChatIcon,
  UserMultiple02Icon,
  ChartIncreaseIcon,
} from '@hugeicons/core-free-icons'

export const navItems = [
  {
    label: 'Overview',
    to: '/dashboard',
    icon: Home03Icon,
    preview: false,
  },
  { label: 'Tickets', to: '/tickets', icon: BubbleChatIcon, preview: false },
  {
    label: 'Knowledge',
    to: '/knowledge',
    icon: BookOpen02Icon,
    preview: false,
  },
  { label: 'Team', to: '/team', icon: UserMultiple02Icon, preview: true },
  { label: 'Reports', to: '/reports', icon: ChartIncreaseIcon, preview: true },
] as const
