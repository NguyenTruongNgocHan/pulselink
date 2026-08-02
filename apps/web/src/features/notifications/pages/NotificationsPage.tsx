import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { NotificationListItem } from '@/features/notifications/components/NotificationListItem'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatDateTime } from '@/shared/utils/date'

export function NotificationsPage() {
  const navigate = useNavigate()
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { notificationsQuery, markReadMutation, markAllReadMutation } =
    useNotifications(unreadOnly)

  const items = notificationsQuery.data?.items ?? []
  const selectedNotification = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  )

  useEffect(() => {
    if (!selectedId && items[0]) setSelectedId(items[0].id)
  }, [items, selectedId])

  const selectNotification = async (notificationId: string) => {
    setSelectedId(notificationId)
    const notification = items.find((item) => item.id === notificationId)
    if (notification && !notification.readAt) {
      await markReadMutation.mutateAsync(notificationId)
    }
  }

  const openRelatedContent = () => {
    if (!selectedNotification) return
    const payload = selectedNotification.payload
    const conversationId = payload.conversationId
    const reportId = payload.reportId

    if (typeof conversationId === 'string') {
      navigate(routes.conversation(conversationId))
      return
    }
    if (typeof reportId === 'string') {
      navigate(routes.reports)
    }
  }

  const error = notificationsQuery.error ?? markReadMutation.error ?? markAllReadMutation.error
  const dismissError = () => {
    markReadMutation.reset()
    markAllReadMutation.reset()
  }

  return (
    <main className="workspace two notification-workspace">
      <aside className="notification-list">
        <header className="panel-heading">
          <div>
            <span className="eyebrow">Stay informed</span>
            <h1>Notifications</h1>
            <small>{notificationsQuery.data?.unreadCount ?? 0} unread</small>
          </div>
          <Button
            variant="secondary"
            disabled={markAllReadMutation.isPending || (notificationsQuery.data?.unreadCount ?? 0) === 0}
            onClick={() => void markAllReadMutation.mutateAsync()}
          >
            Mark all read
          </Button>
        </header>

        <div className="tabs">
          <button
            type="button"
            className={!unreadOnly ? 'active' : undefined}
            onClick={() => setUnreadOnly(false)}
          >
            All
          </button>
          <button
            type="button"
            className={unreadOnly ? 'active' : undefined}
            onClick={() => setUnreadOnly(true)}
          >
            Unread
          </button>
        </div>

        {error ? (
          <InlineAlert tone="danger" onDismiss={dismissError}>
            {getApiErrorMessage(error)}
          </InlineAlert>
        ) : null}
        {notificationsQuery.isLoading ? <LoadingState rows={7} label="Loading notifications" /> : null}

        {!notificationsQuery.isLoading && items.length === 0 ? (
          <EmptyState
            compact
            icon="bell"
            title={unreadOnly ? 'You are all caught up' : 'No notifications yet'}
            description="Security, moderation, group, and account updates will appear here."
          />
        ) : null}

        <div className="notification-items">
          {items.map((notification) => (
            <NotificationListItem
              key={notification.id}
              notification={notification}
              selected={notification.id === selectedNotification?.id}
              onSelect={() => void selectNotification(notification.id)}
            />
          ))}
        </div>
      </aside>

      <section className="notification-detail">
        {selectedNotification ? (
          <article className="notification-detail__card">
            <span className="notification-detail__icon">
              <Icon name="bell" size={28} />
            </span>
            <span className="eyebrow">{selectedNotification.type.replaceAll('_', ' ')}</span>
            <h2>{selectedNotification.title}</h2>
            <time>{formatDateTime(selectedNotification.createdAt)}</time>
            <p>{selectedNotification.body}</p>
            {Object.keys(selectedNotification.payload).length > 0 ? (
              <Button onClick={openRelatedContent}>
                View details
                <Icon name="chevron" size={16} />
              </Button>
            ) : null}
          </article>
        ) : (
          <EmptyState
            icon="bell"
            title="Choose a notification"
            description="Select an item from the list to read its details."
          />
        )}
      </section>
    </main>
  )
}
