import { Icon, type IconName } from '@/components/ui/Icon'
import type { NotificationItem } from '@/features/notifications/types/notification.types'
import { formatRelativeTime } from '@/shared/utils/date'

interface NotificationListItemProps {
  notification: NotificationItem
  selected: boolean
  onSelect: () => void
}

function notificationIcon(type: string): IconName {
  if (type.includes('SECURITY')) return 'shield'
  if (type.includes('REPORT') || type.includes('WARNING')) return 'flag'
  if (type.includes('GROUP')) return 'group'
  if (type.includes('FRIEND')) return 'users'
  if (type.includes('MESSAGE')) return 'chat'
  return 'bell'
}

export function NotificationListItem({
  notification,
  selected,
  onSelect,
}: NotificationListItemProps) {
  return (
    <button
      type="button"
      className={`notification-row ${selected ? 'selected' : ''} ${notification.readAt ? '' : 'unread'}`}
      onClick={onSelect}
    >
      <span className="notification-row__icon">
        <Icon name={notificationIcon(notification.type)} size={19} />
      </span>
      <span>
        <b>{notification.title}</b>
        <small>{notification.body}</small>
      </span>
      <time>{formatRelativeTime(notification.createdAt)}</time>
      {!notification.readAt ? <i aria-label="Unread" /> : null}
    </button>
  )
}
