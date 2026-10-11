import { createFileRoute } from '@tanstack/react-router'
import { ReportsPage } from '#/pages/workspace-preview-page'
export const Route = createFileRoute('/reports')({ component: ReportsPage })
