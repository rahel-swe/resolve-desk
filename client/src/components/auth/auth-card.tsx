import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import type { FormEvent, ReactNode } from 'react'

type AuthCardProps = {
  title: string
  description: string
  children: ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function AuthCard({ title, description, children, onSubmit }: AuthCardProps) {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <Card className="w-full border-0 bg-transparent shadow-none">
        <CardHeader className="mb-2 text-center">
          <CardTitle className="font-heading text-5xl font-normal text-foreground">
            {title}
          </CardTitle>

          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-7">{children}</CardContent>
      </Card>
    </form>
  )
}

export default AuthCard
