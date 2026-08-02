import { useNavigate } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import type { ConversationSummary } from '@/features/conversations/types/conversation.types'
import { routes } from '@/shared/constants/routes'
import { getInitials } from '@/shared/utils/avatar'

interface ConversationHeaderProps {
  conversation: ConversationSummary
  isRealtimeConnected: boolean
  typingNames: string[]
}

export function ConversationHeader({
  conversation,
  isRealtimeConnected,
  typingNames,
}: ConversationHeaderProps) {
  const navigate = useNavigate()

  const statusLabel =
    typingNames.length > 0
      ? `${typingNames.slice(0, 2).join(', ')} ${
          typingNames.length === 1 ? 'is' : 'are'
        } typing…`
      : conversation.type === 'GROUP'
        ? `${conversation.memberCount} members`
        : isRealtimeConnected
          ? 'Active now'
          : 'Connecting…'

  return (
    <header className="pane-header conversation-header">
      <div className="conversation-header__profile">
        <Avatar
          initials={getInitials(conversation.name)}
          src={conversation.avatarUrl}
          alt=""
          tone="violet"
          online={conversation.type === 'DIRECT' && isRealtimeConnected}
        />

        <div className="conversation-header__identity">
          <b>{conversation.name}</b>
          <small className={typingNames.length > 0 ? 'typing-label' : undefined}>
            {statusLabel}
          </small>
        </div>
      </div>

      <div className="conversation-header__actions">
        {conversation.type === 'GROUP' ? (
          <button
            type="button"
            className="icon-button"
            aria-label="View group details"
            title="Group details"
            onClick={() => navigate(routes.groupDetails(conversation.id))}
          >
            <Icon name="info" />
          </button>
        ) : null}

        <button
          type="button"
          className="icon-button"
          aria-label="Search this conversation"
          title="Search this conversation"
          onClick={() =>
            navigate(`${routes.search}?conversationId=${conversation.id}`)
          }
        >
          <Icon name="search" />
        </button>
      </div>
    </header>
  )
}