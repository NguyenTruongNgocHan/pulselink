import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { SecuritySession } from '@/features/profile/types/profile.types'
import { formatRelativeTime } from '@/shared/utils/date'

interface SecuritySessionRowProps {
  session: SecuritySession
  isRevoking: boolean
  onRevoke: () => void
}

export function SecuritySessionRow({
  session,
  isRevoking,
  onRevoke,
}: SecuritySessionRowProps) {
  return (
    <article className="security-session-row">
      <span className="security-session-row__icon">
        <Icon name="monitor" />
      </span>
      <div>
        <b>{session.deviceName}</b>
        <p>
          {session.browser} on {session.operatingSystem}
        </p>
        <small>
          {session.location ? `${session.location} · ` : ''}
          {session.current ? 'Current session' : `Active ${formatRelativeTime(session.lastUsedAt)}`}
        </small>
      </div>
      {session.current ? (
        <span className="status-pill">Current</span>
      ) : (
        <Button variant="secondary" disabled={isRevoking} onClick={onRevoke}>
          {isRevoking ? 'Signing out…' : 'Sign out'}
        </Button>
      )}
    </article>
  )
}
