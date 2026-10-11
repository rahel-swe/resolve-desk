import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight01Icon,
  BookOpen02Icon,
  PlusSignIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'
import { ArticlePreview } from '#/components/knowledge/article-preview'
import { PageHeading } from '#/components/workspace/page-heading'
import { EmptyState, ResourceError } from '#/components/workspace/state-panel'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { useAuth } from '#/providers/auth-provider'
import { useWorkspace } from '#/providers/workspace-provider'
import { formatRelativeTime } from '#/lib/ticket-utils'
import { Route } from '#/routes/knowledge'
import type { ApiKnowledgeArticle } from '#/services/ticket-service'

export default function KnowledgePage() {
  const authenticated = useRequireAuth()
  const { user } = useAuth()
  const { library } = useWorkspace()
  const { q } = Route.useSearch()
  const navigate = useNavigate()
  const [category, setCategory] = useState('all')
  const [selectedArticle, setSelectedArticle] =
    useState<ApiKnowledgeArticle | null>(null)
  if (!authenticated) return null
  const categories = [
    ...new Set(library.data.map((article) => article.category)),
  ].sort()
  const filtered = library.data.filter(
    (article) =>
      (category === 'all' || article.category === category) &&
      [article.title, article.content, ...article.tags].some((value) =>
        value.toLowerCase().includes(q.trim().toLowerCase()),
      ),
  )
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-9 sm:px-8 lg:px-10">
      <PageHeading
        title="Knowledge"
        description="Good answers, ready when you need them."
        action={
          user?.role === 'Admin' && (
            <Button nativeButton={false} render={<Link to="/knowledge/new" />}>
              <HugeiconsIcon icon={PlusSignIcon} />
              New article
            </Button>
          )
        }
      />
      <div className="mb-6 flex flex-col gap-3 border-b pb-6 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
          />
          <Input
            aria-label="Search knowledge articles"
            value={q}
            onChange={(event) =>
              void navigate({
                to: '/knowledge',
                search: { q: event.target.value },
                replace: true,
              })
            }
            placeholder="Search articles, topics, or tags…"
            className="pl-9"
          />
        </div>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value ?? 'all')}
        >
          <SelectTrigger
            aria-label="Filter articles by category"
            className="w-full rounded-md border-input px-3 sm:w-48"
          >
            <SelectValue>
              {category === 'all' ? 'All categories' : category}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {library.error ? (
        <ResourceError
          message={library.error}
          onRetry={() => void library.refresh()}
        />
      ) : library.loading ? (
        <div role="status" aria-label="Loading articles" className="space-y-6">
          {[0, 1, 2].map((value) => (
            <Skeleton key={value} className="h-24 w-full" />
          ))}
        </div>
      ) : filtered.length ? (
        <>
          <p className="mb-4 text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
          </p>
          <ul className="divide-y">
            {filtered.map((article) => (
              <li key={article.id}>
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start gap-5 rounded-none px-1 py-6 text-left whitespace-normal"
                  onClick={() => setSelectedArticle(article)}
                >
                  <HugeiconsIcon
                    icon={BookOpen02Icon}
                    className="size-6! shrink-0 text-muted-foreground"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="mb-2 block text-[11px] text-primary">
                      {article.category}
                    </span>
                    <span className="block font-heading text-2xl font-normal">
                      {article.title}
                    </span>
                    <span className="mt-2 block line-clamp-1 text-xs leading-6 text-muted-foreground">
                      {article.content}
                    </span>
                    <span className="mt-3 block text-[11px] text-muted-foreground">
                      Updated {formatRelativeTime(article.updatedAt)}
                    </span>
                  </span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                </Button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          title={
            library.data.length
              ? 'No matching articles'
              : 'Room for good answers'
          }
          description={
            library.data.length
              ? 'Try another topic or clear the category filter.'
              : 'Published support guides will appear here.'
          }
          action={
            library.data.length ? (
              <Button
                variant="outline"
                onClick={() => {
                  setCategory('all')
                  void navigate({
                    to: '/knowledge',
                    search: { q: '' },
                    replace: true,
                  })
                }}
              >
                Clear filters
              </Button>
            ) : user?.role === 'Admin' ? (
              <Button
                nativeButton={false}
                render={<Link to="/knowledge/new" />}
              >
                Write an article
              </Button>
            ) : undefined
          }
        />
      )}
      <ArticlePreview
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  )
}
