import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { NotificationListItem } from '@/features/notifications/components/NotificationListItem'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatDateTime } from '@/shared/utils/date'

import './notifications.css'

export function NotificationsPage() {
  const navigate = useNavigate()

  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {
    notificationsQuery,
    markReadMutation,
    markAllReadMutation,
  } = useNotifications(unreadOnly)

  const items = notificationsQuery.data?.items ?? []
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0

  const selectedNotification = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  )

  useEffect(() => {
    if (!selectedId && items[0]) {
      setSelectedId(items[0].id)
    }

    if (selectedId && !items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0]?.id ?? null)
    }
  }, [items, selectedId])

  const selectNotification = async (notificationId: string) => {
    setSelectedId(notificationId)

    const notification = items.find((item) => item.id === notificationId)

    if (notification && !notification.readAt) {
      await markReadMutation.mutateAsync(notificationId)
    }
  }

  const openRelatedContent = () => {
    if (!selectedNotification) {
      return
    }

    const { conversationId, reportId } = selectedNotification.payload

    if (typeof conversationId === 'string') {
      navigate(routes.conversation(conversationId))
      return
    }

    if (typeof reportId === 'string') {
      navigate(routes.reports)
    }
  }

  const switchFilter = (nextUnreadOnly: boolean) => {
    setSelectedId(null)
    setUnreadOnly(nextUnreadOnly)
  }

  const error =
    notificationsQuery.error ??
    markReadMutation.error ??
    markAllReadMutation.error

  return (
    <main className="workspace notifications-sync">
      <aside className="notifications-sync__panel">
        <header className="notifications-sync__header">
          <div className="notifications-sync__heading">
            <span className="eyebrow">Stay informed</span>
            <h1>Notifications</h1>
            <small>
              {unreadCount} {unreadCount === 1 ? 'unread update' : 'unread updates'}
            </small>
          </div>

          <button
            type="button"
            className="notifications-sync__mark-all"
            disabled={markAllReadMutation.isPending || unreadCount === 0}
            onClick={() => void markAllReadMutation.mutateAsync()}
          >
            {markAllReadMutation.isPending ? 'Marking…' : 'Mark all read'}
          </button>
        </header>

        <div
          className="notifications-sync__tabs"
          role="tablist"
          aria-label="Notification filter"
        >
          <button
            type="button"
            className={!unreadOnly ? 'active' : undefined}
            onClick={() => switchFilter(false)}
            role="tab"
            aria-selected={!unreadOnly}
          >
            All
          </button>

          <button
            type="button"
            className={unreadOnly ? 'active' : undefined}
            onClick={() => switchFilter(true)}
            role="tab"
            aria-selected={unreadOnly}
          >
            Unread
          </button>
        </div>

        {error ? (
          <div className="notifications-sync__alert">
            <InlineAlert
              tone="danger"
              onDismiss={() => {
                markReadMutation.reset()
                markAllReadMutation.reset()
              }}
            >
              {getApiErrorMessage(error)}
            </InlineAlert>
          </div>
        ) : null}

        <div className="notifications-sync__content" aria-live="polite">
          {notificationsQuery.isLoading ? (
            <LoadingState rows={7} label="Loading notifications" />
          ) : null}

          {!notificationsQuery.isLoading && items.length === 0 ? (
            <div className="notifications-sync__empty">
              <span className="notifications-sync__empty-icon">
                <Icon name="bell" size={23} />
              </span>

              <strong>
                {unreadOnly ? 'You are all caught up' : 'No notifications yet'}
              </strong>

              <p>
                {unreadOnly
                  ? 'There are no unread updates waiting for you.'
                  : 'Security, group, moderation and account updates will appear here.'}
              </p>
            </div>
          ) : null}

          {!notificationsQuery.isLoading && items.length > 0 ? (
            <div className="notifications-sync__list">
              {items.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  selected={notification.id === selectedNotification?.id}
                  onSelect={() => void selectNotification(notification.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </aside>

      <section className="notifications-sync__preview">
        <div className="notifications-sync__preview-glow" />

        {selectedNotification ? (
          <article className="notifications-sync__preview-content">
            <span className="notifications-sync__preview-icon">
              <Icon name="bell" size={28} />
            </span>

            <span className="eyebrow">
              {selectedNotification.type.replaceAll('_', ' ')}
            </span>

            <h2>{selectedNotification.title}</h2>

            <time dateTime={selectedNotification.createdAt}>
              {formatDateTime(selectedNotification.createdAt)}
            </time>

            <p>{selectedNotification.body}</p>

            {Object.keys(selectedNotification.payload).length > 0 ? (
              <Button onClick={openRelatedContent}>
                View details
                <Icon name="chevron" size={16} />
              </Button>
            ) : null}
          </article>
        ) : (
          <article className="notifications-sync__preview-content">
            <span className="notifications-sync__preview-icon">
              <Icon name="bell" size={28} />
            </span>

            <span className="eyebrow">Your updates</span>

            <h2>Everything important, in one place.</h2>

            <p>Select a notification to read the complete update.</p>
          </article>
        )}
      </section>
    </main>
  )
}