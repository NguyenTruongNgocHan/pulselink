import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'

import { getAuditLog } from '../api/adminApi'
import type { AdminListFilters } from '../types/admin.types'

export function useAuditLog(filters: AdminListFilters) {
  return useQuery({
    queryKey: queryKeys.adminAudit(filters),
    queryFn: () => getAuditLog(filters),
  })
}
