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

type RequestTab = 'received' | 'sent'

export function FriendRequestsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<RequestTab>('received')
  const [activePersonId, setActivePersonId] = useState<string | null>(null)
  const { requestsQuery, acceptMutation, declineMutation, cancelMutation } = useFriendRequests()

  const requests = useMemo(() => requestsQuery.data?.[tab] ?? [], [requestsQuery.data, tab])

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

  const switchTab = (nextTab: RequestTab) => {
    dismiss()
    setTab(nextTab)
  }

  return (
    <main className="workspace people-workspace people-workspace--refined">
      <section className="list-panel people-panel people-panel--refined">
        <header className="people-panel__header">
          <div>
            <span className="eyebrow">Your network</span>
            <h1>Requests</h1>
            <small>Manage incoming and sent invitations.</small>
          </div>

          <Button
            variant="secondary"
            aria-label="Back to people"
            onClick={() => navigate(routes.people)}
          >
            <Icon name="arrowLeft" size={16} />
            People
          </Button>
        </header>

        <div className="people-request-tabs" role="tablist" aria-label="Friend request direction">
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

        <div className="request-list request-list--refined" aria-live="polite" aria-busy={requestsQuery.isLoading}>
          {requestsQuery.isLoading ? <LoadingState rows={5} label="Loading friend requests" /> : null}

          {!requestsQuery.isLoading && requests.length === 0 ? (
            <EmptyState
              compact
              icon="users"
              title={tab === 'received' ? 'No pending requests' : 'No sent requests'}
              description={
                tab === 'received'
                  ? 'New invitations will appear here.'
                  : 'Requests you send will remain here until answered.'
              }
              action={
                <Button onClick={() => navigate(routes.people)}>
                  <Icon name="search" size={16} />
                  Find people
                </Button>
              }
            />
          ) : null}

          {!requestsQuery.isLoading
            ? requests.map((request) => (
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
              ))
            : null}
        </div>
      </section>

      <section className="people-overview people-overview--requests">
        <div className="people-overview__glow" />
        <div className="people-overview__content">
          <span className="people-overview__icon">
            <Icon name="users" size={26} />
          </span>
          <span className="eyebrow">Your circle, your choice</span>
          <h2>Keep your network intentional.</h2>
          <p>
            Accept people you trust, decline requests quietly, and keep every
            PulseLink conversation inside a circle you control.
          </p>
          <Button variant="secondary" onClick={() => navigate(routes.people)}>
            <Icon name="search" size={16} />
            Discover people
          </Button>
        </div>
      </section>
    </main>
  )
}