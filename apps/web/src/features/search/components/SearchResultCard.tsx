import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import type { MessageSearchResult } from '@/features/search/types/search.types'
import { getInitials } from '@/shared/utils/avatar'
import { formatDateTime } from '@/shared/utils/date'

interface SearchResultCardProps {
  result: MessageSearchResult
  query: string
  onOpen: () => void
}

function highlight(content: string, query: string) {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return content

  const index = content.toLowerCase().indexOf(normalizedQuery.toLowerCase())
  if (index === -1) return content

  return (
    <>
      {content.slice(0, index)}
      <mark>{content.slice(index, index + normalizedQuery.length)}</mark>
      {content.slice(index + normalizedQuery.length)}
    </>
  )
}

export function SearchResultCard({ result, query, onOpen }: SearchResultCardProps) {
  return (
    <button type="button" className="search-result-card" onClick={onOpen}>
      <Avatar initials={getInitials(result.senderName)} tone="violet" />
      <div>
        <header>
          <b>{result.senderName}</b>
          <span>in {result.conversationName}</span>
          <time>{formatDateTime(result.createdAt)}</time>
        </header>
        <p>{highlight(result.content, query)}</p>
        <small>
          {result.conversationType === 'GROUP' ? 'Group conversation' : 'Direct conversation'}
          {result.editedAt ? ' · edited' : ''}
        </small>
      </div>
      <Icon name="chevron" size={17} />
    </button>
  )
}
