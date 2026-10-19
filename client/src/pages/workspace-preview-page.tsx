import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { PageHeading } from '#/components/workspace/page-heading'
import {
  EmptyState,
  PreviewNotice,
} from '#/components/workspace/state-panel-components'
import { UserIdentity } from '#/components/workspace/user-identity'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { useAuth } from '#/providers/auth-provider'
import { roleLabel } from '#/lib/user-utils'

export function TeamPage() {
  const authenticated = useRequireAuth()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  if (!authenticated) return null
  const matches = user?.email.toLowerCase().includes(query.trim().toLowerCase())
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-9 sm:px-8 lg:px-10">
      <PageHeading
        title="Your team"
        description="Good support starts with people."
        action={<Button disabled>Invite member · Coming soon</Button>}
      />
      <PreviewNotice>
        Team management is coming soon. Only your signed-in account is shown
        here; a workspace directory and invitations are not connected yet.
      </PreviewNotice>
      <Input
        aria-label="Search team members"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by email…"
        className="mb-6 max-w-sm"
      />
      {matches ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Account</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <UserIdentity user={user} />
              </TableCell>
              <TableCell>{user?.email}</TableCell>
              <TableCell>{roleLabel(user?.role)}</TableCell>
              <TableCell className="text-muted-foreground">You</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title="No matching member"
          description="Try your signed-in email address."
        />
      )}
    </div>
  )
}

export function ReportsPage() {
  const authenticated = useRequireAuth()
  if (!authenticated) return null
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-9 sm:px-8 lg:px-10">
      <PageHeading
        title="Reports"
        description="A clearer picture of your support work."
        action={
          <Button variant="outline" disabled>
            Export report · Coming soon
          </Button>
        }
      />
      <PreviewNotice>
        Reports are coming soon. Historical reporting, response times, and
        exports are not connected yet.
      </PreviewNotice>
      <div className="grid grid-cols-1 gap-6 border-y py-7 sm:grid-cols-3">
        {['Tickets resolved', 'First response time', 'Resolution time'].map(
          (label) => (
            <div key={label}>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 font-heading text-5xl text-muted-foreground">
                —
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Available when reports are connected
              </p>
            </div>
          ),
        )}
      </div>
      <EmptyState
        title="Your support story, in one place"
        description="This space will show trends and team performance when reporting is available."
      />
    </div>
  )
}
