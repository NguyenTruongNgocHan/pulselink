import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { AdminPagination } from '@/features/admin/components/AdminPagination'
import { useAdminGroups } from '@/features/admin/hooks/useAdminGroups'
import type { AdminGroup, AdminListFilters } from '@/features/admin/types/admin.types'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { SearchInput } from '@/shared/components/form/SearchInput'
import { ConfirmDialog } from '@/shared/components/overlay/ConfirmDialog'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { formatDateTime } from '@/shared/utils/date'

const defaultFilters: AdminListFilters = {
  query: '',
  status: '',
  page: 0,
  size: 20,
}

export function AdminGroupsPage() {
  const [filters, setFilters] = useState(defaultFilters)
  const [selectedGroup, setSelectedGroup] = useState<AdminGroup | null>(null)
  const [reason, setReason] = useState('')
  const { groupsQuery, moderationMutation } = useAdminGroups(filters)

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

  const moderate = async () => {
    if (!selectedGroup) return
    await moderationMutation.mutateAsync({
      groupId: selectedGroup.id,
      action: selectedGroup.status === 'ACTIVE' ? 'close' : 'reopen',
      reason: reason.trim(),
    })
    setSelectedGroup(null)
    setReason('')
  }

  return (
    <section className="admin-page">
      <AdminPageHeader
        eyebrow="Community operations"
        title="Group directory"
        description="Review group metadata and close or reopen a group without browsing private history."
      />

      <div className="admin-filter-bar">
        <SearchInput
          label="Search groups"
          value={filters.query}
          onChange={(event) => updateFilter('query', event.target.value)}
          onClear={() => updateFilter('query', '')}
          placeholder="Search group name"
        />
        <select
          value={filters.status}
          onChange={(event) => updateFilter('status', event.target.value)}
          aria-label="Filter group status"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {groupsQuery.error ? (
        <InlineAlert tone="danger">{getApiErrorMessage(groupsQuery.error)}</InlineAlert>
      ) : null}
      {moderationMutation.error ? (
        <InlineAlert tone="danger" onDismiss={() => moderationMutation.reset()}>
          {getApiErrorMessage(moderationMutation.error)}
        </InlineAlert>
      ) : null}
      {groupsQuery.isLoading ? <LoadingState rows={7} label="Loading groups" /> : null}

      {groupsQuery.data?.items.length === 0 ? (
        <EmptyState
          icon="group"
          title="No matching groups"
          description="Change the search or status filter to see more groups."
        />
      ) : null}

      {groupsQuery.data && groupsQuery.data.items.length > 0 ? (
        <section className="admin-group-grid">
          {groupsQuery.data.items.map((group) => (
            <article className="admin-group-card" key={group.id}>
              <span className="admin-group-card__icon">
                <Icon name="group" />
              </span>
              <div>
                <header>
                  <span className={`status-pill status-${group.status.toLowerCase()}`}>
                    {group.status}
                  </span>
                  <small>{formatDateTime(group.createdAt)}</small>
                </header>
                <h2>{group.name}</h2>
                <p>
                  {group.memberCount} active members
                  {group.adminUsername ? ` · Admin @${group.adminUsername}` : ''}
                </p>
              </div>
              <Button
                variant={group.status === 'ACTIVE' ? 'danger' : 'secondary'}
                onClick={() => setSelectedGroup(group)}
              >
                {group.status === 'ACTIVE' ? 'Close group' : 'Reopen group'}
              </Button>
            </article>
          ))}
          <AdminPagination
            page={groupsQuery.data.page}
            totalPages={groupsQuery.data.totalPages}
            onPageChange={(page) => updateFilter('page', page)}
          />
        </section>
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(selectedGroup)}
        title={
          selectedGroup?.status === 'ACTIVE'
            ? `Close ${selectedGroup?.name}?`
            : `Reopen ${selectedGroup?.name}?`
        }
        description={
          selectedGroup?.status === 'ACTIVE'
            ? 'Members keep read-only history, but sending and membership changes are blocked.'
            : 'Members will be able to send messages and manage membership again.'
        }
        confirmLabel={selectedGroup?.status === 'ACTIVE' ? 'Close group' : 'Reopen group'}
        reasonLabel="Mandatory reason"
        reason={reason}
        destructive={selectedGroup?.status === 'ACTIVE'}
        isSubmitting={moderationMutation.isPending}
        onReasonChange={setReason}
        onCancel={() => {
          setSelectedGroup(null)
          setReason('')
        }}
        onConfirm={() => void moderate()}
      />
    </section>
  )
}
