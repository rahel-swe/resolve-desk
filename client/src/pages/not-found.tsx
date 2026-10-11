import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        404
      </p>
      <h1 className="font-heading text-5xl">Page not found</h1>
      <p className="text-muted-foreground">
        The page you requested does not exist or has moved.
      </p>
      <Button nativeButton={false} render={<Link to="/" />}>
        Return home
      </Button>
    </section>
  )
}

export default NotFound
