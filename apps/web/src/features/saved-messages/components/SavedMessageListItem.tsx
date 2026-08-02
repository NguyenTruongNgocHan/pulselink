import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import type { SavedMessage } from '@/features/saved-messages/types/savedMessage.types'
import { getInitials } from '@/shared/utils/avatar'
import { formatRelativeTime } from '@/shared/utils/date'

interface SavedMessageListItemProps {
  message: SavedMessage
  selected: boolean
  onSelect: () => void
}

export function SavedMessageListItem({
  message,
  selected,
  onSelect,
}: SavedMessageListItemProps) {
  return (
    <button
      type="button"
      className={[
        'saved-v2-item',
        selected ? 'selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <Avatar
        initials={getInitials(message.senderName)}
        tone="violet"
      />

      <span className="saved-v2-item__body">
        <span className="saved-v2-item__top">
          <strong>{message.conversationName}</strong>

          <time dateTime={message.createdAt}>
            {formatRelativeTime(message.createdAt)}
          </time>
        </span>

        <small>{message.senderName}</small>

        <span className="saved-v2-item__message">
          {message.content || 'Deleted message'}
        </span>
      </span>

      <span className="saved-v2-item__arrow" aria-hidden="true">
        <Icon name="chevron" size={15} />
      </span>
    </button>
  )
}
