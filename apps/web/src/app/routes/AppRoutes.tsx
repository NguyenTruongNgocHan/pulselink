import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { AdminPortal } from '@/features/admin'
import { AdminRoute } from '@/features/auth/AdminRoute'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import {
  ConversationEmptyPage,
  ConversationHubPage,
  ConversationPage,
} from '@/features/conversations'
import { CreateGroupPage, GroupAdminPage, GroupDetailsPage } from '@/features/groups'
import { NotificationsPage } from '@/features/notifications'
import { FriendRequestsPage, PeoplePage } from '@/features/people'
import { PrivacyPage } from '@/features/privacy'
import { ProfilePage, SecurityPage } from '@/features/profile'
import { ReportsPage } from '@/features/reports'
import { SavedMessagesPage } from '@/features/saved-messages'
import { SearchMessagesPage } from '@/features/search'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { LandingPage } from '@/pages/landing/LandingPage'
import { routes } from '@/shared/constants/routes'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={routes.landing} element={<LandingPage />} />
      <Route path={routes.login} element={<LoginPage />} />
      <Route path={routes.register} element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path={routes.conversations} element={<ConversationHubPage />}>
          <Route index element={<ConversationEmptyPage />} />
          <Route path=":conversationId" element={<ConversationPage />} />
        </Route>
        <Route path={routes.people} element={<PeoplePage />} />
        <Route path={routes.friendRequests} element={<FriendRequestsPage />} />
        <Route path={routes.createGroup} element={<CreateGroupPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
        <Route path="/groups/:groupId/manage" element={<GroupAdminPage />} />
        <Route path={routes.search} element={<SearchMessagesPage />} />
        <Route path={routes.notifications} element={<NotificationsPage />} />
        <Route path={routes.reports} element={<ReportsPage />} />
        <Route path={routes.profile} element={<ProfilePage />} />
        <Route path={routes.privacy} element={<PrivacyPage />} />
        <Route path={routes.security} element={<SecurityPage />} />
        <Route path={routes.savedMessages} element={<SavedMessagesPage />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminPortal />
          </AdminRoute>
        }
      />

      <Route path="/app/*" element={<Navigate to={routes.conversations} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
