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
  const typingLabel =
    typingNames.length > 0
      ? `${typingNames.slice(0, 2).join(', ')} ${typingNames.length === 1 ? 'is' : 'are'} typing…`
      : isRealtimeConnected
        ? 'Realtime connected'
        : 'Reconnecting…'

  return (
    <header className="pane-header conversation-header">
      <Avatar
        initials={getInitials(conversation.name)}
        tone="violet"
        online={isRealtimeConnected}
      />
      <div className="conversation-header__identity">
        <b>{conversation.name}</b>
        <small className={typingNames.length > 0 ? 'typing-label' : undefined}>
          {typingLabel}
        </small>
      </div>
      <span className="spacer" />
      <button
        type="button"
        className="icon-button"
        aria-label="Search this conversation"
        onClick={() => navigate(`${routes.search}?conversationId=${conversation.id}`)}
      >
        <Icon name="search" />
      </button>
      {conversation.type === 'GROUP' ? (
        <button
          type="button"
          className="icon-button"
          aria-label="View group details"
          onClick={() => navigate(routes.groupDetails(conversation.id))}
        >
          <Icon name="info" />
        </button>
      ) : null}
    </header>
  )
}
