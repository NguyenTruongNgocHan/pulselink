import { NavLink, useNavigate } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { Brand } from '@/components/ui/Brand'
import { Icon, type IconName } from '@/components/ui/Icon'
import { routes } from '@/shared/constants/routes'
import { getInitials } from '@/shared/utils/avatar'
import { useAuthStore } from '@/stores/authStore'

interface AdminNavigationItem {
  to: string
  label: string
  description: string
  icon: IconName
  end?: boolean
}

const navigation: AdminNavigationItem[] = [
  {
    to: routes.admin,
    label: 'Overview',
    description: 'System health',
    icon: 'home',
    end: true,
  },
  {
    to: routes.adminUsers,
    label: 'Users',
    description: 'Account operations',
    icon: 'users',
  },
  {
    to: routes.adminReports,
    label: 'Reports',
    description: 'Moderation queue',
    icon: 'flag',
  },
  {
    to: routes.adminGroups,
    label: 'Groups',
    description: 'Community controls',
    icon: 'group',
  },
  {
    to: routes.adminAudit,
    label: 'Audit log',
    description: 'Immutable history',
    icon: 'shield',
  },
]

export function AdminSidebar() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  return (
    <aside className="admin-sidebar-v2">
      <div className="admin-sidebar-v2__main">
        <div className="admin-sidebar-v2__brand">
          <Brand />
          <span>Administration</span>
        </div>

        <nav
          className="admin-sidebar-v2__nav"
          aria-label="Administration navigation"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'admin-nav-v2 active' : 'admin-nav-v2'
              }
            >
              <span className="admin-nav-v2__icon">
                <Icon name={item.icon} size={18} />
              </span>

              <span className="admin-nav-v2__copy">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>

              <Icon name="chevron" size={14} />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="admin-sidebar-v2__footer">
        <button
          type="button"
          className="admin-sidebar-v2__back"
          onClick={() => navigate(routes.conversations)}
        >
          <Icon name="arrowLeft" size={16} />
          Back to PulseLink
        </button>

        <div className="admin-sidebar-v2__user">
          <Avatar
            initials={getInitials(user?.displayName)}
            src={user?.avatarUrl}
            alt={user?.displayName ? `${user.displayName}'s avatar` : ''}
            tone="violet"
            size="sm"
          />

          <span>
            <strong>{user?.displayName ?? user?.username ?? 'Staff user'}</strong>
            <small>{user?.role.replaceAll('_', ' ') ?? 'STAFF'}</small>
          </span>

          <span className="admin-sidebar-v2__verified">
            <Icon name="shield" size={13} />
          </span>
        </div>
      </div>
    </aside>
  )
}
