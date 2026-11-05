import { useLayoutEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import {
  continueMarkdown,
  formatMarkdown,
  indentMarkdown,
} from '#/lib/markdown-editing'
import type { MarkdownFormat, MarkdownSelection } from '#/lib/markdown-editing'

const MAX_LENGTH = 1000

export function useMarkdownEditor(
  value: string,
  onChange: (value: string) => void,
) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const selection = useRef<MarkdownSelection>({ value, start: 0, end: 0 })
  const pendingSelection = useRef<MarkdownSelection | null>(null)
  const undo = useRef<MarkdownSelection[]>([])
  const redo = useRef<MarkdownSelection[]>([])
  const typing = useRef<{ time: number; end: number } | null>(null)
  const tabNavigation = useRef(false)
  const [limitReached, setLimitReached] = useState(false)

  useLayoutEffect(() => {
    if (selection.current.value !== value) {
      // An AI draft, successful send, or another external update starts a new history.
      undo.current = []
      redo.current = []
      typing.current = null
      selection.current = { value, start: value.length, end: value.length }
    }
    const pending = pendingSelection.current
    const input = inputRef.current
    if (pending && pending.value === value && input) {
      input.focus()
      input.setSelectionRange(pending.start, pending.end)
      pendingSelection.current = null
    }
  })

  function readSelection(): MarkdownSelection {
    const input = inputRef.current
    return {
      value,
      start: input?.selectionStart ?? selection.current.start,
      end: input?.selectionEnd ?? selection.current.end,
    }
  }

  function apply(
    next: MarkdownSelection,
    source: 'edit' | 'typing' | 'input' = 'edit',
  ) {
    if (next.value.length > MAX_LENGTH) {
      setLimitReached(true)
      return
    }
    setLimitReached(false)
    const groupTyping = source === 'typing'
    const previous = source === 'edit' ? readSelection() : selection.current
    const now = Date.now()
    if (
      !groupTyping ||
      !typing.current ||
      now - typing.current.time > 1000 ||
      previous.start !== previous.end ||
      previous.start !== typing.current.end
    ) {
      undo.current.push(previous)
      if (undo.current.length > 100) undo.current.shift()
    }
    redo.current = []
    typing.current = groupTyping ? { time: now, end: next.end } : null
    selection.current = next
    pendingSelection.current = groupTyping ? null : next
    onChange(next.value)
  }

  function format(kind: MarkdownFormat) {
    apply(formatMarkdown(readSelection(), kind))
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    if (event.key === 'Escape') {
      tabNavigation.current = true
      return
    }
    if (event.key === 'Tab' && tabNavigation.current) {
      tabNavigation.current = false
      return
    }
    tabNavigation.current = false
    const command = (event.ctrlKey || event.metaKey) && !event.altKey
    const key = event.key.toLowerCase()
    if (command && (key === 'z' || (key === 'y' && !event.shiftKey))) {
      event.preventDefault()
      event.stopPropagation()
      const backwards = key === 'z' && !event.shiftKey
      const from = backwards ? undo.current : redo.current
      const to = backwards ? redo.current : undo.current
      const next = from.pop()
      if (next) {
        to.push(readSelection())
        selection.current = next
        pendingSelection.current = next
        typing.current = null
        setLimitReached(false)
        onChange(next.value)
      }
      return
    }
    if (command && !event.shiftKey && ['b', 'i', 'k', 'e'].includes(key)) {
      event.preventDefault()
      // Keep editor shortcuts local (Ctrl/⌘+B also toggles the app sidebar).
      event.stopPropagation()
      format(
        key === 'b'
          ? 'bold'
          : key === 'i'
            ? 'italic'
            : key === 'k'
              ? 'link'
              : 'code',
      )
      return
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const next =
      event.key === 'Enter' && !event.shiftKey
        ? continueMarkdown(readSelection())
        : event.key === 'Tab'
          ? indentMarkdown(readSelection(), event.shiftKey)
          : null
    if (next) {
      event.preventDefault()
      apply(next)
    }
  }

  function onInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const input = event.currentTarget
    apply(
      {
        value: input.value,
        start: input.selectionStart,
        end: input.selectionEnd,
      },
      (event.nativeEvent as InputEvent).inputType === 'insertText'
        ? 'typing'
        : 'input',
    )
  }

  return {
    inputRef,
    format,
    restoreSelection: () => {
      pendingSelection.current = selection.current
    },
    limitReached,
    maxLength: MAX_LENGTH,
    inputProps: {
      onKeyDown,
      onChange: onInputChange,
      onSelect: () => {
        selection.current = readSelection()
      },
    },
  }
}
