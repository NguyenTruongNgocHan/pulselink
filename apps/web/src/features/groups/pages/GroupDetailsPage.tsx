import { useNavigate, useParams } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useGroup } from '@/features/groups/hooks/useGroup'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { getInitials } from '@/shared/utils/avatar'
import { formatDateTime } from '@/shared/utils/date'

export function GroupDetailsPage() {
  const navigate = useNavigate()
  const { groupId = '' } = useParams()
  const { groupQuery } = useGroup(groupId)

  if (groupQuery.isLoading) {
    return (
      <section className="group-page">
        <LoadingState label="Loading group" rows={6} />
      </section>
    )
  }

  if (groupQuery.error || !groupQuery.data) {
    return (
      <section className="group-page">
        <InlineAlert tone="danger">
          {groupQuery.error ? getApiErrorMessage(groupQuery.error) : 'Group not found.'}
        </InlineAlert>
      </section>
    )
  }

  const group = groupQuery.data
  const admin = group.members.find((member) => member.role === 'ADMIN')

  return (
    <section className="group-page">
      <header className="pane-header">
        <button
          type="button"
          className="icon-button"
          aria-label="Back to conversation"
          onClick={() => navigate(routes.conversation(group.id))}
        >
          <Icon name="arrowLeft" />
        </button>
        <div>
          <b>Group details</b>
          <small>{group.status === 'CLOSED' ? 'Closed by moderation' : 'Private group'}</small>
        </div>
      </header>

      <div className="group-detail-content">
        <section className="group-hero-card">
          <Avatar initials={getInitials(group.name)} tone="violet" size="xl" />
          <div>
            <span className="eyebrow">{group.members.length} members</span>
            <h1>{group.name}</h1>
            <p>
              Created {formatDateTime(group.createdAt)}
              {admin ? ` · Admin: ${admin.displayName}` : ''}
            </p>
          </div>
          {group.currentUserRole === 'ADMIN' ? (
            <Button onClick={() => navigate(routes.groupAdministration(group.id))}>
              <Icon name="settings" size={17} />
              Manage group
            </Button>
          ) : null}
        </section>

        {group.status === 'CLOSED' ? (
          <InlineAlert tone="warning" title="This group is closed">
            Existing members can view history, but new messages and membership changes are disabled.
          </InlineAlert>
        ) : null}

        <section className="group-members-card">
          <header>
            <div>
              <h2>Members</h2>
              <p>People who can see and participate in this conversation.</p>
            </div>
            <span>{group.members.length}</span>
          </header>

          <div className="group-member-grid">
            {group.members.map((member) => (
              <article key={member.id}>
                <Avatar
                  initials={getInitials(member.displayName)}
                  tone="violet"
                  online={member.isOnline}
                />
                <span>
                  <b>{member.displayName}</b>
                  <small>@{member.username}</small>
                </span>
                {member.role === 'ADMIN' ? <em>Admin</em> : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
