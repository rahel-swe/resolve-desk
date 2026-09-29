import { SignInPage } from '#/pages/sign-in-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/sign-in')({ component: SignInPage })
