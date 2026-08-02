import { Client, type IMessage } from '@stomp/stompjs'
import { useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { mapNotification } from '@/features/notifications/api/notificationsApi'
import type { NotificationItem } from '@/features/notifications/types/notification.types'
import { queryKeys } from '@/shared/api/queryKeys'
import { getWebSocketUrl } from '@/shared/api/urls'
import { useAuthStore } from '@/stores/authStore'

function parseNotification(frame: IMessage) {
  try {
    return mapNotification(JSON.parse(frame.body) as Record<string, unknown>)
  } catch {
    return null
  }
}

export function useNotificationRealtime(): void {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)
  const brokerURL = useMemo(getWebSocketUrl, [])

  useEffect(() => {
    if (!accessToken) return undefined

    let heartbeatTimer: number | undefined
    let client: Client

    const publishHeartbeat = () => {
      if (!client.connected) return
      client.publish({ destination: '/app/presence/heartbeat', body: '{}' })
    }

    client = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 2_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      onConnect: () => {
        if (heartbeatTimer !== undefined) window.clearInterval(heartbeatTimer)
        publishHeartbeat()
        heartbeatTimer = window.setInterval(publishHeartbeat, 30_000)
        client.subscribe('/user/queue/notifications', (frame) => {
          const notification = parseNotification(frame)
          if (!notification) return

          queryClient.setQueryData(
            queryKeys.notifications(false),
            (current: unknown) => {
              if (!current || typeof current !== 'object') return current
              const response = current as {
                items: NotificationItem[]
                unreadCount: number
                nextCursor: string | null
              }
              if (response.items.some((item) => item.id === notification.id)) {
                return response
              }
              return {
                ...response,
                items: [notification, ...response.items],
                unreadCount: response.unreadCount + 1,
              }
            },
          )

          void queryClient.invalidateQueries({ queryKey: ['notifications'] })
          if (notification.type.startsWith('FRIEND_REQUEST')) {
            void queryClient.invalidateQueries({ queryKey: ['people'] })
            void queryClient.invalidateQueries({ queryKey: queryKeys.friendRequests })
          }
        })
      },
      onWebSocketClose: () => {
        if (heartbeatTimer !== undefined) {
          window.clearInterval(heartbeatTimer)
          heartbeatTimer = undefined
        }
      },
    })

    client.activate()
    return () => {
      if (heartbeatTimer !== undefined) window.clearInterval(heartbeatTimer)
      void client.deactivate()
    }
  }, [accessToken, brokerURL, queryClient])
}
