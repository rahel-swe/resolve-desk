import { useUpdateMyProfile } from '#/queries/profile-queries'
import { updateUserProfileSchema } from '#/schemas/user-schemas'
import type { UpdateUserProfileInput, UserProfile } from '#/types/user-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { toast } from '../ui/toast'
import { Field, FieldGroup, FieldLabel, FieldError } from '../ui/field'

function ProfileDetailsForm({ profile }: { profile: UserProfile }) {
  const { mutate, isPending: isUpdatingProfile } = useUpdateMyProfile(
    profile.id,
  )

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isDirty },
    reset,
    watch,
  } = useForm<UpdateUserProfileInput>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      bio: profile.bio,
    },
  })

  const onSubmit = (data: UpdateUserProfileInput) => {
    mutate(data, {
      onSuccess(saved) {
        reset({ fullName: saved.fullName, bio: saved.bio ?? '' })
        toast.add({ description: 'Profile saved.', type: 'success' })
      },
      onError(error) {
        toast.add({
          description: error.message || 'Could not save profile.',
          type: 'error',
        })
      },
    })
  }

  return (
    <section className="max-w-2xl">
      <h2 className="mb-4 font-heading text-3xl">Personal details</h2>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
            <Input
              id="profile-name"
              {...register('fullName')}
              aria-invalid={Boolean(errors.fullName?.message)}
              maxLength={80}
              required
            />
            {errors.fullName?.message && (
              <FieldError errors={[{ message: errors.fullName.message }]} />
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-bio">About you</FieldLabel>
            <Textarea
              id="profile-bio"
              maxLength={500}
              {...register('bio')}
              placeholder="A few words about your work…"
              rows={4}
            />
            {errors.bio?.message && (
              <FieldError errors={[{ message: errors.bio.message }]} />
            )}
            <p className="text-xs text-muted-foreground">
              {watch('bio')?.length}/500 characters
            </p>
          </Field>
          <div className="flex flex-wrap items-center gap-3 border-t pt-5">
            <Button
              type="submit"
              disabled={isSubmitting || isUpdatingProfile || !isDirty}
            >
              Save preview
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={isUpdatingProfile || isSubmitting || !isDirty}
              onClick={() => reset()}
            >
              Reset
            </Button>
          </div>
        </FieldGroup>
      </form>
    </section>
  )
}

export default ProfileDetailsForm
