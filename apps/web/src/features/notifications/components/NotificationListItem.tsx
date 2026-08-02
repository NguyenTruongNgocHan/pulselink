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
  const isUnread = !notification.readAt

  return (
    <button
      type="button"
      className={[
        'notifications-sync-item',
        selected ? 'selected' : '',
        isUnread ? 'unread' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="notifications-sync-item__icon" aria-hidden="true">
        <Icon name={notificationIcon(notification.type)} size={18} />
      </span>

      <span className="notifications-sync-item__body">
        <span className="notifications-sync-item__top">
          <strong>{notification.title}</strong>

          <time dateTime={notification.createdAt}>
            {formatRelativeTime(notification.createdAt)}
          </time>
        </span>

        <span className="notifications-sync-item__message">
          {notification.body}
        </span>
      </span>

      {isUnread ? (
        <span
          className="notifications-sync-item__unread"
          aria-label="Unread notification"
        />
      ) : null}
    </button>
  )
}