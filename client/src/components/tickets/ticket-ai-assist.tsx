import { ArtificialIntelligence02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'
import { formatTicketPriority } from '#/lib/ticket-utils'
import type { TicketWorkspace } from '#/hooks/use-ticket-workspace'

export function TicketAiAssist({
  workspace,
  onUseDraft,
}: {
  workspace: TicketWorkspace
  onUseDraft: (value: string) => void
}) {
  const { prioritySuggestion, responseSuggestion } = workspace
  return (
    <section className="mt-7 border-t pt-6">
      <h2 className="flex items-center gap-2 font-heading text-3xl">
        <HugeiconsIcon
          icon={ArtificialIntelligence02Icon}
          className="size-5 text-primary"
        />
        AI assist
      </h2>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Suggestions for review. You decide what to use.
      </p>
      <div className="mt-5 space-y-3">
        <Button
          variant="outline"
          className="w-full"
          disabled={Boolean(workspace.busy)}
          onClick={() => void workspace.suggestPriority()}
        >
          {workspace.busy === 'priority-ai' ? 'Thinking…' : 'Suggest priority'}
        </Button>
        {prioritySuggestion && (
          <div className="rounded-md bg-muted/50 p-4 text-sm">
            <p className="font-medium">
              {formatTicketPriority(prioritySuggestion.suggestedPriority)}
            </p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              {prioritySuggestion.rationale}
            </p>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full"
          disabled={Boolean(workspace.busy)}
          onClick={() => void workspace.suggestResponse()}
        >
          {workspace.busy === 'response-ai' ? 'Drafting…' : 'Draft a response'}
        </Button>
        {responseSuggestion && (
          <div className="space-y-4 rounded-md bg-muted/50 p-4">
            <p className="text-xs font-medium text-primary">Draft for review</p>
            <p className="whitespace-pre-wrap break-words text-sm leading-6">
              {responseSuggestion.suggestedReply}
            </p>
            {responseSuggestion.suggestedSteps.length > 0 && (
              <ul className="list-disc space-y-2 pl-4 text-xs leading-5 text-muted-foreground">
                {responseSuggestion.suggestedSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            )}
            {responseSuggestion.escalationRecommendation && (
              <p className="text-xs leading-5 text-muted-foreground">
                {responseSuggestion.escalationRecommendation}
              </p>
            )}
            <Button
              variant="outline"
              className="w-full"
              disabled={Boolean(workspace.busy)}
              onClick={() => onUseDraft(responseSuggestion.suggestedReply)}
            >
              Use draft
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
