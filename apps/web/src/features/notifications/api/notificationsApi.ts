import { apiClient } from '@/shared/api/client'

import type {
  NotificationItem,
  NotificationsResponse,
} from '../types/notification.types'

type UnknownRecord = Record<string, unknown>

export function mapNotification(dto: UnknownRecord): NotificationItem {
  const payload = dto.payload ?? dto.payloadJson ?? dto.payload_jsonb
  return {
    id: String(dto.id ?? ''),
    type: String(dto.type ?? 'SYSTEM'),
    title: String(dto.title ?? 'PulseLink notification'),
    body: String(dto.body ?? ''),
    payload:
      typeof payload === 'object' && payload !== null
        ? (payload as Record<string, unknown>)
        : {},
    readAt: (dto.readAt ?? dto.read_at ?? null) as string | null,
    createdAt: String(dto.createdAt ?? dto.created_at ?? ''),
  }
}

export async function getNotifications(unreadOnly: boolean): Promise<NotificationsResponse> {
  const { data } = await apiClient.get<UnknownRecord[] | UnknownRecord>(
    '/api/v1/notifications',
    { params: { unread: unreadOnly } },
  )

  if (Array.isArray(data)) {
    const items = data.map(mapNotification)
    return {
      items,
      unreadCount: items.filter((item) => !item.readAt).length,
      nextCursor: null,
    }
  }

  const rawItems = Array.isArray(data.items) ? data.items : []
  return {
    items: rawItems.map((item) => mapNotification(item as UnknownRecord)),
    unreadCount: Number(data.unreadCount ?? data.unread_count ?? 0),
    nextCursor: (data.nextCursor ?? data.next_cursor ?? null) as string | null,
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.post(`/api/v1/notifications/${notificationId}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/api/v1/notifications/read-all')
}
