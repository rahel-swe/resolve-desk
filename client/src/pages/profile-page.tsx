import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { PageHeading } from '#/components/workspace/page-heading'
import { PreviewNotice, ResourceError } from '#/components/workspace/state-panel'
import { UserIdentity } from '#/components/workspace/user-identity'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { displayName, roleLabel } from '#/lib/user-utils'
import { useAuth } from '#/providers/auth-provider'

export default function ProfilePage() {
  const authenticated = useRequireAuth()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  if (!authenticated) return null

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      await navigate({ to: '/sign-in', replace: true })
    } catch {
      // The auth service clears the local session even if logout is unavailable.
      await navigate({ to: '/sign-in', replace: true })
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-9 sm:px-8 lg:px-10">
      <PageHeading title="Your profile" description="A little about you, and your place in the workspace." action={<Link to="/settings" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Account settings</Link>} />
      {error && <ResourceError message={error} />}
      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside>
          <div className="border-b pb-6"><UserIdentity user={user} /></div>
          <dl className="mt-6 space-y-5 text-sm">
            <div><dt className="text-muted-foreground">Email address</dt><dd className="mt-1 break-all">{user?.email}</dd></div>
            <div><dt className="text-muted-foreground">Workspace role</dt><dd className="mt-1">{roleLabel(user?.role)}</dd></div>
          </dl>
          <Button variant="outline" className="mt-8" disabled={signingOut} onClick={() => void handleSignOut()}>{signingOut ? 'Signing out…' : 'Sign out'}</Button>
        </aside>
        <ProfileDetailsForm key={user?.email} name={displayName(user?.email)} onError={setError} />
      </div>
    </div>
  )
}

function ProfileDetailsForm({ name, onError }: { name: string; onError: (message: string) => void }) {
  const [fullName, setFullName] = useState(name)
  const [bio, setBio] = useState('')
  const [notice, setNotice] = useState('')
  return (
    <section className="max-w-2xl">
      <h2 className="mb-4 font-heading text-3xl">Personal details</h2>
      <PreviewNotice>Profile editing is coming soon. You can try this form; changes stay on this page and do not update your account.</PreviewNotice>
      <form className="space-y-6" onSubmit={(event) => {
        event.preventDefault()
        onError('')
        if (!fullName.trim()) { onError('Enter a display name.'); return }
        setNotice('Preview updated for this visit. Your account details have not changed.')
      }}>
        <div className="space-y-2"><label htmlFor="profile-name" className="text-sm font-medium">Display name</label><Input id="profile-name" value={fullName} maxLength={80} onChange={(event) => { setFullName(event.target.value); setNotice('') }} required /></div>
        <div className="space-y-2"><label htmlFor="profile-bio" className="text-sm font-medium">About you</label><Textarea id="profile-bio" value={bio} maxLength={500} onChange={(event) => { setBio(event.target.value); setNotice('') }} placeholder="A few words about your work…" rows={4} /><p className="text-xs text-muted-foreground">{bio.length}/500 characters</p></div>
        <div className="flex flex-wrap items-center gap-3 border-t pt-5"><Button type="submit">Save preview</Button><Button type="button" variant="ghost" onClick={() => { setFullName(name); setBio(''); setNotice(''); onError('') }}>Reset</Button></div>
        {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
      </form>
    </section>
  )
}
