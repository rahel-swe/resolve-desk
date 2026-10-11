import { Badge } from '#/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import { formatDateTime } from '#/lib/ticket-utils'
import type { ApiKnowledgeArticle } from '#/services/ticket-service'

export function ArticlePreview({
  article,
  onClose,
}: {
  article: ApiKnowledgeArticle | null
  onClose: () => void
}) {
  return (
    <Sheet
      open={Boolean(article)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        <SheetHeader className="pt-12">
          <p className="mb-2 text-xs text-primary">{article?.category}</p>
          <SheetTitle className="font-heading text-4xl font-normal normal-case tracking-tight">
            {article?.title || 'Knowledge article'}
          </SheetTitle>
          <SheetDescription>
            {article
              ? `Updated ${formatDateTime(article.updatedAt)} by ${article.createdByEmail}`
              : 'Support knowledge article'}
          </SheetDescription>
        </SheetHeader>
        {article && (
          <div className="space-y-7 px-8 pb-12">
            <p className="whitespace-pre-wrap break-words text-sm leading-7">
              {article.content}
            </p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full bg-muted px-3 py-1 text-xs font-normal normal-case tracking-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
