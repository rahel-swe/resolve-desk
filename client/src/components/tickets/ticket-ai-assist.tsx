import {
  ArtificialIntelligence02Icon,
  ArrowUpRight01Icon,
  BookOpen01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'
import type { TicketWorkspace } from '#/hooks/use-ticket-workspace'
import type { ApiKnowledgeArticle } from '#/services/ticket-service'

export function TicketAiAssist({
  workspace,
  onUseDraft,
  relatedArticle,
  onOpenArticle,
}: {
  workspace: TicketWorkspace
  onUseDraft: (value: string) => void
  relatedArticle?: ApiKnowledgeArticle
  onOpenArticle?: (article: ApiKnowledgeArticle) => void
}) {
  const suggestion = workspace.responseSuggestion

  return (
    <section
      className="rounded-lg border border-primary/25 bg-primary/3 p-4 sm:p-5"
      aria-labelledby="suggested-reply-heading"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3
          id="suggested-reply-heading"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <HugeiconsIcon
            icon={ArtificialIntelligence02Icon}
            className="size-7 text-primary"
          />
          Suggested reply
          <span className="font-normal text-muted-foreground">
            · For review
          </span>
        </h3>
        {suggestion && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            disabled={Boolean(workspace.busy)}
            onClick={() => void workspace.suggestResponse()}
          >
            {workspace.busy === 'response-ai' ? 'Drafting…' : 'Regenerate'}
          </button>
        )}
      </div>

      {suggestion ? (
        <div className="rounded-md border border-border/60 bg-muted p-4 text-sm leading-7">
          <p className="whitespace-pre-wrap wrap-break-word">
            {suggestion.suggestedReply}
          </p>
          {suggestion.suggestedSteps.length > 0 && (
            <details className="mt-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer">Suggested next steps</summary>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {suggestion.suggestedSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </details>
          )}
          {suggestion.escalationRecommendation && (
            <p className="mt-3 text-xs text-muted-foreground">
              {suggestion.escalationRecommendation}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-md bg-muted/70 p-4">
          <p className="max-w-sm text-xs leading-6 text-muted-foreground">
            A little help finding the right words. Generate a reply, review it,
            and make it your own.
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={Boolean(workspace.busy)}
            onClick={() => void workspace.suggestResponse()}
          >
            {workspace.busy === 'response-ai'
              ? 'Drafting…'
              : 'Draft a response'}
          </Button>
        </div>
      )}

      {(relatedArticle || suggestion) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          {relatedArticle ? (
            <button
              type="button"
              className="flex min-w-0 items-center gap-2 text-left text-xs"
              onClick={() => onOpenArticle?.(relatedArticle)}
            >
              <HugeiconsIcon
                icon={BookOpen01Icon}
                className="size-4 shrink-0 text-muted-foreground"
              />
              <span className="hidden text-muted-foreground sm:inline">
                Related knowledge:
              </span>
              <span className="line-clamp-1 text-primary underline underline-offset-4">
                {relatedArticle.title}
              </span>
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                className="size-3.5 shrink-0 text-primary"
              />
            </button>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              Review the draft before sending.
            </p>
          )}
          {suggestion && (
            <Button
              variant="outline"
              size="sm"
              disabled={Boolean(workspace.busy)}
              onClick={() => onUseDraft(suggestion.suggestedReply)}
            >
              Use draft
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
