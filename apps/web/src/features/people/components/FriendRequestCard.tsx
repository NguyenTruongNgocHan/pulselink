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
    <article className="request-card">
      <Avatar
        initials={getInitials(request.displayName)}
        tone="violet"
        size="lg"
      />
      <div>
        <h3>{request.displayName}</h3>
        <p>@{request.username}</p>
        <small>{formatRelativeTime(request.requestedAt)}</small>
      </div>
      <div className="request-card__actions">
        {request.direction === 'RECEIVED' ? (
          <>
            <Button onClick={onAccept} disabled={isWorking}>
              Accept
            </Button>
            <Button variant="secondary" onClick={onDecline} disabled={isWorking}>
              Decline
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onCancel} disabled={isWorking}>
            Cancel request
          </Button>
        )}
      </div>
    </article>
  )
}
