import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { FriendRequestCard } from '@/features/people/components/FriendRequestCard'
import { useFriendRequests } from '@/features/people/hooks/useFriendRequests'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { routes } from '@/shared/constants/routes'
import { useCombinedError } from '@/shared/hooks/useCombinedError'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export function FriendRequestsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'received' | 'sent'>('received')
  const [activePersonId, setActivePersonId] = useState<string | null>(null)
  const { requestsQuery, acceptMutation, declineMutation, cancelMutation } =
    useFriendRequests()

  const requests = useMemo(
    () => requestsQuery.data?.[tab] ?? [],
    [requestsQuery.data, tab],
  )

  const mutate = async (personId: string, action: () => Promise<unknown>) => {
    setActivePersonId(personId)
    try {
      await action()
    } finally {
      setActivePersonId(null)
    }
  }

  const { error, dismiss } = useCombinedError([
    requestsQuery,
    acceptMutation,
    declineMutation,
    cancelMutation,
  ])

  const switchTab = (nextTab: 'received' | 'sent') => {
    dismiss()
    setTab(nextTab)
  }

  return (
    <main className="requests-page">
      <header className="requests-page__header">
        <button type="button" className="back-link" onClick={() => navigate(routes.people)}>
          <Icon name="arrowLeft" size={17} />
          People
        </button>
        <div>
          <span className="eyebrow">Your network</span>
          <h1>Friend requests</h1>
          <p>Review who can join your private PulseLink circle.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate(routes.people)}>
          Find people
        </Button>
      </header>

      <section className="requests-card">
        <div className="tabs requests-tabs" role="tablist" aria-label="Friend request direction">
          <button
            type="button"
            className={tab === 'received' ? 'active' : undefined}
            onClick={() => switchTab('received')}
            role="tab"
            aria-selected={tab === 'received'}
          >
            Received
            <span>{requestsQuery.data?.received.length ?? 0}</span>
          </button>
          <button
            type="button"
            className={tab === 'sent' ? 'active' : undefined}
            onClick={() => switchTab('sent')}
            role="tab"
            aria-selected={tab === 'sent'}
          >
            Sent
            <span>{requestsQuery.data?.sent.length ?? 0}</span>
          </button>
        </div>

        {error ? (
          <InlineAlert tone="danger" onDismiss={dismiss}>
            {getApiErrorMessage(error)}
          </InlineAlert>
        ) : null}

        {requestsQuery.isLoading ? <LoadingState rows={5} label="Loading friend requests" /> : null}

        {!requestsQuery.isLoading && requests.length === 0 ? (
          <EmptyState
            icon="users"
            title={tab === 'received' ? 'No pending requests' : 'No sent requests'}
            description={
              tab === 'received'
                ? 'New requests will appear here when someone wants to connect.'
                : 'People you invite will appear here until they respond.'
            }
            action={
              <Button onClick={() => navigate(routes.people)}>
                <Icon name="search" size={17} />
                Discover people
              </Button>
            }
          />
        ) : null}

        <div className="request-list">
          {requests.map((request) => (
            <FriendRequestCard
              key={request.id}
              request={request}
              isWorking={activePersonId === request.id}
              onAccept={() =>
                void mutate(request.id, () => acceptMutation.mutateAsync(request.id))
              }
              onDecline={() =>
                void mutate(request.id, () => declineMutation.mutateAsync(request.id))
              }
              onCancel={() =>
                void mutate(request.id, () => cancelMutation.mutateAsync(request.id))
              }
            />
          ))}
        </div>
      </section>
    </main>
  )
}
