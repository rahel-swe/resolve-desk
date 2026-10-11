import { createFileRoute } from '@tanstack/react-router'
import NewKnowledgePage from '#/pages/new-knowledge-page'
export const Route = createFileRoute('/knowledge/new')({ component: NewKnowledgePage })
