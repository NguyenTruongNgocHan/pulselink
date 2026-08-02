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
          {groupQuery.error
            ? getApiErrorMessage(groupQuery.error)
            : 'Group not found.'}
        </InlineAlert>
      </section>
    )
  }

  const group = groupQuery.data
  const admin = group.members.find((member) => member.role === 'ADMIN')
  const onlineCount = group.members.filter((member) => member.isOnline).length

  return (
    <section className="group-page group-details-page">
      <header className="group-page-header">
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
          <small>
            {group.status === 'CLOSED' ? 'Closed by moderation' : 'Private group'}
          </small>
        </div>
      </header>

      <div className="group-details-content">
        <section className="group-profile-card">
          <div className="group-profile-card__glow" />

          <div className="group-profile-card__main">
            <Avatar
              initials={getInitials(group.name)}
              tone="violet"
              size="xl"
            />

            <div className="group-profile-card__copy">
              <span className="eyebrow">Private group</span>
              <h1>{group.name}</h1>
              <p>
                Created {formatDateTime(group.createdAt)}
                {admin ? ` · Admin: ${admin.displayName}` : ''}
              </p>
            </div>

            {group.currentUserRole === 'ADMIN' ? (
              <Button
                onClick={() =>
                  navigate(routes.groupAdministration(group.id))
                }
              >
                <Icon name="settings" size={17} />
                Manage group
              </Button>
            ) : null}
          </div>

          <div className="group-profile-card__stats">
            <span>
              <b>{group.members.length}</b>
              <small>Members</small>
            </span>
            <span>
              <b>{onlineCount}</b>
              <small>Online now</small>
            </span>
            <span>
              <b>{group.currentUserRole === 'ADMIN' ? 'Admin' : 'Member'}</b>
              <small>Your role</small>
            </span>
          </div>
        </section>

        {group.status === 'CLOSED' ? (
          <InlineAlert tone="warning" title="This group is closed">
            Existing members can view history, but new messages and membership
            changes are disabled.
          </InlineAlert>
        ) : null}

        <section className="group-members-panel">
          <header>
            <div>
              <h2>Members</h2>
              <p>People who can see and participate in this conversation.</p>
            </div>
            <span>{group.members.length}</span>
          </header>

          <div className="group-members-grid">
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

                <div>
                  {member.role === 'ADMIN' ? <em>Admin</em> : null}
                  <small>{member.isOnline ? 'Online' : 'Offline'}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}