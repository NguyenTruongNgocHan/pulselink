import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ConversationListItem } from '@/features/conversations/components/ConversationListItem'
import { useConversations } from '@/features/conversations/hooks/useConversations'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { SearchInput } from '@/shared/components/form/SearchInput'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'

import { Icon } from '../ui/Icon'

type ConversationFilter = 'ALL' | 'UNREAD' | 'GROUPS'

export function ConversationList() {
  const navigate = useNavigate()
  const conversationsQuery = useConversations()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ConversationFilter>('ALL')

  const conversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return (conversationsQuery.data ?? []).filter((conversation) => {
      const matchesSearch =
        !normalizedQuery ||
        conversation.name.toLowerCase().includes(normalizedQuery) ||
        conversation.preview?.toLowerCase().includes(normalizedQuery)

      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'UNREAD' && conversation.unreadCount > 0) ||
        (filter === 'GROUPS' && conversation.type === 'GROUP')

      return matchesSearch && matchesFilter
    })
  }, [conversationsQuery.data, filter, query])

  return (
    <aside className="list-panel conversation-panel">
      <header className="panel-heading">
        <div>
          <span className="eyebrow">Realtime inbox</span>
          <h1>Messages</h1>
          <small>{conversationsQuery.data?.length ?? 0} conversations</small>
        </div>
        <button
          className="square primary"
          type="button"
          aria-label="Create a group"
          onClick={() => navigate(routes.createGroup)}
        >
          <Icon name="edit" />
        </button>
      </header>

      <SearchInput
        label="Search conversations"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery('')}
        placeholder="Search conversations"
      />

      <div className="tabs" role="tablist" aria-label="Conversation filters">
        {(['ALL', 'UNREAD', 'GROUPS'] as const).map((item) => (
          <button
            type="button"
            key={item}
            className={filter === item ? 'active' : undefined}
            onClick={() => setFilter(item)}
            role="tab"
            aria-selected={filter === item}
          >
            {item === 'ALL' ? 'All' : item === 'UNREAD' ? 'Unread' : 'Groups'}
          </button>
        ))}
      </div>

      {conversationsQuery.error ? (
        <InlineAlert tone="danger">{getApiErrorMessage(conversationsQuery.error)}</InlineAlert>
      ) : null}

      <div className="conversation-list">
        {conversationsQuery.isLoading ? (
          <LoadingState label="Loading conversations" rows={7} />
        ) : null}

        {!conversationsQuery.isLoading && conversations.length === 0 ? (
          <EmptyState
            compact
            icon="chat"
            title={query || filter !== 'ALL' ? 'No matching conversations' : 'No conversations yet'}
            description={
              query || filter !== 'ALL'
                ? 'Change your search or filter to see more conversations.'
                : 'Open People to start a private chat or create a group.'
            }
          />
        ) : null}

        {conversations.map((conversation) => (
          <ConversationListItem key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </aside>
  )
}
