import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { PageHeading } from '#/components/workspace/page-heading'
import { ResourceError } from '#/components/workspace/state-panel-components'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { useCreateTicketMutation } from '#/queries/ticket-mutations'
import { toast } from '#/components/ui/toast'
import { formatTicketPriority } from '#/lib/ticket-utils'
import type { TicketPriority } from '#/types/ticket-enums'

export default function NewTicketPage() {
  const authenticated = useRequireAuth()
  const navigate = useNavigate()
  const createTicketMutation = useCreateTicketMutation()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('Medium')
  const submitting = createTicketMutation.isPending
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!errorMessage) return

    toast.add({
      description: errorMessage,
      type: 'error',
    })
  }, [errorMessage])

  if (!authenticated) return null

  function handleSubmit() {
    if (submitting) return
    setErrorMessage('')

    if (
      title.trim().length < 5 ||
      description.trim().length < 10 ||
      category.trim().length < 2
    ) {
      setErrorMessage(
        'Use at least 5 characters for the title, 10 for the description, and 2 for the category.',
      )

      return
    }

    createTicketMutation.mutate(
      {
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        priority: priority,
      },
      {
        onSuccess: (ticket) => {
          navigate({
            to: '/tickets/$ticketId',
            params: { ticketId: String(ticket.id) },
          })
        },

        onError: (error) => {
          setErrorMessage(error.message)
        },
      },
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-9 sm:px-8 lg:px-10">
      <PageHeading
        title="New ticket"
        description="Tell us what's happening. We'll take it from here."
        action={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/tickets" />}
          >
            Back to queue
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
        <fieldset disabled={submitting} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="new-ticket-title" className="text-sm font-medium">
              Subject
            </label>
            <Input
              id="new-ticket-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={5}
              maxLength={200}
              required
              placeholder="A short summary of the issue"
            />
            <p className="text-xs text-muted-foreground">
              Make it easy to understand at a glance.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="new-ticket-category"
                className="text-sm font-medium"
              >
                Category
              </label>
              <Input
                id="new-ticket-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                minLength={2}
                maxLength={100}
                required
                placeholder="Account access, billing, technical…"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="new-ticket-priority"
                className="text-sm font-medium"
              >
                Priority
              </label>
              <Select
                value={priority}
                onValueChange={(value) => {
                  if (value !== null) setPriority(value)
                }}
              >
                <SelectTrigger id="new-ticket-priority" className="w-full">
                  <SelectValue>{formatTicketPriority(priority)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {['Low', 'Medium', 'High', 'Critical'].map((label, index) => (
                    <SelectItem key={label} value={String(index)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="new-ticket-description"
              className="text-sm font-medium"
            >
              Description
            </label>
            <Textarea
              id="new-ticket-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={8}
              minLength={10}
              maxLength={5000}
              required
              placeholder="Describe the issue, what you've tried, and how it affects your work."
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/5,000 characters
            </p>
          </div>
        </fieldset>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            nativeButton={false}
            render={<Link to="/tickets" />}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create ticket'}
          </Button>
        </div>
      </form>
    </div>
  )
}
