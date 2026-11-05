import { describe, expect, it } from 'vitest'
import {
  continueMarkdown,
  formatMarkdown,
  indentMarkdown,
} from '#/lib/markdown-editing'

function draft(value: string, start = value.length, end = start) {
  return { value, start, end }
}

describe('Markdown editing boundaries', () => {
  it.each([
    ['- First step', '- First step\n- '],
    ['* First step', '* First step\n* '],
    ['9. First step', '9. First step\n10. '],
    ['2) First step', '2) First step\n3) '],
    ['- [x] Done', '- [x] Done\n- [ ] '],
    ['    - Nested step', '    - Nested step\n    - '],
    ['> Quoted message', '> Quoted message\n> '],
    ['> - Quoted step', '> - Quoted step\n> - '],
    ['- First\n- ', '- First\n'],
    ['1. First\n2. ', '1. First\n'],
    ['- [ ] ', ''],
    ['> - ', '> '],
    ['> ', ''],
  ])('continues or exits %j', (value, expected) => {
    expect(continueMarkdown(draft(value))).toEqual(draft(expected))
  })

  it('splits an item at the caret and preserves its following text', () => {
    expect(continueMarkdown(draft('- First second', 8))).toEqual({
      value: '- First \n- second',
      start: 11,
      end: 11,
    })
  })

  it.each(['Plain text', '```text\n- literal', '~~~\n1. literal'])(
    'leaves ordinary Enter handling to the textarea in %j',
    (value) => {
      expect(continueMarkdown(draft(value))).toBeNull()
    },
  )

  it('does not continue lists when replacing a selection', () => {
    expect(continueMarkdown(draft('- Delete this', 2, 8))).toBeNull()
  })

  it('indents selected list lines and restores them when outdented', () => {
    const original = draft('- First\n- Second\nUntouched', 0, 17)
    const nested = indentMarkdown(original, false)!
    expect(nested.value).toBe('    - First\n    - Second\nUntouched')
    expect(indentMarkdown(nested, true)).toEqual(original)
    expect(indentMarkdown(draft('Ordinary reply'), false)).toBeNull()
    expect(indentMarkdown(draft('- Root item'), true)).toBeNull()
    expect(indentMarkdown(draft('    - Nested', 1, 3), true)).toEqual({
      value: '- Nested',
      start: 0,
      end: 0,
    })
  })

  it('toggles selected formatting without including the markers in the selection', () => {
    const original = draft('Please retry', 7, 12)
    const bold = formatMarkdown(original, 'bold')
    expect(bold).toEqual({ value: 'Please **retry**', start: 9, end: 14 })
    expect(formatMarkdown(bold, 'bold')).toEqual(original)
  })

  it('formats whole lines, converts list styles, and excludes an unselected next line', () => {
    expect(
      formatMarkdown(draft('First\nSecond\nThird', 0, 13), 'orderedList').value,
    ).toBe('1. First\n2. Second\nThird')
    const checklist = formatMarkdown(
      draft('- First\n- Second', 0, 16),
      'taskList',
    )
    expect(checklist.value).toBe('- [ ] First\n- [ ] Second')
    expect(formatMarkdown(checklist, 'taskList').value).toBe('First\nSecond')
    expect(formatMarkdown(draft('\nReply', 0), 'list').value).toBe('- \nReply')
  })

  it('selects the link destination for immediate replacement', () => {
    const link = formatMarkdown(draft('Help guide', 0, 10), 'link')
    expect(link.value).toBe('[Help guide](https://example.com)')
    expect(link.value.slice(link.start, link.end)).toBe('https://example.com')
  })

  it('keeps selected whitespace outside emphasis so word selections render correctly', () => {
    const bold = formatMarkdown(draft('Please retry now', 7, 13), 'bold')
    expect(bold.value).toBe('Please **retry** now')
    expect(bold.value.slice(bold.start, bold.end)).toBe('retry')
    expect(formatMarkdown(draft('   ', 0, 3), 'bold')).toEqual(
      draft('   ', 0, 3),
    )
  })

  it('uses safe code fences when the selection already contains backticks', () => {
    const code = '```js\nconst value = 1\n```'
    const formatted = formatMarkdown(draft(code, 0, code.length), 'codeBlock')
    expect(formatted.value).toBe('````\n' + code + '\n````')
    expect(formatted.value.slice(formatted.start, formatted.end)).toBe(code)
  })
})
