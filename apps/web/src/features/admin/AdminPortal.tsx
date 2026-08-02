import { Navigate, Route, Routes } from 'react-router-dom'

import { AdminLayout } from '@/features/admin/layout/AdminLayout'
import { AdminAuditPage } from '@/features/admin/pages/AdminAuditPage'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AdminGroupsPage } from '@/features/admin/pages/AdminGroupsPage'
import { AdminNotFoundPage } from '@/features/admin/pages/AdminNotFoundPage'
import { AdminReportDetailsPage } from '@/features/admin/pages/AdminReportDetailsPage'
import { AdminReportsPage } from '@/features/admin/pages/AdminReportsPage'
import { AdminUserDetailsPage } from '@/features/admin/pages/AdminUserDetailsPage'
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage'

import './admin.css'

export function AdminPortal() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:userId" element={<AdminUserDetailsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="reports/:reportId" element={<AdminReportDetailsPage />} />
        <Route path="groups" element={<AdminGroupsPage />} />
        <Route path="audit" element={<AdminAuditPage />} />
        <Route
          path="forbidden"
          element={<Navigate to="/conversations" replace />}
        />
        <Route path="*" element={<AdminNotFoundPage />} />
      </Route>
    </Routes>
  )
}
