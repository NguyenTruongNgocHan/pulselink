import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { UserReport } from '@/features/reports/types/report.types'
import { formatDateTime } from '@/shared/utils/date'

interface ReportDetailPanelProps {
  report: UserReport | null
  onAddClarification: () => void
}

export function ReportDetailPanel({
  report,
  onAddClarification,
}: ReportDetailPanelProps) {
  if (!report) {
    return (
      <section className="reports-v2-detail reports-v2-detail--empty">
        <div className="reports-v2-detail__glow" />

        <div className="reports-v2-detail__empty-content">
          <span className="reports-v2-detail__empty-icon">
            <Icon name="flag" size={28} />
          </span>

          <span className="eyebrow">Safety center</span>
          <h2>Choose a report</h2>
          <p>Select a report to see its public status and resolution.</p>
        </div>
      </section>
    )
  }

  const decisionRecorded =
    report.status === 'RESOLVED' || report.status === 'REJECTED'

  return (
    <section className="reports-v2-detail">
      <div className="reports-v2-detail__shell">
        <header className="reports-v2-detail__header">
          <div>
            <span className="eyebrow">
              Report #{report.id.slice(0, 8)}
            </span>

            <h2>{report.targetLabel}</h2>

            <p>Submitted {formatDateTime(report.createdAt)}</p>
          </div>

          <span
            className={`reports-v2-status reports-v2-status--${report.status.toLowerCase()}`}
          >
            {report.status.replaceAll('_', ' ')}
          </span>
        </header>

        <section
          className="reports-v2-progress"
          aria-label="Report progress"
        >
          <div className="complete">
            <span>
              <Icon name="check" size={14} />
            </span>
            <strong>Submitted</strong>
          </div>

          <i />

          <div className={report.status !== 'OPEN' ? 'complete' : ''}>
            <span>
              <Icon name="shield" size={14} />
            </span>
            <strong>In review</strong>
          </div>

          <i />

          <div className={decisionRecorded ? 'complete' : ''}>
            <span>
              <Icon name="flag" size={14} />
            </span>
            <strong>Decision</strong>
          </div>
        </section>

        <section className="reports-v2-detail__facts">
          <article>
            <span className="reports-v2-detail__fact-icon">
              <Icon name="info" size={17} />
            </span>

            <div>
              <small>Target type</small>
              <strong>{report.targetType}</strong>
            </div>
          </article>

          <article>
            <span className="reports-v2-detail__fact-icon">
              <Icon name="flag" size={17} />
            </span>

            <div>
              <small>Reason</small>
              <strong>{report.reason}</strong>
            </div>
          </article>
        </section>

        <section className="reports-v2-detail__section">
          <header>
            <h3>Description</h3>
          </header>

          <p>
            {report.description || 'No additional description was provided.'}
          </p>
        </section>

        {report.outcome || report.resolutionSummary ? (
          <section className="reports-v2-detail__section">
            <header>
              <h3>Resolution</h3>
            </header>

            {report.outcome ? (
              <div className="reports-v2-detail__resolution-row">
                <small>Outcome</small>
                <strong>{report.outcome.replaceAll('_', ' ')}</strong>
              </div>
            ) : null}

            {report.resolutionSummary ? (
              <p>{report.resolutionSummary}</p>
            ) : null}
          </section>
        ) : null}

        {report.clarifications.length > 0 ? (
          <section className="reports-v2-detail__section">
            <header>
              <h3>Your clarifications</h3>
              <span>{report.clarifications.length}</span>
            </header>

            <div className="reports-v2-clarifications">
              {report.clarifications.map((item) => (
                <article key={item.id}>
                  <p>{item.body}</p>
                  <time dateTime={item.createdAt}>
                    {formatDateTime(item.createdAt)}
                  </time>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {report.status === 'OPEN' ? (
          <footer className="reports-v2-detail__footer">
            <div>
              <strong>Need to add context?</strong>
              <small>
                Clarifications are permanent after submission.
              </small>
            </div>

            <Button onClick={onAddClarification}>
              <Icon name="comment" size={17} />
              Add clarification
            </Button>
          </footer>
        ) : null}
      </div>
    </section>
  )
}
