import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { routes } from '@/shared/constants/routes'
import { useAuthStore } from '@/stores/authStore'

const staffRoles = new Set(['MODERATOR', 'ADMIN', 'SUPER_ADMIN'])

interface AdminRouteProps {
  children: ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to={routes.login} replace state={{ from: location.pathname }} />
  }

  if (!staffRoles.has(user.role)) {
    return <Navigate to={routes.conversations} replace />
  }

  return children
}
