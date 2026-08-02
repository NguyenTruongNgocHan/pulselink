import { Avatar } from '@/components/ui/Avatar'
import type { AdminUserDetails } from '@/features/admin/types/admin.types'
import { getInitials } from '@/shared/utils/avatar'
import { formatDateTime } from '@/shared/utils/date'

interface AdminUserProfileCardProps {
  user: AdminUserDetails
}

export function AdminUserProfileCard({ user }: AdminUserProfileCardProps) {
  return (
    <section className="admin-card admin-user-profile-card">
      <Avatar
        initials={getInitials(user.displayName)}
        src={user.avatarUrl}
        tone="violet"
        size="xl"
      />
      <div>
        <span className={`status-pill status-${user.status.toLowerCase()}`}>
          {user.status}
        </span>
        <h2>{user.displayName}</h2>
        <p>{user.bio || 'No bio provided.'}</p>
      </div>
      <dl>
        <div>
          <dt>System role</dt>
          <dd>{user.role.replace('_', ' ')}</dd>
        </div>
        <div>
          <dt>Email verified</dt>
          <dd>{user.emailVerified ? 'Yes' : 'No'}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDateTime(user.createdAt)}</dd>
        </div>
        <div>
          <dt>Active sessions</dt>
          <dd>{user.sessionCount}</dd>
        </div>
        <div>
          <dt>Reports against user</dt>
          <dd>{user.reportCount}</dd>
        </div>
        {user.suspendedUntil ? (
          <div>
            <dt>Suspended until</dt>
            <dd>{formatDateTime(user.suspendedUntil)}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}
