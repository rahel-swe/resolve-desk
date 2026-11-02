import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileKeys } from './keys/profile-keys'
import { getMyProfile, updateMyProfile } from '#/services/profile-service'

export const useProfileQuery = (userId: number | null) =>
  useQuery({
    queryKey: profileKeys.me(userId),
    queryFn: ({ signal }) => getMyProfile(signal),
    enabled: userId !== null,
  })

export const useUpdateMyProfile = (userId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMyProfile,

    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(profileKeys.me(userId), updatedProfile)
    },
  })
}
