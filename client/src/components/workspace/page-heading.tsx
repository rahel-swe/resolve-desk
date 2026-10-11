import type { ReactNode } from 'react'

type PageHeadingProps = {
  title: string
  description?: string
  eyebrow?: ReactNode
  action?: ReactNode
}

export function PageHeading({ title, description, eyebrow, action }: PageHeadingProps) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
      <div className="min-w-0">
        {eyebrow && <p className="mb-3 text-xs tracking-wider text-muted-foreground">{eyebrow}</p>}
        <h1 className="font-heading text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-[58px]">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </header>
  )
}
