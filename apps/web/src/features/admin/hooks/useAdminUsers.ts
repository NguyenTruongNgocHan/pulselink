import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'

import {
  getAdminUser,
  getAdminUsers,
  performUserAction,
  updateUserRole,
} from '../api/adminApi'
import type { AdminUserFilters, SystemRole } from '../types/admin.types'

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery({
    queryKey: queryKeys.adminUsers(filters),
    queryFn: () => getAdminUsers(filters),
  })
}

export function useAdminUser(userId: string) {
  const queryClient = useQueryClient()
  const userQuery = useQuery({
    queryKey: queryKeys.adminUser(userId),
    queryFn: () => getAdminUser(userId),
    enabled: Boolean(userId),
  })

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUser(userId) }),
      queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard }),
    ])
  }

  const actionMutation = useMutation({
    mutationFn: ({
      action,
      reason,
      until,
    }: {
      action: 'suspend' | 'unsuspend' | 'ban' | 'unban' | 'force-logout'
      reason: string
      until?: string
    }) => performUserAction(userId, action, { reason, until }),
    onSuccess: refresh,
  })

  const roleMutation = useMutation({
    mutationFn: ({ role, reason }: { role: SystemRole; reason: string }) =>
      updateUserRole(userId, role, reason),
    onSuccess: refresh,
  })

  return { userQuery, actionMutation, roleMutation }
}
