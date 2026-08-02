import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { AdminPagination } from '@/features/admin/components/AdminPagination'
import { useAdminReports } from '@/features/admin/hooks/useAdminReports'
import type { AdminListFilters } from '@/features/admin/types/admin.types'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { SearchInput } from '@/shared/components/form/SearchInput'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatRelativeTime } from '@/shared/utils/date'

const defaultFilters: AdminListFilters = {
  query: '',
  status: '',
  page: 0,
  size: 20,
}

export function AdminReportsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const reportsQuery = useAdminReports(filters)

  const updateFilter = <K extends keyof AdminListFilters>(
    key: K,
    value: AdminListFilters[K],
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? (value as number) : 0,
    }))
  }

  return (
    <section className="admin-page">
      <AdminPageHeader
        eyebrow="Moderation workflow"
        title="Report queue"
        description="Claim reports, review minimized evidence, and record a reasoned outcome."
      />

      <div className="admin-filter-bar">
        <SearchInput
          label="Search reports"
          value={filters.query}
          onChange={(event) => updateFilter('query', event.target.value)}
          onClear={() => updateFilter('query', '')}
          placeholder="Search reason, reporter, or target"
        />
        <select
          value={filters.status}
          onChange={(event) => updateFilter('status', event.target.value)}
          aria-label="Filter report status"
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_REVIEW">In review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {reportsQuery.error ? (
        <InlineAlert tone="danger">{getApiErrorMessage(reportsQuery.error)}</InlineAlert>
      ) : null}
      {reportsQuery.isLoading ? <LoadingState rows={8} label="Loading reports" /> : null}

      {reportsQuery.data?.items.length === 0 ? (
        <EmptyState
          icon="flag"
          title="No reports in this view"
          description="Change the filters or return later when new safety reports arrive."
        />
      ) : null}

      {reportsQuery.data && reportsQuery.data.items.length > 0 ? (
        <section className="admin-report-queue">
          {reportsQuery.data.items.map((report) => (
            <button
              type="button"
              key={report.id}
              className="admin-report-card"
              onClick={() => navigate(`/admin/reports/${report.id}`)}
            >
              <span className="admin-report-card__icon">
                <Icon name="flag" />
              </span>
              <div>
                <header>
                  <span className={`status-pill status-${report.status.toLowerCase()}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                  <time>{formatRelativeTime(report.createdAt)}</time>
                </header>
                <h2>{report.reason}</h2>
                <p>
                  {report.targetType} · {report.targetLabel}
                </p>
                <small>
                  Reported by @{report.reporterUsername}
                  {report.assigneeUsername ? ` · Assigned to @${report.assigneeUsername}` : ''}
                </small>
              </div>
              <Icon name="chevron" />
            </button>
          ))}
          <AdminPagination
            page={reportsQuery.data.page}
            totalPages={reportsQuery.data.totalPages}
            onPageChange={(page) => updateFilter('page', page)}
          />
        </section>
      ) : null}
    </section>
  )
}
