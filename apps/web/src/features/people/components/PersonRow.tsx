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
  const action = (() => {
    switch (person.relationshipStatus) {
      case 'FRIEND':
        return (
          <Button onClick={onMessage} disabled={isWorking}>
            {isWorking ? 'Opening…' : 'Message'}
          </Button>
        )
      case 'PENDING_RECEIVED':
        return (
          <Button onClick={onAcceptRequest} disabled={isWorking}>
            {isWorking ? 'Accepting…' : 'Accept'}
          </Button>
        )
      case 'PENDING_SENT':
        return <span className="people-item__status">Sent</span>
      case 'BLOCKED':
        return <span className="people-item__status people-item__status--muted">Blocked</span>
      default:
        return (
          <Button variant="secondary" onClick={onSendRequest} disabled={isWorking}>
            {isWorking ? 'Sending…' : 'Add'}
          </Button>
        )
    }
  })()

  return (
    <article className="people-item" aria-busy={isWorking}>
      <Avatar
        initials={getInitials(person.displayName)}
        src={person.avatarUrl}
        alt=""
        tone="violet"
        online={person.isOnline}
      />

      <div className="people-item__copy">
        <div className="people-item__name-line">
          <b>{person.displayName}</b>
          {person.relationshipStatus === 'FRIEND' ? (
            <span className="people-item__relation">Friend</span>
          ) : null}
        </div>
        <small>@{person.username}</small>
        {person.bio ? <p>{person.bio}</p> : null}
      </div>

      <div className="people-item__action">
        {action}
        {person.relationshipStatus === 'FRIEND' ? (
          <button
            type="button"
            className="people-item__remove"
            onClick={onRemoveFriend}
            disabled={isWorking}
          >
            Remove
          </button>
        ) : null}
      </div>
    </article>
  )
}
