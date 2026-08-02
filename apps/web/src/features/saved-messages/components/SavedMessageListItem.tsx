import { Avatar } from '@/components/ui/Avatar'
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
      className={selected ? 'saved-row selected' : 'saved-row'}
      onClick={onSelect}
    >
      <Avatar initials={getInitials(message.senderName)} tone="violet" />
      <span>
        <b>{message.conversationName}</b>
        <small>{message.content || 'Deleted message'}</small>
      </span>
      <time>{formatRelativeTime(message.createdAt)}</time>
    </button>
  )
}
