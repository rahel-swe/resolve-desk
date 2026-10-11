import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Switch } from '#/components/ui/switch'
import { PageHeading } from '#/components/workspace/page-heading'
import { PreviewNotice } from '#/components/workspace/state-panel'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { useAuth } from '#/providers/auth-provider'
import { roleLabel } from '#/lib/user-utils'

export default function SettingsPage() {
  const authenticated = useRequireAuth()
  const { user } = useAuth()
  if (!authenticated) return null
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-9 sm:px-8 lg:px-10">
      <PageHeading title="Settings" description="Make space for the way you work." />
      <div className="space-y-9">
        <section className="grid gap-5 border-b pb-8 md:grid-cols-[240px_minmax(0,1fr)]">
          <div><h2 className="font-heading text-3xl">Account</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Your sign-in and workspace identity.</p></div>
          <div className="space-y-5 text-sm"><div className="flex flex-wrap justify-between gap-2"><span className="text-muted-foreground">Email address</span><span className="break-all">{user?.email}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Role</span><span>{roleLabel(user?.role)}</span></div><Link to="/profile" className="inline-block text-primary hover:underline">View your profile</Link></div>
        </section>
        <NotificationPreferences />
        <section className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
          <div><h2 className="font-heading text-3xl">Workspace</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">A calm place to focus on support.</p></div>
          <dl className="space-y-5 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Appearance</dt><dd>Warm dark</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Workspace</dt><dd>Support workspace</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Time zone</dt><dd>{Intl.DateTimeFormat().resolvedOptions().timeZone}</dd></div></dl>
        </section>
      </div>
    </div>
  )
}

function NotificationPreferences() {
  const [assignments, setAssignments] = useState(true)
  const [replies, setReplies] = useState(true)
  const [notice, setNotice] = useState('')
  return (
    <section className="grid gap-5 border-b pb-8 md:grid-cols-[240px_minmax(0,1fr)]">
      <div><h2 className="font-heading text-3xl">Notifications</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Keep up with work that needs you.</p></div>
      <div>
        <PreviewNotice>Notification preferences are not connected yet. These controls preview the experience without sending emails or changing account settings.</PreviewNotice>
        <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); setNotice('Preferences previewed. No account settings were changed.') }}>
          <div className="flex items-center justify-between gap-6"><label htmlFor="assignment-notifications" className="text-sm"><span className="block font-medium">Ticket assignments</span><span className="mt-1 block text-muted-foreground">When a ticket is assigned to you.</span></label><Switch id="assignment-notifications" checked={assignments} onCheckedChange={(value) => { setAssignments(value); setNotice('') }} /></div>
          <div className="flex items-center justify-between gap-6"><label htmlFor="reply-notifications" className="text-sm"><span className="block font-medium">New comments</span><span className="mt-1 block text-muted-foreground">When someone comments on your ticket.</span></label><Switch id="reply-notifications" checked={replies} onCheckedChange={(value) => { setReplies(value); setNotice('') }} /></div>
          <Button type="submit" variant="outline">Save preview</Button>
          {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
        </form>
      </div>
    </section>
  )
}
