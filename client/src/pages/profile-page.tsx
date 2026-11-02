import ProfileDetailsForm from '#/components/profile/profile-details-form'
import { Button } from '#/components/ui/button'
import { PageHeading } from '#/components/workspace/page-heading'
import { ResourceError } from '#/components/workspace/state-panel-components'
import { UserIdentity } from '#/components/workspace/user-identity'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { roleLabel } from '#/lib/user-utils'
import { useAuth } from '#/providers/auth-provider'
import { useProfileQuery } from '#/queries/profile-queries'
import { Link } from '@tanstack/react-router'

export default function ProfilePage() {
  const { user, signOut, isSigningOutPending } = useAuth()
  const isAuthenticated = useRequireAuth()

  const profileQuery = useProfileQuery(user?.id || null)
  const { isLoading: profileLoading, data: profileData } = profileQuery

  if (!isAuthenticated) return null

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-9 sm:px-8 lg:px-10">
      <PageHeading
        title="Your profile"
        description="A little about you, and your place in the workspace."
        action={
          <Link
            to="/settings"
            className="rounded-md bg-secondary px-4 py-2 text-sm hover:bg-muted"
          >
            Account settings
          </Link>
        }
      />

      {profileQuery.isError && (
        <ResourceError
          message="Your profile could not be loaded."
          onRetry={() => void profileQuery.refetch()}
        />
      )}
      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside>
          <div className="border-b pb-6">
            {!profileLoading && profileData && (
              <UserIdentity userProfile={profileData} />
            )}
          </div>
          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="text-muted-foreground">Email address</dt>
              <dd className="mt-1 break-all">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Workspace role</dt>
              <dd className="mt-1">{roleLabel(user?.role)}</dd>
            </div>
          </dl>
          <Button
            variant="destructive"
            className="mt-8"
            disabled={isSigningOutPending}
            onClick={async () => await signOut()}
          >
            {isSigningOutPending ? 'Signing out…' : 'Sign out'}
          </Button>
        </aside>
        {!profileLoading && profileData && (
          <ProfileDetailsForm profile={profileData} />
        )}
      </div>
    </div>
  )
}
