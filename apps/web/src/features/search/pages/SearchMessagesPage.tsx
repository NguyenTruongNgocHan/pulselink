import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { SearchResultCard } from '@/features/search/components/SearchResultCard'
import { useMessageSearch } from '@/features/search/hooks/useMessageSearch'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { SearchInput } from '@/shared/components/form/SearchInput'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export function SearchMessagesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const conversationId = searchParams.get('conversationId') ?? undefined
  const [query, setQuery] = useState('')
  const searchQuery = useMessageSearch(query, conversationId)

  return (
    <main className="workspace search-workspace">
      <aside className="filter-panel search-filter-panel">
        <header>
          <span className="eyebrow">Across your conversations</span>
          <h1>Search messages</h1>
          <p>Find a phrase in conversations you are allowed to access.</p>
        </header>

        <SearchInput
          label="Search message history"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery('')}
          placeholder="Type at least 2 characters"
          autoFocus
        />

        <div className="search-scope-card">
          <Icon name={conversationId ? 'chat' : 'search'} />
          <span>
            <b>{conversationId ? 'Current conversation' : 'All conversations'}</b>
            <small>
              {conversationId
                ? 'Results are limited to the selected conversation.'
                : 'Only conversations you participate in are searched.'}
            </small>
          </span>
        </div>

        <div className="search-help">
          <h2>Search tips</h2>
          <ul>
            <li>Use specific words or short phrases.</li>
            <li>Results are ordered from newest to oldest.</li>
            <li>Deleted messages are never included.</li>
          </ul>
        </div>
      </aside>

      <section className="results-panel">
        <header>
          <div>
            <span className="eyebrow">Results</span>
            <h2>
              {query.trim().length >= 2
                ? `${searchQuery.data?.length ?? 0} matches`
                : 'Start searching'}
            </h2>
          </div>
        </header>

        {searchQuery.error ? (
          <InlineAlert tone="danger">{getApiErrorMessage(searchQuery.error)}</InlineAlert>
        ) : null}
        {searchQuery.isFetching ? <LoadingState rows={7} label="Searching messages" /> : null}

        {!searchQuery.isFetching && query.trim().length < 2 ? (
          <EmptyState
            icon="search"
            title="Find a message"
            description="Enter at least two characters to search your private conversation history."
          />
        ) : null}

        {!searchQuery.isFetching && query.trim().length >= 2 && searchQuery.data?.length === 0 ? (
          <EmptyState
            icon="search"
            title="No matching messages"
            description="Try a different keyword or search across all conversations."
          />
        ) : null}

        <div className="search-results-list">
          {searchQuery.data?.map((result) => (
            <SearchResultCard
              key={result.id}
              result={result}
              query={query}
              onOpen={() => navigate(routes.conversation(result.conversationId))}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
