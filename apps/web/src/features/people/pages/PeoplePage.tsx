import { useState } from 'react'
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
    <main className="workspace people-workspace">
      <section className="list-panel people-panel">
        <header className="panel-heading">
          <div>
            <span className="eyebrow">Your network</span>
            <h1>People</h1>
            <small>Find people and start meaningful conversations.</small>
          </div>
          <Button variant="secondary" onClick={() => navigate(routes.friendRequests)}>
            <Icon name="users" size={17} />
            Requests
          </Button>
        </header>

        <SearchInput
          label="Search people"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          onClear={() => updateQuery('')}
          placeholder="Search by name or username"
          autoComplete="off"
        />

        {error ? (
          <InlineAlert tone="danger" onDismiss={dismiss}>
            {getApiErrorMessage(error)}
          </InlineAlert>
        ) : null}

        <div className="people-list" aria-live="polite">
          {peopleQuery.isLoading ? <LoadingState rows={6} label="Loading people" /> : null}

          {!peopleQuery.isLoading && peopleQuery.data?.length === 0 ? (
            <EmptyState
              compact
              icon="users"
              title={query ? 'No matching people' : 'No people to show yet'}
              description={
                query
                  ? 'Try a different name or username.'
                  : 'New PulseLink members will appear here.'
              }
            />
          ) : null}

          {peopleQuery.data?.map((person) => (
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
          ))}
        </div>
      </section>

      <section className="empty-pane people-hero-pane">
        <div className="people-hero-pane__orb" />
        <span className="people-hero-pane__icon">
          <Icon name="users" size={30} />
        </span>
        <h2>Find your people</h2>
        <p>
          Search by name or username, build your trusted circle, and start a private
          realtime conversation.
        </p>
        <div className="people-hero-pane__stats">
          <span>
            <strong>{peopleQuery.data?.filter((person) => person.isOnline).length ?? 0}</strong>
            online now
          </span>
          <span>
            <strong>
              {peopleQuery.data?.filter((person) => person.relationshipStatus === 'FRIEND')
                .length ?? 0}
            </strong>
            connections
          </span>
        </div>
      </section>
    </main>
  )
}
