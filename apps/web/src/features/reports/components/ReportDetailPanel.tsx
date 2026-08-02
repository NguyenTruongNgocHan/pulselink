import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { UserReport } from '@/features/reports/types/report.types'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { formatDateTime } from '@/shared/utils/date'

interface ReportDetailPanelProps {
  report: UserReport | null
  onAddClarification: () => void
}

export function ReportDetailPanel({ report, onAddClarification }: ReportDetailPanelProps) {
  if (!report) {
    return (
      <section className="report-detail">
        <EmptyState
          icon="flag"
          title="Choose a report"
          description="Select a report to see its public status and resolution."
        />
      </section>
    )
  }

  const decisionRecorded = report.status === 'RESOLVED' || report.status === 'REJECTED'

  return (
    <section className="report-detail">
      <article className="report-detail__card">
        <header>
          <div>
            <span className="eyebrow">Report #{report.id.slice(0, 8)}</span>
            <h2>{report.targetLabel}</h2>
            <p>Submitted {formatDateTime(report.createdAt)}</p>
          </div>
          <span className={`status-pill status-${report.status.toLowerCase()}`}>
            {report.status.replace('_', ' ')}
          </span>
        </header>

        <div className="report-detail__timeline" aria-label="Report progress">
          <span className="complete">Submitted</span>
          <i />
          <span className={report.status !== 'OPEN' ? 'complete' : ''}>In review</span>
          <i />
          <span className={decisionRecorded ? 'complete' : ''}>Decision</span>
        </div>

        <dl className="report-detail__facts">
          <div>
            <dt>Target type</dt>
            <dd>{report.targetType}</dd>
          </div>
          <div>
            <dt>Reason</dt>
            <dd>{report.reason}</dd>
          </div>
          <div>
            <dt>Description</dt>
            <dd>{report.description || 'No additional description.'}</dd>
          </div>
          {report.outcome ? (
            <div>
              <dt>Outcome</dt>
              <dd>{report.outcome.replaceAll('_', ' ')}</dd>
            </div>
          ) : null}
          {report.resolutionSummary ? (
            <div>
              <dt>Resolution</dt>
              <dd>{report.resolutionSummary}</dd>
            </div>
          ) : null}
        </dl>

        {report.clarifications.length > 0 ? (
          <section className="report-clarifications">
            <h3>Your clarifications</h3>
            {report.clarifications.map((item) => (
              <article key={item.id}>
                <p>{item.body}</p>
                <time>{formatDateTime(item.createdAt)}</time>
              </article>
            ))}
          </section>
        ) : null}

        {report.status === 'OPEN' ? (
          <Button onClick={onAddClarification}>
            <Icon name="comment" size={17} />
            Add clarification
          </Button>
        ) : null}
      </article>
    </section>
  )
}
