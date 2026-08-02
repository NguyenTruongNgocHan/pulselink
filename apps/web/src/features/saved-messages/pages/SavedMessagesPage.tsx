import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SavedMessageListItem } from '@/features/saved-messages/components/SavedMessageListItem'
import { useSavedMessages } from '@/features/saved-messages/hooks/useSavedMessages'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { SearchInput } from '@/shared/components/form/SearchInput'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatDateTime } from '@/shared/utils/date'

export function SavedMessagesPage() {
  const navigate = useNavigate()
  const { savedMessagesQuery, removeMutation } = useSavedMessages()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return (savedMessagesQuery.data ?? []).filter(
      (message) =>
        !normalizedQuery ||
        message.content?.toLowerCase().includes(normalizedQuery) ||
        message.senderName.toLowerCase().includes(normalizedQuery) ||
        message.conversationName.toLowerCase().includes(normalizedQuery),
    )
  }, [query, savedMessagesQuery.data])

  useEffect(() => {
    if (!selectedId && filteredMessages[0]) setSelectedId(filteredMessages[0].id)
  }, [filteredMessages, selectedId])

  const selectedMessage =
    filteredMessages.find((message) => message.id === selectedId) ??
    filteredMessages[0] ??
    null

  const error = savedMessagesQuery.error ?? removeMutation.error
  const dismissError = () => removeMutation.reset()

  return (
    <main className="workspace two saved-workspace">
      <aside className="list-panel saved-list-panel">
        <header className="panel-heading">
          <div>
            <span className="eyebrow">Keep what matters</span>
            <h1>Saved messages</h1>
            <small>{savedMessagesQuery.data?.length ?? 0} saved</small>
          </div>
          <Icon name="bookmark" />
        </header>

        <SearchInput
          label="Search saved messages"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery('')}
          placeholder="Search saved messages"
        />

        {error ? (
          <InlineAlert tone="danger" onDismiss={dismissError}>
            {getApiErrorMessage(error)}
          </InlineAlert>
        ) : null}
        {savedMessagesQuery.isLoading ? (
          <LoadingState label="Loading saved messages" rows={6} />
        ) : null}

        {!savedMessagesQuery.isLoading && filteredMessages.length === 0 ? (
          <EmptyState
            compact
            icon="bookmark"
            title={query ? 'No saved messages match' : 'Nothing saved yet'}
            description="Use the bookmark action on a message to keep it here."
          />
        ) : null}

        <div className="saved-message-list">
          {filteredMessages.map((message) => (
            <SavedMessageListItem
              key={message.id}
              message={message}
              selected={message.id === selectedMessage?.id}
              onSelect={() => setSelectedId(message.id)}
            />
          ))}
        </div>
      </aside>

      <section className="saved-detail">
        {selectedMessage ? (
          <article className="saved-detail__card">
            <header>
              <div>
                <span className="eyebrow">{selectedMessage.conversationType}</span>
                <h2>{selectedMessage.conversationName}</h2>
                <p>Saved {formatDateTime(selectedMessage.createdAt)}</p>
              </div>
              <Button
                variant="danger"
                disabled={removeMutation.isPending}
                onClick={() => void removeMutation.mutateAsync(selectedMessage.id)}
              >
                <Icon name="trash" size={17} />
                Remove
              </Button>
            </header>

            <blockquote>
              <p>{selectedMessage.content || 'This message is no longer available.'}</p>
              <footer>
                {selectedMessage.senderName} · @{selectedMessage.senderUsername}
              </footer>
            </blockquote>

            <Button
              onClick={() => navigate(routes.conversation(selectedMessage.conversationId))}
            >
              Open conversation
              <Icon name="chevron" size={17} />
            </Button>
          </article>
        ) : (
          <EmptyState
            icon="bookmark"
            title="Choose a saved message"
            description="Select a message to see its context and open the conversation."
          />
        )}
      </section>
    </main>
  )
}
