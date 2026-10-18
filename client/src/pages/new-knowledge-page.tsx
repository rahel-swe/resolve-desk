import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { PageHeading } from '#/components/workspace/page-heading'
import { EmptyState, ResourceError } from '#/components/workspace/state-panel'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { useAuth } from '#/providers/auth-provider'
import { useKnowledgeArticaleMutation } from '#/queries/knowledge-mutation'

export default function NewKnowledgePage() {
  const authenticated = useRequireAuth()
  const { user } = useAuth()
  const { mutate: createKnowledgeArticle, isPending: isSubmitting } =
    useKnowledgeArticaleMutation()

  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  if (!authenticated) return null

  if (user?.role !== 'Admin')
    return (
      <EmptyState
        title="Article publishing is for administrators"
        description="You can read the shared library, or ask an administrator to publish a guide."
        action={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/knowledge" />}
          >
            Back to knowledge
          </Button>
        }
      />
    )

  function handleSubmit() {
    if (isSubmitting) return

    setErrorMessage('')
    if (
      title.trim().length < 3 ||
      category.trim().length < 2 ||
      content.trim().length < 10
    ) {
      setErrorMessage(
        'Use at least 3 characters for the title, 2 for the category, and 10 for the article.',
      )
      return
    }

    createKnowledgeArticle(
      {
        title: title.trim(),
        category: category.trim(),
        content: content.trim(),
        tags: [
          ...new Set(
            tagsInput
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
          ),
        ],
      },
      {
        async onSuccess() {
          await navigate({ to: '/knowledge', search: { q: title.trim() } })
        },

        onError(error) {
          setErrorMessage(
            error.message || 'Unable to publish the article. Please try again.',
          )
        },
      },
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-9 sm:px-8 lg:px-10">
      <PageHeading
        title="New article"
        description="Turn a useful answer into shared knowledge."
        action={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/knowledge" />}
          >
            Back to library
          </Button>
        }
      />
      <form
        className="space-y-6 border-t pt-7"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
      >
        {errorMessage && <ResourceError message={errorMessage} />}
        <fieldset className="space-y-6" disabled={isSubmitting}>
          <div className="space-y-2">
            <label htmlFor="article-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="article-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={3}
              maxLength={100}
              required
              placeholder="How to resolve an account access issue"
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="article-category" className="text-sm font-medium">
                Category
              </label>
              <Input
                id="article-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                minLength={2}
                maxLength={30}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="article-tags" className="text-sm font-medium">
                Tags{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <Input
                id="article-tags"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="account, access, troubleshooting"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="article-content" className="text-sm font-medium">
              Article
            </label>
            <Textarea
              id="article-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={12}
              minLength={10}
              maxLength={10000}
              required
              placeholder="Explain the issue, the steps to resolve it, and how to confirm the fix."
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/10,000 characters
            </p>
          </div>
        </fieldset>
        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            nativeButton={false}
            render={<Link to="/knowledge" />}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing…' : 'Publish article'}
          </Button>
        </div>
      </form>
    </div>
  )
}
