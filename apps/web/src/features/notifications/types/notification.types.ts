export type NotificationType =
  | 'SECURITY'
  | 'REPORT_RESOLVED'
  | 'ACCOUNT_WARNING'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_BANNED'
  | 'PROFILE_RESET'
  | 'GROUP_CLOSED'
  | 'FRIEND_REQUEST'
  | 'FRIEND_REQUEST_ACCEPTED'
  | 'MESSAGE'
  | string

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  body: string
  payload: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

export interface NotificationsResponse {
  items: NotificationItem[]
  unreadCount: number
  nextCursor: string | null
}
