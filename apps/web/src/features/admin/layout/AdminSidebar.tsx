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
  icon: IconName
  end?: boolean
}

const navigation: AdminNavigationItem[] = [
  { to: routes.admin, label: 'Overview', icon: 'home', end: true },
  { to: routes.adminUsers, label: 'Users', icon: 'users' },
  { to: routes.adminReports, label: 'Reports', icon: 'flag' },
  { to: routes.adminGroups, label: 'Groups', icon: 'group' },
  { to: routes.adminAudit, label: 'Audit log', icon: 'shield' },
]

export function AdminSidebar() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  return (
    <aside className="admin-sidebar">
      <div>
        <Brand />
        <span className="admin-sidebar__label">Administration</span>

        <nav aria-label="Administration navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="admin-sidebar__footer">
        <button type="button" onClick={() => navigate(routes.conversations)}>
          <Icon name="arrowLeft" size={17} />
          Back to PulseLink
        </button>
        <div>
          <Avatar initials={getInitials(user?.displayName)} tone="violet" size="sm" />
          <span>
            <b>{user?.displayName}</b>
            <small>{user?.role.replace('_', ' ')}</small>
          </span>
        </div>
      </div>
    </aside>
  )
}
