import AuthCard from '#/components/auth/auth-card'
import PasswordField from '#/components/auth/password-field'
import { useAuth } from '#/providers/auth-provider'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export function SignUpPage() {
  const navigate = useNavigate()
  const { isAuthenticated, register } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async () => {
    setError('')

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Complete all fields to create your account.')
      return
    }

    try {
      setIsSubmitting(true)

      await register(
        fullName.trim(),
        email.trim(),
        password,
      )

      await navigate({
        to: '/dashboard',
      })
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'We couldn’t create your account. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Create your account"
      description="Create your ResolveDesk account and start managing support from one focused workspace."
      onSubmit={(event) => {
        event.preventDefault()
        void handleSubmit()
      }}
    >
      <div>
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="fullName"
        >
          Full name
        </label>

        <Input
          id="fullName"
          name="name"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Jordan Smith"
          autoComplete="name"
          disabled={isSubmitting}
          required
          autoFocus
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>

        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@resolvedesk.io"
          autoComplete="email"
          disabled={isSubmitting}
          required
        />
      </div>

      <PasswordField
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        disabled={isSubmitting}
      />

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-between text-muted-foreground">
        <Link
          to="/sign-in"
          className="underline-offset-4 text-xs hover:underline"
        >
          Already have an account? Sign in
        </Link>
      </div>

      <Button size="lg" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>
    </AuthCard>
  )
}

export default SignUpPage
