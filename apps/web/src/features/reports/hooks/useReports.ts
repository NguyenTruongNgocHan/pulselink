import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'

import {
  addReportClarification,
  createReport,
  getMyReports,
} from '../api/reportsApi'

export function useReports() {
  const queryClient = useQueryClient()
  const reportsQuery = useQuery({
    queryKey: queryKeys.reports,
    queryFn: getMyReports,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.reports })
  }

  const createMutation = useMutation({
    mutationFn: createReport,
    onSuccess: refresh,
  })

  const clarificationMutation = useMutation({
    mutationFn: ({ reportId, body }: { reportId: string; body: string }) =>
      addReportClarification(reportId, body),
    onSuccess: refresh,
  })

  return { reportsQuery, createMutation, clarificationMutation }
}
