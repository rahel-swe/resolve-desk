import { useState } from 'react'
import { Textarea } from '../ui/textarea'
import { PreviewNotice } from '../workspace/state-panel-components'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import type { UserProfile } from '#/types/user-types'

function ProfileDetailsForm({ profile }: { profile: UserProfile }) {
  const [fullName, setFullName] = useState(profile.fullName)
  const [bio, setBio] = useState('')
  const [notice, setNotice] = useState('')
  return (
    <section className="max-w-2xl">
      <h2 className="mb-4 font-heading text-3xl">Personal details</h2>
      <PreviewNotice>
        Profile editing is coming soon. You can try this form; changes stay on
        this page and do not update your account.
      </PreviewNotice>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault()
          //   onError('')
          if (!fullName.trim()) {
            // onError('Enter a display name.')
            return
          }
          setNotice(
            'Preview updated for this visit. Your account details have not changed.',
          )
        }}
      >
        <div className="space-y-2">
          <label htmlFor="profile-name" className="text-sm font-medium">
            Display name
          </label>
          <Input
            id="profile-name"
            value={fullName}
            maxLength={80}
            onChange={(event) => {
              setFullName(event.target.value)
              setNotice('')
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="profile-bio" className="text-sm font-medium">
            About you
          </label>
          <Textarea
            id="profile-bio"
            value={bio}
            maxLength={500}
            onChange={(event) => {
              setBio(event.target.value)
              setNotice('')
            }}
            placeholder="A few words about your work…"
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            {bio.length}/500 characters
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t pt-5">
          <Button type="submit">Save preview</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFullName(profile.fullName)
              setBio('')
              setNotice('')
              //   onError('')
            }}
          >
            Reset
          </Button>
        </div>
        {notice && (
          <p role="status" className="text-sm text-primary">
            {notice}
          </p>
        )}
      </form>
    </section>
  )
}

export default ProfileDetailsForm
