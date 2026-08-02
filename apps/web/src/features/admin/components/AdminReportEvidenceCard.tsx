import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { ReportEvidence } from '@/features/admin/types/admin.types'
import { formatDateTime } from '@/shared/utils/date'

interface AdminReportEvidenceCardProps {
  evidence: ReportEvidence | undefined
  evidenceAvailable: boolean
  isLoading: boolean
  onLoad: () => void
}

export function AdminReportEvidenceCard({
  evidence,
  evidenceAvailable,
  isLoading,
  onLoad,
}: AdminReportEvidenceCardProps) {
  return (
    <section className="admin-card admin-evidence-card">
      <header>
        <div>
          <span>Privacy-bounded review</span>
          <h2>Evidence snapshot</h2>
        </div>
        <Button
          variant="secondary"
          disabled={!evidenceAvailable || isLoading}
          onClick={onLoad}
        >
          {isLoading ? 'Loading…' : 'Load evidence'}
        </Button>
      </header>

      {!evidence ? (
        <div className="admin-evidence-placeholder">
          <Icon name="shield" size={28} />
          <p>
            Evidence access is audited. Only the immutable snapshot and a bounded message
            context are available.
          </p>
        </div>
      ) : (
        <div className="admin-evidence-content">
          <p>
            Captured {formatDateTime(evidence.capturedAt)} · {evidence.targetType}
          </p>
          <pre>{JSON.stringify(evidence.snapshot, null, 2)}</pre>
          {evidence.nearbyMessages.length > 0 ? (
            <div className="admin-nearby-messages">
              <h3>Bounded context</h3>
              {evidence.nearbyMessages.map((message) => (
                <article key={message.id}>
                  <b>{message.author}</b>
                  <p>{message.content || 'Deleted message'}</p>
                  <small>{formatDateTime(message.createdAt)}</small>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
