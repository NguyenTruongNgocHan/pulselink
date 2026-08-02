import { Button } from '@/components/ui/Button'
import type { AdminReportStatus } from '@/features/admin/types/admin.types'

interface AdminReportDecisionBarProps {
  status: AdminReportStatus
  isClaiming: boolean
  onClaim: () => void
  onReject: () => void
  onResolve: () => void
}

export function AdminReportDecisionBar({
  status,
  isClaiming,
  onClaim,
  onReject,
  onResolve,
}: AdminReportDecisionBarProps) {
  if (status === 'OPEN') {
    return (
      <section className="admin-decision-bar">
        <div>
          <h2>Begin review</h2>
          <p>Claiming prevents another moderator from resolving the same report concurrently.</p>
        </div>
        <Button disabled={isClaiming} onClick={onClaim}>
          {isClaiming ? 'Claiming…' : 'Claim report'}
        </Button>
      </section>
    )
  }

  if (status !== 'IN_REVIEW') return null

  return (
    <section className="admin-decision-bar">
      <div>
        <h2>Record a decision</h2>
        <p>The reason and resulting action will be written to the immutable audit log.</p>
      </div>
      <Button variant="secondary" onClick={onReject}>
        Reject report
      </Button>
      <Button onClick={onResolve}>Resolve report</Button>
    </section>
  )
}
