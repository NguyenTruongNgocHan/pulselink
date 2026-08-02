import type { AdminReportDetails } from '@/features/admin/types/admin.types'
import { formatDateTime } from '@/shared/utils/date'

interface AdminReportSummaryCardProps {
  report: AdminReportDetails
}

export function AdminReportSummaryCard({ report }: AdminReportSummaryCardProps) {
  return (
    <section className="admin-card admin-report-summary-card">
      <header>
        <div>
          <span>Reporter statement</span>
          <h2>Submitted context</h2>
        </div>
      </header>

      <dl>
        <div>
          <dt>Target</dt>
          <dd>{report.targetLabel}</dd>
        </div>
        <div>
          <dt>Reason</dt>
          <dd>{report.reason}</dd>
        </div>
        <div>
          <dt>Description</dt>
          <dd>{report.description || 'No description supplied.'}</dd>
        </div>
        <div>
          <dt>Submitted</dt>
          <dd>{formatDateTime(report.createdAt)}</dd>
        </div>
        {report.assigneeUsername ? (
          <div>
            <dt>Assignee</dt>
            <dd>@{report.assigneeUsername}</dd>
          </div>
        ) : null}
      </dl>

      {report.comments.length > 0 ? (
        <div className="admin-report-comments">
          <h3>Reporter clarifications</h3>
          {report.comments.map((comment) => (
            <article key={comment.id}>
              <p>{comment.body}</p>
              <small>
                @{comment.authorUsername} · {formatDateTime(comment.createdAt)}
              </small>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
