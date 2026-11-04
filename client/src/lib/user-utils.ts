import type { AuthenticatedUser } from '#/types/user-types'

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function roleLabel(role?: AuthenticatedUser['role']) {
  return role === 'Staff'
    ? 'Support Staff'
    : role === 'Admin'
      ? 'Administrator'
      : 'Customer'
}
