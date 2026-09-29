import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { createTicket, getAuthToken } from '#/lib/api'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/tickets/new')({
  component: NewTicketPage,
})

function NewTicketPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!getAuthToken()) {
      navigate({ to: '/sign-in' })
    }
  }, [navigate])

  const handleSubmit = async () => {
    setError('')

    if (!title.trim() || !description.trim() || !category.trim()) {
      setError('Title, category, and description are required.')
      return
    }

    try {
      setIsSubmitting(true)
      await createTicket({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority: Number(priority),
      })

      navigate({
        to: '/tickets',
      })
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to create the ticket right now.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Create
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            New ticket
          </h1>
        </div>

        <Link to="/tickets">
          <Button variant="secondary" className="rounded-full">
            Back to queue
          </Button>
        </Link>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Ticket details
          </CardTitle>
          <CardDescription>
            Submit a new support case to the backend.
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
              placeholder="Example: login loop after password reset"
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
                placeholder="Billing, Access, Reports..."
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="priority"
              >
                Priority
              </label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value ?? '')}
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Low</SelectItem>
                  <SelectItem value="1">Medium</SelectItem>
                  <SelectItem value="2">High</SelectItem>
                  <SelectItem value="3">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="description"
            >
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={8}
              placeholder="Describe the issue, impact, and customer context."
              className="min-h-[160px]"
            />
          </div>

          <div className="flex justify-end">
            <Button
              className="rounded-full"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create ticket'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
