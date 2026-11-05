import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '#/lib/utils'

export function MarkdownContent({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'ticket-markdown prose prose-sm max-w-none wrap-break-word [overflow-wrap:anywhere] [&_p]:whitespace-pre-wrap [&_table]:block [&_table]:overflow-x-auto',
        className,
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        disallowedElements={['img']}
      >
        {children}
      </Markdown>
    </div>
  )
}
