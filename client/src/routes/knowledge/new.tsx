import { createKnowledgeArticle } from '#/services/ticket-service'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '#/providers/auth-provider'

export const Route = createFileRoute('/knowledge/new')({
  component: NewKnowledgePage,
})

function NewKnowledgePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/sign-in' })
    }
  }, [navigate])

  const handleSubmit = async () => {
    setError('')

    if (!title.trim() || !content.trim() || !category.trim()) {
      setError('Title, category, and article content are required.')
      return
    }

    try {
      setIsSubmitting(true)
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      await createKnowledgeArticle({
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        tags,
      })

      navigate({ to: '/knowledge' })
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to create the knowledge article.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            New knowledge article
          </h1>
        </div>

        <Link to="/knowledge">
          <Button variant="secondary" className="rounded-full">
            Back to library
          </Button>
        </Link>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Article details
          </CardTitle>
          <CardDescription>
            Publish a support guide and tag it for faster resolution.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="title"
            >
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="SSO login troubleshooting guide"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="category"
              >
                Category
              </label>
              <Input
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Access, Billing, Reports"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="tags"
              >
                Tags
              </label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="sso, identity, login"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="content"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              placeholder="Write the troubleshooting guidance, remediation steps, and validation criteria here."
              className="flex min-h-[220px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex justify-end">
            <Button
              className="rounded-full"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish article'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
