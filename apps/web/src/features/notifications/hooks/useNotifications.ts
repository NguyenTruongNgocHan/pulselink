import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationsApi'

export function useNotifications(unreadOnly: boolean) {
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(unreadOnly),
    queryFn: () => getNotifications(unreadOnly),
    refetchInterval: 60_000,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: refresh,
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: refresh,
  })

  return { notificationsQuery, markReadMutation, markAllReadMutation }
}
