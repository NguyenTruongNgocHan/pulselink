import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'
import { useAuthStore } from '@/stores/authStore'

import {
  changePassword,
  deactivateAccount,
  getSecuritySessions,
  revokeOtherSessions,
  revokeSecuritySession,
} from '../api/profileApi'

export function useSecuritySessions() {
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((state) => state.clearSession)

  const sessionsQuery = useQuery({
    queryKey: queryKeys.securitySessions,
    queryFn: getSecuritySessions,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.securitySessions })
  }

  const revokeMutation = useMutation({
    mutationFn: revokeSecuritySession,
    onSuccess: refresh,
  })

  const revokeOthersMutation = useMutation({
    mutationFn: revokeOtherSessions,
    onSuccess: refresh,
  })

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: refresh,
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateAccount,
    onSuccess: clearSession,
  })

  return {
    sessionsQuery,
    revokeMutation,
    revokeOthersMutation,
    passwordMutation,
    deactivateMutation,
  }
}
