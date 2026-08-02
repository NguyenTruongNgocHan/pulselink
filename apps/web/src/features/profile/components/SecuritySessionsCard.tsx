import { Button } from '@/components/ui/Button'
import { SecuritySessionRow } from '@/features/profile/components/SecuritySessionRow'
import type { SecuritySession } from '@/features/profile/types/profile.types'
import { LoadingState } from '@/shared/components/feedback/LoadingState'

interface SecuritySessionsCardProps {
  sessions: SecuritySession[]
  isLoading: boolean
  isRevokingOthers: boolean
  activeSessionId: string | null
  onRevokeOthers: () => void
  onRevokeSession: (sessionId: string) => void
}

export function SecuritySessionsCard({
  sessions,
  isLoading,
  isRevokingOthers,
  activeSessionId,
  onRevokeOthers,
  onRevokeSession,
}: SecuritySessionsCardProps) {
  return (
    <section className="settings-card">
      <header className="settings-card__split-header">
        <div>
          <h2>Active sessions</h2>
          <p>Review devices that can access your account.</p>
        </div>
        <Button
          variant="secondary"
          disabled={isRevokingOthers || sessions.length <= 1}
          onClick={onRevokeOthers}
        >
          {isRevokingOthers ? 'Signing out…' : 'Sign out other sessions'}
        </Button>
      </header>

      {isLoading ? <LoadingState rows={4} label="Loading security sessions" /> : null}
      <div className="security-session-list">
        {sessions.map((session) => (
          <SecuritySessionRow
            key={session.id}
            session={session}
            isRevoking={activeSessionId === session.id}
            onRevoke={() => onRevokeSession(session.id)}
          />
        ))}
      </div>
    </section>
  )
}
