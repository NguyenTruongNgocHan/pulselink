import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'
import { useAuthStore } from '@/stores/authStore'

import { getProfile, updateProfile, uploadAvatar } from '../api/profileApi'

export function useProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.updateUser)

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  })

  const synchronizeAuthUser = (profile: Awaited<ReturnType<typeof getProfile>>) => {
    setUser({
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    })
  }

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile, profile)
      synchronizeAuthUser(profile)
    },
  })

  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: async () => {
      const profile = await queryClient.fetchQuery({
        queryKey: queryKeys.profile,
        queryFn: getProfile,
      })
      synchronizeAuthUser(profile)
    },
  })

  return { profileQuery, updateMutation, avatarMutation }
}
