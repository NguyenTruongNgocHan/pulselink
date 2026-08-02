import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'

import { getPrivacySettings, updatePrivacySettings } from '../api/privacyApi'

export function usePrivacySettings() {
  const queryClient = useQueryClient()
  const settingsQuery = useQuery({
    queryKey: queryKeys.privacy,
    queryFn: getPrivacySettings,
  })

  const updateMutation = useMutation({
    mutationFn: updatePrivacySettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.privacy, settings)
    },
  })

  return { settingsQuery, updateMutation }
}
