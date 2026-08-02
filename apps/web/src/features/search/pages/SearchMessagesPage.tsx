import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { SearchResultCard } from '@/features/search/components/SearchResultCard'
import { useMessageSearch } from '@/features/search/hooks/useMessageSearch'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { SearchInput } from '@/shared/components/form/SearchInput'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'

import './search.css'

export function SearchMessagesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const conversationId = searchParams.get('conversationId') ?? undefined
  const [query, setQuery] = useState('')

  const searchQuery = useMessageSearch(query, conversationId)

  const normalizedQuery = query.trim()
  const canSearch = normalizedQuery.length >= 2
  const resultCount = searchQuery.data?.length ?? 0

  const clearSearch = () => {
    setQuery('')
  }

  return (
    <main className="workspace search-sync">
      <aside className="search-sync__panel">
        <header className="search-sync__header">
          <div className="search-sync__heading">
            <span className="eyebrow">Message search</span>
            <h1>Search</h1>
            <small>Find messages across your conversations.</small>
          </div>

          <span className="search-sync__header-icon" aria-hidden="true">
            <Icon name="search" size={20} />
          </span>
        </header>

        <div className="search-sync__controls">
          <div className="search-sync__input">
            <SearchInput
              label="Search message history"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={clearSearch}
              placeholder="Search messages"
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="search-sync__scope">
            <Icon name={conversationId ? 'chat' : 'search'} size={16} />

            <span>
              {conversationId ? 'Current conversation' : 'All conversations'}
            </span>
          </div>
        </div>

        <div className="search-sync__summary" aria-live="polite">
          <span>
            {canSearch
              ? `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`
              : 'Type at least 2 characters'}
          </span>

          {canSearch ? (
            <button type="button" onClick={clearSearch}>
              Clear
            </button>
          ) : null}
        </div>

        {searchQuery.error ? (
          <div className="search-sync__alert">
            <InlineAlert tone="danger">
              {getApiErrorMessage(searchQuery.error)}
            </InlineAlert>
          </div>
        ) : null}

        <div className="search-sync__content" aria-live="polite">
          {searchQuery.isFetching ? (
            <LoadingState rows={6} label="Searching messages" />
          ) : null}

          {!searchQuery.isFetching && !canSearch ? (
            <div className="search-sync__empty">
              <span className="search-sync__empty-icon">
                <Icon name="search" size={23} />
              </span>

              <strong>Search your messages</strong>
              <p>Enter a word or phrase to find it in your conversations.</p>
            </div>
          ) : null}

          {!searchQuery.isFetching &&
          canSearch &&
          !searchQuery.error &&
          resultCount === 0 ? (
            <div className="search-sync__empty">
              <span className="search-sync__empty-icon">
                <Icon name="search" size={23} />
              </span>

              <strong>No matches found</strong>
              <p>Try another word or a shorter phrase.</p>
            </div>
          ) : null}

          {!searchQuery.isFetching && resultCount > 0 ? (
            <div className="search-sync__results">
              {searchQuery.data?.map((result) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  query={query}
                  onOpen={() =>
                    navigate(routes.conversation(result.conversationId))
                  }
                />
              ))}
            </div>
          ) : null}
        </div>
      </aside>

      <section className="search-sync__preview">
        <div className="search-sync__preview-glow" />

        <div className="search-sync__preview-content">
          <span className="search-sync__preview-icon">
            <Icon name="search" size={28} />
          </span>

          <span className="eyebrow">Message search</span>

          <h2>Find any message again.</h2>

          <p>
            Search your conversations, open the matching result and continue
            exactly where you left off.
          </p>
        </div>
      </section>
    </main>
  )
}