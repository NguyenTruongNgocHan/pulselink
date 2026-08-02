import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { getInitials } from '@/shared/utils/avatar'

import type { Person } from '../types/people.types'

interface PersonRowProps {
  person: Person
  isWorking: boolean
  onMessage: () => void
  onSendRequest: () => void
  onAcceptRequest: () => void
  onRemoveFriend: () => void
}

export function PersonRow({
  person,
  isWorking,
  onMessage,
  onSendRequest,
  onAcceptRequest,
  onRemoveFriend,
}: PersonRowProps) {
  const relationshipAction = (() => {
    switch (person.relationshipStatus) {
      case 'FRIEND':
        return (
          <>
            <Button variant="primary" onClick={onMessage} disabled={isWorking}>
              Message
            </Button>
            <Button variant="ghost" onClick={onRemoveFriend} disabled={isWorking}>
              Remove
            </Button>
          </>
        )
      case 'PENDING_RECEIVED':
        return (
          <Button variant="primary" onClick={onAcceptRequest} disabled={isWorking}>
            Accept
          </Button>
        )
      case 'PENDING_SENT':
        return <span className="status-pill">Request sent</span>
      case 'BLOCKED':
        return <span className="status-pill status-pill--muted">Blocked</span>
      default:
        return (
          <Button variant="secondary" onClick={onSendRequest} disabled={isWorking}>
            Add friend
          </Button>
        )
    }
  })()

  return (
    <article className="person-card">
      <Avatar
        initials={getInitials(person.displayName)}
        tone="violet"
        online={person.isOnline}
        size="lg"
      />
      <div className="person-card__identity">
        <h3>{person.displayName}</h3>
        <p>@{person.username}</p>
        {person.bio ? <small>{person.bio}</small> : null}
      </div>
      <div className="person-card__actions">{relationshipAction}</div>
    </article>
  )
}
