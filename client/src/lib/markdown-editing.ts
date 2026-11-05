export type MarkdownSelection = {
  value: string
  start: number
  end: number
}

export type MarkdownFormat =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'link'
  | 'code'
  | 'codeBlock'
  | 'list'
  | 'orderedList'
  | 'taskList'
  | 'quote'

function replace(
  draft: MarkdownSelection,
  from: number,
  to: number,
  text: string,
  start = from + text.length,
  end = start,
): MarkdownSelection {
  return {
    value: draft.value.slice(0, from) + text + draft.value.slice(to),
    start,
    end,
  }
}

function lineRange({ value, start, end }: MarkdownSelection) {
  const from = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1
  // A selection ending at the next line's start excludes that line.
  const last = end > start && value[end - 1] === '\n' ? end - 1 : end
  const newline = value.indexOf('\n', last)
  return { from, to: newline < 0 ? value.length : newline }
}

function inCodeFence(value: string, position: number) {
  let fence = ''
  for (const line of value.slice(0, position).split('\n')) {
    const match = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line)
    if (!match) continue
    if (!fence) fence = match[1]
    else if (
      match[1][0] === fence[0] &&
      match[1].length >= fence.length &&
      !match[2].trim()
    )
      fence = ''
  }
  return Boolean(fence)
}

function listPrefix(line: string) {
  const match =
    /^([ \t]*)((?:>[ \t]?)+)?(?:([-+*]|\d+[.)])[ \t]+(?:\[([ xX])\][ \t]+)?)?/.exec(
      line,
    )!
  if (!match[2] && !match[3]) return null
  return {
    prefix: match[0],
    indent: match[1],
    quote: match[2] || '',
    marker: match[3] || '',
    task: Boolean(match[4]),
  }
}

export function continueMarkdown(draft: MarkdownSelection) {
  if (draft.start !== draft.end || inCodeFence(draft.value, draft.start))
    return null
  const { from, to } = lineRange(draft)
  const line = draft.value.slice(from, to)
  const prefix = listPrefix(line)
  if (!prefix || draft.start < from + prefix.prefix.length) return null

  if (!line.slice(prefix.prefix.length).trim()) {
    // Remove one empty structure at a time: list, then quote/indentation.
    const remaining = prefix.marker
      ? prefix.indent + prefix.quote
      : prefix.indent
    return replace(draft, from, to, remaining)
  }

  const marker = /^\d/.test(prefix.marker)
    ? `${Number.parseInt(prefix.marker, 10) + 1}${prefix.marker.at(-1)}`
    : prefix.marker
  const next =
    prefix.indent +
    prefix.quote +
    (marker ? `${marker} ${prefix.task ? '[ ] ' : ''}` : '')
  return replace(draft, draft.start, draft.end, `\n${next}`)
}

export function indentMarkdown(draft: MarkdownSelection, outdent: boolean) {
  if (inCodeFence(draft.value, draft.start)) return null
  const { from, to } = lineRange(draft)
  const lines = draft.value.slice(from, to).split('\n')
  // Keep Tab as keyboard navigation outside lists.
  if (!lines.every((line) => Boolean(listPrefix(line)?.marker))) return null
  const changes = lines.map((line) =>
    outdent ? -(line.match(/^(?: {1,4}|\t)/)?.[0].length || 0) : 4,
  )
  if (changes.every((change) => change === 0)) return null
  const text = lines
    .map((line, index) =>
      changes[index] < 0
        ? line.slice(-changes[index])
        : ' '.repeat(changes[index]) + line,
    )
    .join('\n')
  function mapPosition(position: number) {
    let oldStart = from
    let newStart = from
    for (let index = 0; index < lines.length; index++) {
      if (position <= oldStart + lines[index].length) {
        return newStart + Math.max(0, position - oldStart + changes[index])
      }
      oldStart += lines[index].length + 1
      newStart += lines[index].length + changes[index] + 1
    }
    return newStart
  }
  return replace(
    draft,
    from,
    to,
    text,
    mapPosition(draft.start),
    mapPosition(draft.end),
  )
}

export function formatMarkdown(
  draft: MarkdownSelection,
  kind: MarkdownFormat,
): MarkdownSelection {
  const { value, start, end } = draft
  const selected = value.slice(start, end)

  // Markers touching whitespace do not render as emphasis in Markdown.
  if (
    ['bold', 'italic', 'strike'].includes(kind) &&
    selected &&
    selected.trim() !== selected
  ) {
    if (!selected.trim()) return draft
    return formatMarkdown(
      {
        value,
        start: start + selected.length - selected.trimStart().length,
        end: end - selected.length + selected.trimEnd().length,
      },
      kind,
    )
  }

  if (['list', 'orderedList', 'taskList', 'quote'].includes(kind)) {
    const { from, to } = lineRange(draft)
    const lines = value.slice(from, to).split('\n')
    const pattern =
      kind === 'quote'
        ? /^([ \t]*)> ?/
        : kind === 'taskList'
          ? /^([ \t]*)[-+*] \[[ xX]\] /
          : kind === 'orderedList'
            ? /^([ \t]*)\d+[.)] /
            : /^([ \t]*)[-+*] (?!\[[ xX]\] )/
    const remove = lines.every((line) => pattern.test(line))
    const text = lines
      .map((line, index) => {
        if (remove) return line.replace(pattern, '$1')
        const indent = line.match(/^[ \t]*/)![0]
        const content =
          kind === 'quote'
            ? line.slice(indent.length)
            : line
                .slice(indent.length)
                .replace(/^(?:[-+*]|\d+[.)]) (?:\[[ xX]\] )?/, '')
        const marker =
          kind === 'quote'
            ? '> '
            : kind === 'taskList'
              ? '- [ ] '
              : kind === 'orderedList'
                ? `${index + 1}. `
                : '- '
        return indent + marker + content
      })
      .join('\n')
    const next = replace(draft, from, to, text)
    // Leave the caret ready to type, or keep complete lines selected.
    return start === end
      ? next
      : { ...next, start: from, end: from + text.length }
  }

  if (kind === 'link') {
    const label = selected || 'link text'
    const url = 'https://example.com'
    const text = `[${label}](${url})`
    return replace(
      draft,
      start,
      end,
      text,
      start + label.length + 3,
      start + label.length + 3 + url.length,
    )
  }

  let marker =
    kind === 'bold'
      ? '**'
      : kind === 'italic'
        ? '_'
        : kind === 'strike'
          ? '~~'
          : '`'
  if (kind === 'code' || kind === 'codeBlock') {
    const runs = selected.match(/`+/g) || []
    marker = '`'.repeat(
      Math.max(
        kind === 'codeBlock' ? 3 : 1,
        ...runs.map((run) => run.length + 1),
      ),
    )
  }
  if (kind === 'codeBlock') {
    const before = start > 0 && value[start - 1] !== '\n' ? '\n' : ''
    const after = end < value.length && value[end] !== '\n' ? '\n' : ''
    const content = selected || 'code'
    const text = `${before}${marker}\n${content}\n${marker}${after}`
    const cursor = start + before.length + marker.length + 1
    return replace(draft, start, end, text, cursor, cursor + content.length)
  }
  if (
    selected.startsWith(marker) &&
    selected.endsWith(marker) &&
    selected.length >= marker.length * 2
  ) {
    const text = selected.slice(marker.length, -marker.length)
    return replace(draft, start, end, text, start, start + text.length)
  }
  if (
    value.slice(start - marker.length, start) === marker &&
    value.slice(end, end + marker.length) === marker
  ) {
    return replace(
      draft,
      start - marker.length,
      end + marker.length,
      selected,
      start - marker.length,
      end - marker.length,
    )
  }
  const text = selected || 'text'
  const padding = kind === 'code' && /^`|`$|^ | $/.test(text) ? ' ' : ''
  const wrapped = `${marker}${padding}${text}${padding}${marker}`
  const cursor = start + marker.length + padding.length
  return replace(draft, start, end, wrapped, cursor, cursor + text.length)
}
