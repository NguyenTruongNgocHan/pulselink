import { NavLink } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import type { ConversationSummary } from '@/features/conversations/types/conversation.types'
import { routes } from '@/shared/constants/routes'
import { getInitials } from '@/shared/utils/avatar'
import { formatRelativeTime } from '@/shared/utils/date'

interface ConversationListItemProps {
  conversation: ConversationSummary
}

export function ConversationListItem({ conversation }: ConversationListItemProps) {
  const isOnline =
    conversation.type === 'DIRECT' &&
    conversation.participants.some((participant) => participant.isOnline)

  return (
    <NavLink
      to={routes.conversation(conversation.id)}
      className={({ isActive }) =>
        isActive ? 'conversation-item active' : 'conversation-item'
      }
    >
      <Avatar
        initials={getInitials(conversation.name)}
        src={conversation.avatarUrl}
        alt=""
        tone={conversation.type === 'GROUP' ? 'purple' : 'violet'}
        online={isOnline}
      />

      <span className="conversation-item__copy">
        <span className="conversation-item__name">
          <b>{conversation.name}</b>
          {conversation.type === 'GROUP' ? (
            <small className="conversation-item__type">{conversation.memberCount}</small>
          ) : null}
        </span>
        <small>{conversation.preview || 'No messages yet'}</small>
      </span>

      <span className="conversation-item__meta">
        <time>
          {conversation.latestMessageAt
            ? formatRelativeTime(conversation.latestMessageAt)
            : ''}
        </time>
        {conversation.unreadCount > 0 ? <em>{conversation.unreadCount}</em> : null}
      </span>
    </NavLink>
  )
}