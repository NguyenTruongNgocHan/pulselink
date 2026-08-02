import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { AdminStatCard } from '@/features/admin/components/AdminStatCard'
import { useAdminDashboard } from '@/features/admin/hooks/useAdminDashboard'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatRelativeTime } from '@/shared/utils/date'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const dashboardQuery = useAdminDashboard()

  return (
    <section className="admin-page">
      <AdminPageHeader
        eyebrow="Operational overview"
        title="Administration dashboard"
        description="Monitor account health, messaging activity, and the moderation queue."
        actions={
          <Button onClick={() => navigate(routes.adminReports)}>
            Review reports
            <Icon name="chevron" size={16} />
          </Button>
        }
      />

      {dashboardQuery.error ? (
        <InlineAlert tone="danger">{getApiErrorMessage(dashboardQuery.error)}</InlineAlert>
      ) : null}

      {dashboardQuery.isLoading ? (
        <LoadingState rows={8} label="Loading administration dashboard" />
      ) : null}

      {dashboardQuery.data ? (
        <>
          <div className="admin-stat-grid">
            <AdminStatCard
              label="Total users"
              value={dashboardQuery.data.users}
              description={`${dashboardQuery.data.activeUsers} active accounts`}
              icon="users"
            />
            <AdminStatCard
              label="Conversations"
              value={dashboardQuery.data.conversations}
              description={`${dashboardQuery.data.messages} persisted messages`}
              icon="chat"
            />
            <AdminStatCard
              label="Open reports"
              value={dashboardQuery.data.openReports}
              description={`${dashboardQuery.data.inReviewReports} currently in review`}
              icon="flag"
              tone={dashboardQuery.data.openReports > 0 ? 'warning' : 'success'}
            />
            <AdminStatCard
              label="Restricted accounts"
              value={dashboardQuery.data.suspendedUsers + dashboardQuery.data.bannedUsers}
              description={`${dashboardQuery.data.suspendedUsers} suspended · ${dashboardQuery.data.bannedUsers} banned`}
              icon="shield"
              tone={dashboardQuery.data.bannedUsers > 0 ? 'danger' : 'default'}
            />
          </div>

          <div className="admin-dashboard-grid">
            <section className="admin-card admin-workload-card">
              <header>
                <div>
                  <span>Last 7 days</span>
                  <h2>Report workload</h2>
                </div>
                <Button variant="ghost" onClick={() => navigate(routes.adminReports)}>
                  Open queue
                </Button>
              </header>

              <div className="admin-trend-chart" aria-label="Report workload over seven days">
                {dashboardQuery.data.reportTrend.length > 0 ? (
                  dashboardQuery.data.reportTrend.map((point) => {
                    const max = Math.max(
                      ...dashboardQuery.data.reportTrend.map((item) => item.count),
                      1,
                    )
                    const height = Math.max(8, (point.count / max) * 100)
                    return (
                      <div key={point.date}>
                        <span title={`${point.count} reports`} style={{ height: `${height}%` }} />
                        <small>{new Date(point.date).toLocaleDateString(undefined, { weekday: 'short' })}</small>
                      </div>
                    )
                  })
                ) : (
                  <p className="muted-copy">No report activity in this period.</p>
                )}
              </div>
            </section>

            <section className="admin-card admin-recent-actions">
              <header>
                <div>
                  <span>Append-only record</span>
                  <h2>Recent staff actions</h2>
                </div>
                <Button variant="ghost" onClick={() => navigate(routes.adminAudit)}>
                  View audit log
                </Button>
              </header>

              <div>
                {dashboardQuery.data.recentActions.map((entry) => (
                  <article key={entry.id}>
                    <span className="admin-action-icon">
                      <Icon name="shield" size={17} />
                    </span>
                    <div>
                      <b>{entry.action.replaceAll('_', ' ')}</b>
                      <p>
                        @{entry.actorUsername}
                        {entry.targetType ? ` · ${entry.targetType}` : ''}
                      </p>
                    </div>
                    <time>{formatRelativeTime(entry.createdAt)}</time>
                  </article>
                ))}
                {dashboardQuery.data.recentActions.length === 0 ? (
                  <p className="muted-copy">No privileged actions recorded yet.</p>
                ) : null}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </section>
  )
}
