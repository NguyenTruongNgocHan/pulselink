import { useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { AdminPagination } from '@/features/admin/components/AdminPagination'
import { useAuditLog } from '@/features/admin/hooks/useAuditLog'
import type { AdminListFilters } from '@/features/admin/types/admin.types'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { SearchInput } from '@/shared/components/form/SearchInput'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatDateTime } from '@/shared/utils/date'

const defaultFilters: AdminListFilters = {
  query: '',
  status: '',
  page: 0,
  size: 25,
}

export function AdminAuditPage() {
  const [filters, setFilters] = useState(defaultFilters)
  const auditQuery = useAuditLog(filters)

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
        eyebrow="Immutable governance"
        title="Audit log"
        description="Every privileged mutation and evidence access event is recorded without update or delete controls."
      />

      <div className="admin-filter-bar">
        <SearchInput
          label="Search audit log"
          value={filters.query}
          onChange={(event) => updateFilter('query', event.target.value)}
          onClear={() => updateFilter('query', '')}
          placeholder="Search actor, action, target, or reason"
        />
        <select
          value={filters.status}
          onChange={(event) => updateFilter('status', event.target.value)}
          aria-label="Filter action"
        >
          <option value="">All actions</option>
          <option value="USER_SUSPENDED">User suspended</option>
          <option value="USER_BANNED">User banned</option>
          <option value="FORCE_LOGOUT">Force logout</option>
          <option value="REPORT_CLAIMED">Report claimed</option>
          <option value="REPORT_RESOLVED">Report resolved</option>
          <option value="EVIDENCE_VIEWED">Evidence viewed</option>
          <option value="GROUP_CLOSED">Group closed</option>
          <option value="ROLE_CHANGED">Role changed</option>
        </select>
      </div>

      {auditQuery.error ? (
        <InlineAlert tone="danger">{getApiErrorMessage(auditQuery.error)}</InlineAlert>
      ) : null}
      {auditQuery.isLoading ? <LoadingState rows={9} label="Loading audit log" /> : null}

      {auditQuery.data?.items.length === 0 ? (
        <EmptyState
          icon="shield"
          title="No audit records match"
          description="Change the filters to broaden this immutable activity view."
        />
      ) : null}

      {auditQuery.data && auditQuery.data.items.length > 0 ? (
        <section className="admin-table-card">
          <div className="admin-table admin-audit-table">
            <div className="admin-table__row admin-table__head">
              <span>Action</span>
              <span>Actor</span>
              <span>Target</span>
              <span>Reason</span>
              <span>Timestamp</span>
            </div>
            {auditQuery.data.items.map((entry) => (
              <div className="admin-table__row" key={entry.id}>
                <span className="audit-action-cell">
                  <i>
                    <Icon name="shield" size={16} />
                  </i>
                  <b>{entry.action.replaceAll('_', ' ')}</b>
                </span>
                <span>
                  @{entry.actorUsername}
                  <small>{entry.actorRole.replace('_', ' ')}</small>
                </span>
                <span>
                  {entry.targetType || 'SYSTEM'}
                  <small>{entry.targetId?.slice(0, 8) ?? '—'}</small>
                </span>
                <span>{entry.reason || 'No reason recorded.'}</span>
                <time>{formatDateTime(entry.createdAt)}</time>
              </div>
            ))}
          </div>
          <AdminPagination
            page={auditQuery.data.page}
            totalPages={auditQuery.data.totalPages}
            onPageChange={(page) => updateFilter('page', page)}
          />
        </section>
      ) : null}
    </section>
  )
}
