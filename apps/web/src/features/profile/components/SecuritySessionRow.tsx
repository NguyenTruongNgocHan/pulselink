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
    <article className="security-session-v2">
      <span className="security-session-v2__icon">
        <Icon name="monitor" size={19} />
      </span>

      <div className="security-session-v2__copy">
        <strong>{session.deviceName}</strong>
        <p>
          {session.browser} on {session.operatingSystem}
        </p>
        <small>
          {session.location ? `${session.location} · ` : ''}
          {session.current
            ? 'Current session'
            : `Active ${formatRelativeTime(session.lastUsedAt)}`}
        </small>
      </div>

      {session.current ? (
        <span className="security-session-v2__current">
          Current
        </span>
      ) : (
        <Button
          variant="secondary"
          disabled={isRevoking}
          onClick={onRevoke}
        >
          {isRevoking ? 'Signing out…' : 'Sign out'}
        </Button>
      )}
    </article>
  )
}
