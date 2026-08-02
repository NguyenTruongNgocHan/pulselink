import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'

import { getAdminGroups, moderateGroup } from '../api/adminApi'
import type { AdminListFilters } from '../types/admin.types'

export function useAdminGroups(filters: AdminListFilters) {
  const queryClient = useQueryClient()
  const groupsQuery = useQuery({
    queryKey: queryKeys.adminGroups(filters),
    queryFn: () => getAdminGroups(filters),
  })

  const moderationMutation = useMutation({
    mutationFn: ({
      groupId,
      action,
      reason,
    }: {
      groupId: string
      action: 'close' | 'reopen'
      reason: string
    }) => moderateGroup(groupId, action, reason),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-groups'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit'] }),
      ])
    },
  })

  return { groupsQuery, moderationMutation }
}
