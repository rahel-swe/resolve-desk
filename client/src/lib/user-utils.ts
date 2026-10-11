import type { User } from '#/providers/auth-provider'

export function displayName(email?: string | null) {
  const name = email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim()
  return name ? name.replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Your account'
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function roleLabel(role?: User['role']) {
  return role === 'SupportAgent' ? 'Support agent' : role === 'Admin' ? 'Administrator' : 'Customer'
}
