import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SavedMessageListItem } from '@/features/saved-messages/components/SavedMessageListItem'
import { useSavedMessages } from '@/features/saved-messages/hooks/useSavedMessages'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { SearchInput } from '@/shared/components/form/SearchInput'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatDateTime } from '@/shared/utils/date'

import './saved-messages.css'

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
    if (!selectedId && filteredMessages[0]) {
      setSelectedId(filteredMessages[0].id)
    }

    if (
      selectedId &&
      !filteredMessages.some((message) => message.id === selectedId)
    ) {
      setSelectedId(filteredMessages[0]?.id ?? null)
    }
  }, [filteredMessages, selectedId])

  const selectedMessage =
    filteredMessages.find((message) => message.id === selectedId) ??
    filteredMessages[0] ??
    null

  const error = savedMessagesQuery.error ?? removeMutation.error

  const dismissError = () => {
    removeMutation.reset()
  }

  const clearSearch = () => {
    setQuery('')
  }

  return (
    <main className="workspace saved-v2">
      <aside className="saved-v2__panel">
        <header className="saved-v2__header">
          <div>
            <span className="eyebrow">Keep what matters</span>
            <h1>Saved messages</h1>
            <small>
              {savedMessagesQuery.data?.length ?? 0}{' '}
              {(savedMessagesQuery.data?.length ?? 0) === 1
                ? 'saved message'
                : 'saved messages'}
            </small>
          </div>

          <span className="saved-v2__header-icon" aria-hidden="true">
            <Icon name="bookmark" size={20} />
          </span>
        </header>

        <div className="saved-v2__controls">
          <div className="saved-v2__search">
            <SearchInput
              label="Search saved messages"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={clearSearch}
              placeholder="Search saved messages"
            />
          </div>
        </div>

        {error ? (
          <div className="saved-v2__alert">
            <InlineAlert tone="danger" onDismiss={dismissError}>
              {getApiErrorMessage(error)}
            </InlineAlert>
          </div>
        ) : null}

        <div className="saved-v2__summary">
          <span>
            {savedMessagesQuery.isLoading
              ? 'Loading saved messages'
              : `${filteredMessages.length} ${
                  filteredMessages.length === 1 ? 'result' : 'results'
                }`}
          </span>

          {query ? (
            <button type="button" onClick={clearSearch}>
              Clear
            </button>
          ) : null}
        </div>

        <div className="saved-v2__content" aria-live="polite">
          {savedMessagesQuery.isLoading ? (
            <LoadingState label="Loading saved messages" rows={6} />
          ) : null}

          {!savedMessagesQuery.isLoading &&
          filteredMessages.length === 0 ? (
            <div className="saved-v2__empty">
              <span className="saved-v2__empty-icon">
                <Icon name="bookmark" size={23} />
              </span>

              <strong>
                {query ? 'No saved messages match' : 'Nothing saved yet'}
              </strong>

              <p>
                {query
                  ? 'Try another word, sender or conversation name.'
                  : 'Use the bookmark action on a message to keep it here.'}
              </p>
            </div>
          ) : null}

          {!savedMessagesQuery.isLoading &&
          filteredMessages.length > 0 ? (
            <div className="saved-v2__list">
              {filteredMessages.map((message) => (
                <SavedMessageListItem
                  key={message.id}
                  message={message}
                  selected={message.id === selectedMessage?.id}
                  onSelect={() => setSelectedId(message.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </aside>

      <section className="saved-v2-detail">
        <div className="saved-v2-detail__glow" />

        {selectedMessage ? (
          <article className="saved-v2-detail__content">
            <span className="saved-v2-detail__icon">
              <Icon name="bookmark" size={27} />
            </span>

            <span className="eyebrow">
              {selectedMessage.conversationType}
            </span>

            <h2>{selectedMessage.conversationName}</h2>

            <p className="saved-v2-detail__date">
              Saved {formatDateTime(selectedMessage.createdAt)}
            </p>

            <blockquote className="saved-v2-detail__quote">
              <p>
                {selectedMessage.content ||
                  'This message is no longer available.'}
              </p>

              <footer>
                <span>{selectedMessage.senderName}</span>
                <small>@{selectedMessage.senderUsername}</small>
              </footer>
            </blockquote>

            <div className="saved-v2-detail__actions">
              <Button
                variant="danger"
                disabled={removeMutation.isPending}
                onClick={() =>
                  void removeMutation.mutateAsync(selectedMessage.id)
                }
              >
                <Icon name="trash" size={17} />
                {removeMutation.isPending ? 'Removing…' : 'Remove'}
              </Button>

              <Button
                onClick={() =>
                  navigate(
                    routes.conversation(
                      selectedMessage.conversationId,
                    ),
                  )
                }
              >
                Open conversation
                <Icon name="chevron" size={17} />
              </Button>
            </div>
          </article>
        ) : (
          <article className="saved-v2-detail__content">
            <span className="saved-v2-detail__icon">
              <Icon name="bookmark" size={27} />
            </span>

            <span className="eyebrow">Saved messages</span>

            <h2>Choose a saved message</h2>

            <p>
              Select a message to see its context and reopen the
              conversation.
            </p>
          </article>
        )}
      </section>
    </main>
  )
}
