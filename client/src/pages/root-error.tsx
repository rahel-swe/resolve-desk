import type { ErrorComponentProps } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

function RootError({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : 'Unknown error'

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Something went wrong
      </p>
      <h1 className="font-heading text-5xl">We could not load this page.</h1>
      {import.meta.env.DEV ? (
        <pre className="max-w-full overflow-auto rounded-md border bg-muted p-4 text-left text-sm">
          {message}
        </pre>
      ) : null}
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </section>
  )
}

export default RootError
