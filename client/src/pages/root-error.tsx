import type { ErrorComponentProps } from '@tanstack/react-router'

function RootError({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : 'Unknown error'

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Something went wrong
      </p>
      <h1 className="text-3xl font-semibold">We could not load this page.</h1>
      {import.meta.env.DEV ? (
        <pre className="max-w-full overflow-auto rounded-md border bg-muted p-4 text-left text-sm">
          {message}
        </pre>
      ) : null}
      <button
        type="button"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        onClick={reset}
      >
        Try again
      </button>
    </section>
  )
}

export default RootError
