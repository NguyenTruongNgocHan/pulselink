import { Outlet } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { ThemeControl } from '@/theme'

import { AdminSidebar } from './AdminSidebar'

export function AdminLayout() {
  return (
    <div className="admin-layout-v2">
      <AdminSidebar />

      <main className="admin-main-v2">
        <header className="admin-topbar-v2">
          <div className="admin-topbar-v2__status">
            <span className="admin-live-dot-v2" />
            <span>
              <strong>Operations console</strong>
              <small>Secure staff workspace</small>
            </span>
          </div>

          <div className="admin-topbar-v2__actions">
            <span className="admin-topbar-v2__environment">
              <Icon name="shield" size={15} />
              Local
            </span>
            <ThemeControl compact />
          </div>
        </header>

        <div className="admin-content-shell-v2">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
