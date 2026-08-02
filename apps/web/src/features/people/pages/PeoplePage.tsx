import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PersonRow } from '@/features/people/components/PersonRow'
import { usePeopleSearch } from '@/features/people/hooks/usePeopleSearch'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { SearchInput } from '@/shared/components/form/SearchInput'
import { routes } from '@/shared/constants/routes'
import { useCombinedError } from '@/shared/hooks/useCombinedError'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export function PeoplePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activePersonId, setActivePersonId] = useState<string | null>(null)
  const {
    peopleQuery,
    sendRequestMutation,
    acceptRequestMutation,
    removeFriendMutation,
    conversationMutation,
  } = usePeopleSearch(query)

  const people = peopleQuery.data ?? []
  const summary = useMemo(
    () => ({
      online: people.filter((person) => person.isOnline).length,
      friends: people.filter((person) => person.relationshipStatus === 'FRIEND').length,
      pending: people.filter((person) =>
        ['PENDING_RECEIVED', 'PENDING_SENT'].includes(person.relationshipStatus),
      ).length,
    }),
    [people],
  )

  const { error, dismiss } = useCombinedError([
    peopleQuery,
    sendRequestMutation,
    acceptRequestMutation,
    removeFriendMutation,
    conversationMutation,
  ])

  const updateQuery = (nextQuery: string) => {
    dismiss()
    setQuery(nextQuery)
  }

  const perform = async (personId: string, action: () => Promise<unknown>) => {
    setActivePersonId(personId)
    try {
      await action()
    } finally {
      setActivePersonId(null)
    }
  }

  const openConversation = async (personId: string) => {
    await perform(personId, async () => {
      const conversation = await conversationMutation.mutateAsync(personId)
      navigate(routes.conversation(conversation.id))
    })
  }

  return (
    <main className="workspace people-workspace people-workspace--refined">
      <section className="list-panel people-panel people-panel--refined">
        <header className="people-panel__header">
          <div>
            <span className="eyebrow">Your network</span>
            <h1>People</h1>
            <small>Find people and begin a private conversation.</small>
          </div>

          <Button variant="secondary" onClick={() => navigate(routes.friendRequests)}>
            <Icon name="users" size={16} />
            Requests
          </Button>
        </header>

        <div className="people-panel__search">
          <SearchInput
            label="Search people"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onClear={() => updateQuery('')}
            placeholder="Search name or username"
            autoComplete="off"
          />
        </div>

        <div className="people-panel__meta">
          <span>{people.length} {people.length === 1 ? 'person' : 'people'}</span>
          {query ? (
            <button type="button" onClick={() => updateQuery('')}>
              Clear
            </button>
          ) : null}
        </div>

        {error ? (
          <InlineAlert tone="danger" onDismiss={dismiss}>
            {getApiErrorMessage(error)}
          </InlineAlert>
        ) : null}

        <div className="people-list people-list--refined" aria-live="polite" aria-busy={peopleQuery.isLoading}>
          {peopleQuery.isLoading ? <LoadingState rows={6} label="Loading people" /> : null}

          {!peopleQuery.isLoading && people.length === 0 ? (
            <EmptyState
              compact
              icon="users"
              title={query ? 'No matching people' : 'No people to show yet'}
              description={query ? 'Try another name or username.' : 'New PulseLink members will appear here.'}
            />
          ) : null}

          {!peopleQuery.isLoading
            ? people.map((person) => (
                <PersonRow
                  key={person.id}
                  person={person}
                  isWorking={activePersonId === person.id}
                  onMessage={() => void openConversation(person.id)}
                  onSendRequest={() =>
                    void perform(person.id, () => sendRequestMutation.mutateAsync(person.id))
                  }
                  onAcceptRequest={() =>
                    void perform(person.id, () => acceptRequestMutation.mutateAsync(person.id))
                  }
                  onRemoveFriend={() =>
                    void perform(person.id, () => removeFriendMutation.mutateAsync(person.id))
                  }
                />
              ))
            : null}
        </div>
      </section>

      <section className="people-overview" aria-label="Network overview">
        <div className="people-overview__glow" />
        <div className="people-overview__content">
          <span className="people-overview__icon">
            <Icon name="users" size={26} />
          </span>
          <span className="eyebrow">Private by design</span>
          <h2>Find the people who matter.</h2>
          <p>
            Build your trusted circle, then move naturally into the same private
            conversations you already know in PulseLink.
          </p>

          <div className="people-overview__stats">
            <span><b>{summary.online}</b><small>Online now</small></span>
            <span><b>{summary.friends}</b><small>Connections</small></span>
            <span><b>{summary.pending}</b><small>Pending</small></span>
          </div>
        </div>
      </section>
    </main>
  )
}
