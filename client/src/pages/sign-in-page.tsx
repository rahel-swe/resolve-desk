import AuthCard from '#/components/auth/auth-card'
import PasswordField from '#/components/auth/password-field'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { getCurrentUser, loginWithApi, saveSession } from '#/lib/api'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export function SignInPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getCurrentUser()

    if (user) {
      navigate({ to: '/dashboard' })
    }
  }, [navigate])

  const handleSubmit = async () => {
    setError('')

    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.')
      return
    }

    try {
      setIsSubmitting(true)

      const session = await loginWithApi(email.trim(), password)

      saveSession(session)

      await navigate({
        to: '/dashboard',
      })
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'We couldn’t sign you in. Check your details and try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue managing customer conversations, knowledge, and support workflows."
      onSubmit={(event) => {
        event.preventDefault()
        void handleSubmit()
      }}
    >
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
          autoFocus
        />
      </div>

      <PasswordField
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
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
          to="/sign-up"
          className="underline-offset-4 text-xs hover:underline"
        >
          Don&apos;t have an account? Create one
        </Link>
      </div>

      <Button size="lg" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </AuthCard>
  )
}
