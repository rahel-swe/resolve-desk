import { SignUpPage } from '#/pages/sign-up-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpPage,
})
