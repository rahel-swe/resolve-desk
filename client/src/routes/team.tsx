import { createFileRoute } from '@tanstack/react-router'
import { TeamPage } from '#/pages/workspace-preview-page'

export const Route = createFileRoute('/team')({ component: TeamPage })
