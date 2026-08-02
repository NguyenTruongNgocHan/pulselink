import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { logout } from '@/features/auth/api/authApi'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { routes } from '@/shared/constants/routes'
import { getInitials } from '@/shared/utils/avatar'
import { useAuthStore } from '@/stores/authStore'
import { ThemeControl } from '@/theme'

import { Avatar } from '../ui/Avatar'
import { Brand } from '../ui/Brand'
import { Icon, type IconName } from '../ui/Icon'

interface NavigationItem {
  to: string
  label: string
  icon: IconName
  badge?: number
}

export function AppSidebar() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const clearSession = useAuthStore((state) => state.clearSession)
  const notificationsQuery = useNotifications(false).notificationsQuery
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  const primaryNavigation: NavigationItem[] = [
    { to: routes.conversations, label: 'Conversations', icon: 'chat' },
    { to: routes.people, label: 'People', icon: 'users' },
    { to: routes.search, label: 'Search', icon: 'search' },
    {
      to: routes.notifications,
      label: 'Notifications',
      icon: 'bell',
      badge: notificationsQuery.data?.unreadCount,
    },
    { to: routes.profile, label: 'Profile', icon: 'user' },
  ]

  const secondaryNavigation: NavigationItem[] = [
    { to: routes.savedMessages, label: 'Saved messages', icon: 'bookmark' },
    { to: routes.reports, label: 'My reports', icon: 'flag' },
    { to: routes.privacy, label: 'Privacy', icon: 'shield' },
  ]

  const isStaff = new Set(['MODERATOR', 'ADMIN', 'SUPER_ADMIN']).has(user?.role ?? '')

  const signOut = async () => {
    try {
      if (refreshToken) await logout(refreshToken)
    } finally {
      clearSession()
      navigate(routes.login, { replace: true })
    }
  }

  const renderNavigation = (items: NavigationItem[]) =>
    items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) => (isActive ? 'active' : undefined)}
      >
        <Icon name={item.icon} />
        <span>{item.label}</span>
        {item.badge ? <em>{item.badge > 99 ? '99+' : item.badge}</em> : null}
      </NavLink>
    ))

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__main">
        <div className="app-sidebar__brand-row">
          <Brand />
          <ThemeControl compact />
        </div>

        <nav aria-label="Main navigation">{renderNavigation(primaryNavigation)}</nav>

        <div className="sidebar-divider" />
        <nav aria-label="Account tools">{renderNavigation(secondaryNavigation)}</nav>

        {isStaff ? (
          <div className="sidebar-staff-card">
            <span>
              <Icon name="shield" size={18} />
            </span>
            <div>
              <b>Staff workspace</b>
              <small>{user?.role.replace('_', ' ')}</small>
            </div>
            <button type="button" onClick={() => navigate(routes.admin)} aria-label="Open admin portal">
              <Icon name="chevron" size={16} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="sidebar-user">
        <span className="connection">
          <i />
          Connected · Realtime
        </span>

        <button
          type="button"
          className="sidebar-user__button"
          onClick={() => setAccountMenuOpen((current) => !current)}
          aria-expanded={accountMenuOpen}
        >
          <Avatar
            initials={getInitials(user?.displayName)}
            src={user?.avatarUrl}
            alt={user?.displayName ? `${user.displayName}'s avatar` : ''}
            tone="green"
            size="sm"
          />
          <span>
            <b>{user?.displayName ?? user?.username ?? 'PulseLink user'}</b>
            <small>@{user?.username ?? 'user'}</small>
          </span>
          <Icon name="chevron" size={14} />
        </button>

        {accountMenuOpen ? (
          <div className="sidebar-account-menu">
            <button type="button" onClick={() => navigate(routes.security)}>
              <Icon name="lock" size={17} />
              Security &amp; devices
            </button>
            <button type="button" onClick={() => void signOut()}>
              <Icon name="logout" size={17} />
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
