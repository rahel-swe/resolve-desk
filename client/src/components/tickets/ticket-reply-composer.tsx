import { useState } from 'react'
import {
  Attachment01Icon,
  InformationCircleIcon,
  LeftToRightListBulletIcon,
  Link01Icon,
  SentIcon,
  TextBoldIcon,
  TextItalicIcon,
  MoreHorizontalIcon,
  LeftToRightListNumberIcon,
  CheckListIcon,
  QuoteUpIcon,
  SourceCodeIcon,
  TextStrikethroughIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '#/components/ui/dropdown-menu'
import { MarkdownContent } from '#/components/markdown-content'
import { useMarkdownEditor } from '#/hooks/use-markdown-editor'
import type { TicketWorkspace } from '#/hooks/use-ticket-workspace'

export function TicketReplyComposer({
  workspace,
  message,
  onMessage,
}: {
  workspace: TicketWorkspace
  message: string
  onMessage: (value: string) => void
}) {
  const editor = useMarkdownEditor(message, onMessage)
  const [preview, setPreview] = useState(false)
  const busy = Boolean(workspace.busy)
  const requester = workspace.data?.ticket.createdByFullName || 'the requester'

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void workspace.addComment(message).then((success) => {
          if (success) {
            onMessage('')
            setPreview(false)
          }
        })
      }}
    >
      <div className="overflow-hidden rounded-lg border border-input bg-muted/55 transition-colors focus-within:border-ring/60">
        <label htmlFor="ticket-comment" className="sr-only">
          Add a comment
        </label>
        {preview ? (
          <div
            id="ticket-reply-preview"
            tabIndex={0}
            role="region"
            aria-label="Reply preview"
            className="max-h-80 min-h-32 overflow-y-scroll overscroll-y-contain px-5 py-4 [scrollbar-color:var(--muted-foreground)_transparent] [scrollbar-width:thin]"
          >
            {message.trim() ? (
              <MarkdownContent>{message}</MarkdownContent>
            ) : (
              <p className="text-muted-foreground">
                Your reply preview will appear here.
              </p>
            )}
          </div>
        ) : (
          <Textarea
            ref={editor.inputRef}
            id="ticket-comment"
            value={message}
            {...editor.inputProps}
            aria-describedby="ticket-reply-help ticket-reply-limit"
            placeholder="Write a reply…"
            rows={4}
            required
            minLength={5}
            maxLength={editor.maxLength}
            disabled={busy}
            className="max-h-80 min-h-32 resize-none overflow-y-scroll overscroll-y-contain rounded-none border-0 bg-transparent px-5 py-4 shadow-none focus-visible:ring-0 [scrollbar-color:var(--muted-foreground)_transparent] [scrollbar-width:thin] md:text-sm"
          />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-3 sm:px-4">
          <div className="flex items-center gap-0.5 text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Bold"
              title="Bold (Ctrl/⌘+B)"
              disabled={busy || preview}
              onClick={() => editor.format('bold')}
            >
              <HugeiconsIcon icon={TextBoldIcon} className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Italic"
              title="Italic (Ctrl/⌘+I)"
              disabled={busy || preview}
              onClick={() => editor.format('italic')}
            >
              <HugeiconsIcon icon={TextItalicIcon} className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Insert link"
              title="Insert link (Ctrl/⌘+K)"
              disabled={busy || preview}
              onClick={() => editor.format('link')}
            >
              <HugeiconsIcon icon={Link01Icon} className="size-4" />
            </Button>
            <span title="Attachments are coming soon">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Attachments coming soon"
                disabled
              >
                <HugeiconsIcon icon={Attachment01Icon} className="size-4" />
              </Button>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Bulleted list"
              title="Bulleted list"
              disabled={busy || preview}
              onClick={() => editor.format('list')}
            >
              <HugeiconsIcon
                icon={LeftToRightListBulletIcon}
                className="size-4"
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={busy || preview}
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="More formatting"
                    title="More formatting"
                  />
                }
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="top"
                className="w-52 [&_[data-slot=dropdown-menu-item]]:normal-case [&_[data-slot=dropdown-menu-item]]:tracking-normal"
                finalFocus={editor.inputRef}
              >
                <DropdownMenuItem onClick={() => editor.format('orderedList')}>
                  <HugeiconsIcon icon={LeftToRightListNumberIcon} />
                  Numbered list
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.format('taskList')}>
                  <HugeiconsIcon icon={CheckListIcon} />
                  Checklist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.format('quote')}>
                  <HugeiconsIcon icon={QuoteUpIcon} />
                  Quote
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.format('code')}>
                  <HugeiconsIcon icon={SourceCodeIcon} />
                  Inline code
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    Ctrl/⌘ E
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.format('codeBlock')}>
                  <HugeiconsIcon icon={SourceCodeIcon} />
                  Code block
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.format('strike')}>
                  <HugeiconsIcon icon={TextStrikethroughIcon} />
                  Strikethrough
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="text-[11px] text-muted-foreground hover:text-foreground"
              aria-pressed={preview}
              aria-controls={
                preview ? 'ticket-reply-preview' : 'ticket-comment'
              }
              onClick={() => {
                if (preview) editor.restoreSelection()
                setPreview((value) => !value)
              }}
            >
              {preview ? 'Write' : 'Preview'}
            </button>
            <Button
              type="submit"
              disabled={
                busy || message.trim().length < 5 || message.length > 1000
              }
              className="gap-2 px-4"
            >
              <HugeiconsIcon icon={SentIcon} className="size-4" />
              {workspace.busy === 'comment' ? 'Sending…' : 'Send reply'}
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 text-[11px] leading-5 text-muted-foreground">
        <p className="flex items-center gap-2">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="size-3.5 shrink-0"
          />
          {workspace.user?.role === 'Customer'
            ? 'Replies are visible to the support team.'
            : `Reply visible to ${requester}.`}
        </p>
        {message.length > 800 && (
          <span className="shrink-0">{message.length}/1,000</span>
        )}
      </div>
      <details
        id="ticket-reply-help"
        className="mt-2 text-[11px] leading-5 text-muted-foreground"
      >
        <summary className="w-fit cursor-pointer rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
          Markdown tips
        </summary>
        <p className="mt-1">
          Enter continues a list or quote. Enter on an empty item ends it.
          Shift+Enter inserts a plain new line. Tab / Shift+Tab indents lists;
          Esc then Tab moves focus.
        </p>
        <p>
          Ctrl / ⌘ + B for bold, I for italic, K for a link, E for inline code.
          Ctrl / ⌘ + Z undoes; Shift+Z redoes. Preview your reply before
          sending.
        </p>
      </details>
      <p
        id="ticket-reply-limit"
        aria-live="polite"
        className="text-[11px] leading-5 text-destructive"
      >
        {editor.limitReached
          ? 'This formatting would exceed the 1,000-character reply limit.'
          : ''}
      </p>
    </form>
  )
}
