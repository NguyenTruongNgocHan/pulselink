import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { AdminPagination } from '@/features/admin/components/AdminPagination'
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers'
import type {
  AccountStatus,
  AdminUserFilters,
  SystemRole,
} from '@/features/admin/types/admin.types'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { SearchInput } from '@/shared/components/form/SearchInput'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { getInitials } from '@/shared/utils/avatar'
import { formatDateTime } from '@/shared/utils/date'

const defaultFilters: AdminUserFilters = {
  query: '',
  role: '',
  status: '',
  page: 0,
  size: 20,
}

export function AdminUsersPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const usersQuery = useAdminUsers(filters)

  const updateFilter = <K extends keyof AdminUserFilters>(
    key: K,
    value: AdminUserFilters[K],
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
        eyebrow="Account operations"
        title="User directory"
        description="Search accounts, review their safe profile, and perform authorized lifecycle actions."
      />

      <div className="admin-filter-bar">
        <SearchInput
          label="Search users"
          value={filters.query}
          onChange={(event) => updateFilter('query', event.target.value)}
          onClear={() => updateFilter('query', '')}
          placeholder="Search name, username, or email"
        />
        <select
          value={filters.role}
          onChange={(event) => updateFilter('role', event.target.value as SystemRole | '')}
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          <option value="USER">User</option>
          <option value="MODERATOR">Moderator</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super admin</option>
        </select>
        <select
          value={filters.status}
          onChange={(event) =>
            updateFilter('status', event.target.value as AccountStatus | '')
          }
          aria-label="Filter by account status"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </div>

      {usersQuery.error ? (
        <InlineAlert tone="danger">{getApiErrorMessage(usersQuery.error)}</InlineAlert>
      ) : null}
      {usersQuery.isLoading ? <LoadingState rows={8} label="Loading users" /> : null}

      {usersQuery.data?.items.length === 0 ? (
        <EmptyState
          icon="users"
          title="No matching users"
          description="Change the search term or filters to broaden the directory."
        />
      ) : null}

      {usersQuery.data && usersQuery.data.items.length > 0 ? (
        <section className="admin-table-card">
          <div className="admin-table admin-users-table">
            <div className="admin-table__row admin-table__head">
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
              <span>Created</span>
              <span aria-label="Actions" />
            </div>
            {usersQuery.data.items.map((user) => (
              <button
                type="button"
                className="admin-table__row"
                key={user.id}
                onClick={() => navigate(`/admin/users/${user.id}`)}
              >
                <span className="admin-user-cell">
                  <Avatar initials={getInitials(user.displayName)} tone="violet" size="sm" />
                  <span>
                    <b>{user.displayName}</b>
                    <small>
                      @{user.username} · {user.email}
                    </small>
                  </span>
                </span>
                <span>
                  <i className={`role-pill role-${user.role.toLowerCase()}`}>
                    {user.role.replace('_', ' ')}
                  </i>
                </span>
                <span>
                  <i className={`status-pill status-${user.status.toLowerCase()}`}>
                    {user.status}
                  </i>
                </span>
                <span>{formatDateTime(user.createdAt)}</span>
                <span>
                  <Icon name="chevron" size={17} />
                </span>
              </button>
            ))}
          </div>
          <AdminPagination
            page={usersQuery.data.page}
            totalPages={usersQuery.data.totalPages}
            onPageChange={(page) => updateFilter('page', page)}
          />
        </section>
      ) : null}
    </section>
  )
}
