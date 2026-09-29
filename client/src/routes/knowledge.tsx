import { getAuthToken } from '#/services/auth-service'
import { getKnowledgeArticles } from '#/services/ticket-service'
import type { ApiKnowledgeArticle } from '#/services/ticket-service'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { formatDateTime } from '#/lib/api'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

export const Route = createFileRoute('/knowledge')({ component: KnowledgePage })

function KnowledgePage() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<ApiKnowledgeArticle[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!getAuthToken()) {
      navigate({ to: '/sign-in' })
      return
    }

    let isMounted = true

    const loadArticles = async () => {
      try {
        const apiArticles = await getKnowledgeArticles()
        if (isMounted) setArticles(apiArticles)
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load knowledge base.',
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadArticles()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase()

    return articles.filter((article) => {
      if (!query) return true

      return (
        article.title.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      )
    })
  }, [articles, search])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Library
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Knowledge base
          </h1>
        </div>

        <Link to="/knowledge/new">
          <Button className="rounded-full">New article</Button>
        </Link>
      </div>

      <Card className="mb-6 border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search knowledge articles"
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {error ? (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
          Loading knowledge articles...
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="border-border bg-card shadow-sm">
              <CardHeader>
                <Badge variant="secondary" className="w-fit rounded-full">
                  {article.category}
                </Badge>
                <CardTitle className="mt-2 text-lg text-foreground">
                  {article.title}
                </CardTitle>
                <CardDescription>
                  Updated {formatDateTime(article.updatedAt)} · by{' '}
                  {article.createdByEmail}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="leading-7 text-foreground/90">
                  {article.content}
                </p>

                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-full">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground">
                  Updated by {article.createdByEmail}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
