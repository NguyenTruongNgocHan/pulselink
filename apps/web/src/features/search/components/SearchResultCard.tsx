import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import type { MessageSearchResult } from '@/features/search/types/search.types'
import { getInitials } from '@/shared/utils/avatar'
import { formatRelativeTime } from '@/shared/utils/date'

interface SearchResultCardProps {
  result: MessageSearchResult
  query: string
  onOpen: () => void
}

function highlight(content: string, query: string) {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return content
  }

  const normalizedContent = content.toLowerCase()
  const matchIndex = normalizedContent.indexOf(normalizedQuery.toLowerCase())

  if (matchIndex === -1) {
    return content
  }

  return (
    <>
      {content.slice(0, matchIndex)}
      <mark>
        {content.slice(matchIndex, matchIndex + normalizedQuery.length)}
      </mark>
      {content.slice(matchIndex + normalizedQuery.length)}
    </>
  )
}

export function SearchResultCard({
  result,
  query,
  onOpen,
}: SearchResultCardProps) {
  return (
    <button
      type="button"
      className="search-sync-result"
      onClick={onOpen}
      aria-label={`Open result from ${result.senderName} in ${result.conversationName}`}
    >
      <Avatar
        initials={getInitials(result.senderName)}
        tone="violet"
        size="md"
      />

      <span className="search-sync-result__body">
        <span className="search-sync-result__top">
          <strong>{result.senderName}</strong>

          <time dateTime={result.createdAt}>
            {formatRelativeTime(result.createdAt)}
          </time>
        </span>

        <small className="search-sync-result__conversation">
          {result.conversationName}
        </small>

        <span className="search-sync-result__message">
          {highlight(result.content, query)}
        </span>
      </span>

      <span className="search-sync-result__arrow" aria-hidden="true">
        <Icon name="chevron" size={16} />
      </span>
    </button>
  )
}