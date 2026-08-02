import { Outlet } from 'react-router-dom'

import { ThemeControl } from '@/theme'

import { AdminSidebar } from './AdminSidebar'

export function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-live-dot" />
            Local operations console
          </div>
          <ThemeControl />
        </header>
        <div className="admin-content-shell">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
