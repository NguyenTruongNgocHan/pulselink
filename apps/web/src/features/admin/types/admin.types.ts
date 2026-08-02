import type { Page } from '@/shared/types/api.types'

export type SystemRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN'
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DISABLED'
export type AdminReportStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED'

export type AdminUserAction =
  | 'suspend'
  | 'unsuspend'
  | 'ban'
  | 'unban'
  | 'force-logout'

export interface AdminUserActionState {
  action: AdminUserAction
  title: string
  description: string
  confirmLabel: string
  destructive: boolean
}

export type ModerationOutcome =
  | 'NO_ACTION'
  | 'WARNING_ISSUED'
  | 'CONTENT_REMOVED'
  | 'USER_SUSPENDED'
  | 'USER_BANNED'
  | 'GROUP_CLOSED'

export interface AdminDashboard {
  users: number
  activeUsers: number
  conversations: number
  messages: number
  openReports: number
  inReviewReports: number
  suspendedUsers: number
  bannedUsers: number
  recentActions: AuditLogEntry[]
  reportTrend: Array<{ date: string; count: number }>
}

export interface AdminUser {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl: string | null
  role: SystemRole
  status: AccountStatus
  suspendedUntil: string | null
  createdAt: string
}

export interface AdminUserDetails extends AdminUser {
  bio: string | null
  emailVerified: boolean
  reportCount: number
  sessionCount: number
  moderationHistory: AuditLogEntry[]
}

export interface AdminUserFilters {
  query: string
  role: SystemRole | ''
  status: AccountStatus | ''
  page: number
  size: number
}

export type AdminUsersPage = Page<AdminUser>

export interface AdminReport {
  id: string
  targetType: 'USER' | 'MESSAGE' | 'GROUP'
  targetLabel: string
  reason: string
  description: string
  status: AdminReportStatus
  outcome: string | null
  createdAt: string
  updatedAt: string
  reporterUsername: string
  assigneeId: string | null
  assigneeUsername: string | null
}

export interface AdminReportDetails extends AdminReport {
  reporterId: string
  targetUserId: string | null
  targetMessageId: string | null
  targetConversationId: string | null
  resolutionSummary: string | null
  evidenceAvailable: boolean
  comments: Array<{
    id: string
    authorUsername: string
    visibility: string
    body: string
    createdAt: string
  }>
}

export interface ReportEvidence {
  capturedAt: string
  targetType: string
  snapshot: Record<string, unknown>
  nearbyMessages: Array<{
    id: string
    author: string
    content: string | null
    createdAt: string
  }>
}

export interface AdminGroup {
  id: string
  name: string
  status: 'ACTIVE' | 'CLOSED'
  memberCount: number
  createdAt: string
  adminUsername: string | null
}

export interface AuditLogEntry {
  id: string
  action: string
  actorUsername: string
  actorRole: SystemRole
  targetType: string | null
  targetId: string | null
  reason: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface AdminListFilters {
  query: string
  status: string
  page: number
  size: number
}
