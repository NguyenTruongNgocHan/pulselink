import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'

import {
  claimAdminReport,
  getAdminReport,
  getAdminReports,
  getReportEvidence,
  rejectAdminReport,
  resolveAdminReport,
} from '../api/adminApi'
import type { AdminListFilters } from '../types/admin.types'

export function useAdminReports(filters: AdminListFilters) {
  return useQuery({
    queryKey: queryKeys.adminReports(filters),
    queryFn: () => getAdminReports(filters),
  })
}

export function useAdminReport(reportId: string) {
  const queryClient = useQueryClient()
  const reportQuery = useQuery({
    queryKey: queryKeys.adminReport(reportId),
    queryFn: () => getAdminReport(reportId),
    enabled: Boolean(reportId),
  })

  const evidenceQuery = useQuery({
    queryKey: ['admin-report-evidence', reportId],
    queryFn: () => getReportEvidence(reportId),
    enabled: false,
  })

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReport(reportId) }),
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard }),
      queryClient.invalidateQueries({ queryKey: ['admin-audit'] }),
    ])
  }

  const claimMutation = useMutation({
    mutationFn: () => claimAdminReport(reportId),
    onSuccess: refresh,
  })

  const resolveMutation = useMutation({
    mutationFn: ({ outcome, reason }: { outcome: string; reason: string }) =>
      resolveAdminReport(reportId, outcome, reason),
    onSuccess: refresh,
  })

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => rejectAdminReport(reportId, reason),
    onSuccess: refresh,
  })

  return {
    reportQuery,
    evidenceQuery,
    claimMutation,
    resolveMutation,
    rejectMutation,
  }
}
