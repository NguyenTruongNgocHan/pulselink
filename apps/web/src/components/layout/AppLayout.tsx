import { Outlet } from 'react-router-dom'

import { useNotificationRealtime } from '@/features/notifications/hooks/useNotificationRealtime'

import { AppSidebar } from './AppSidebar'

export function AppLayout() {
  useNotificationRealtime()

  return (
    <div className="app-layout">
      <AppSidebar />
      <Outlet />
    </div>
  )
}
