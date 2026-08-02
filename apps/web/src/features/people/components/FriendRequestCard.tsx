import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/shared/utils/date'
import { getInitials } from '@/shared/utils/avatar'

import type { FriendRequest } from '../types/people.types'

interface FriendRequestCardProps {
  request: FriendRequest
  isWorking: boolean
  onAccept?: () => void
  onDecline?: () => void
  onCancel?: () => void
}

export function FriendRequestCard({
  request,
  isWorking,
  onAccept,
  onDecline,
  onCancel,
}: FriendRequestCardProps) {
  return (
    <article className="friend-request-item" aria-busy={isWorking}>
      <Avatar
        initials={getInitials(request.displayName)}
        src={request.avatarUrl}
        alt=""
        tone="violet"
      />

      <div className="friend-request-item__copy">
        <b>{request.displayName}</b>
        <small>@{request.username}</small>
        <time>{formatRelativeTime(request.requestedAt)}</time>
      </div>

      <div className="friend-request-item__actions">
        {request.direction === 'RECEIVED' ? (
          <>
            <Button onClick={onAccept} disabled={isWorking}>
              {isWorking ? 'Working…' : 'Accept'}
            </Button>
            <Button variant="ghost" onClick={onDecline} disabled={isWorking}>
              Decline
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onCancel} disabled={isWorking}>
            {isWorking ? 'Cancelling…' : 'Cancel'}
          </Button>
        )}
      </div>
    </article>
  )
}
