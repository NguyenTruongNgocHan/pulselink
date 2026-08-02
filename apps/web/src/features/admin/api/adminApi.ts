import { apiClient } from '@/shared/api/client'
import type { Page } from '@/shared/types/api.types'

import type {
  AccountStatus,
  AdminDashboard,
  AdminGroup,
  AdminListFilters,
  AdminReport,
  AdminReportDetails,
  AdminUser,
  AdminUserDetails,
  AdminUserFilters,
  AuditLogEntry,
  ReportEvidence,
  SystemRole,
} from '../types/admin.types'

type UnknownRecord = Record<string, unknown>

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function numberValue(value: unknown): number {
  return typeof value === 'number' ? value : Number(value ?? 0) || 0
}

function mapAudit(dto: UnknownRecord): AuditLogEntry {
  const metadata = dto.metadata ?? dto.metadataJson ?? dto.metadata_jsonb
  return {
    id: stringValue(dto.id),
    action: stringValue(dto.action),
    actorUsername: stringValue(dto.actorUsername ?? dto.actor_username ?? dto.actor, 'system'),
    actorRole: stringValue(dto.actorRole ?? dto.actor_role, 'USER') as SystemRole,
    targetType: nullableString(dto.targetType ?? dto.target_type),
    targetId: nullableString(dto.targetId ?? dto.target_id),
    reason: nullableString(dto.reason),
    metadata:
      typeof metadata === 'object' && metadata !== null
        ? (metadata as Record<string, unknown>)
        : {},
    createdAt: stringValue(dto.createdAt ?? dto.created_at),
  }
}

function mapUser(dto: UnknownRecord): AdminUser {
  return {
    id: stringValue(dto.id),
    username: stringValue(dto.username),
    email: stringValue(dto.email),
    displayName: stringValue(dto.displayName ?? dto.display_name, stringValue(dto.username)),
    avatarUrl: nullableString(dto.avatarUrl ?? dto.avatar_url ?? dto.avatar_object_key),
    role: stringValue(dto.role, 'USER') as SystemRole,
    status: stringValue(dto.status, 'ACTIVE') as AccountStatus,
    suspendedUntil: nullableString(dto.suspendedUntil ?? dto.suspended_until),
    createdAt: stringValue(dto.createdAt ?? dto.created_at),
  }
}

function mapReport(dto: UnknownRecord): AdminReport {
  return {
    id: stringValue(dto.id),
    targetType: stringValue(dto.targetType ?? dto.target_type, 'USER') as AdminReport['targetType'],
    targetLabel: stringValue(dto.targetLabel ?? dto.target_label, 'Reported target'),
    reason: stringValue(dto.reason),
    description: stringValue(dto.description),
    status: stringValue(dto.status, 'OPEN') as AdminReport['status'],
    outcome: nullableString(dto.outcome),
    createdAt: stringValue(dto.createdAt ?? dto.created_at),
    updatedAt: stringValue(dto.updatedAt ?? dto.updated_at ?? dto.createdAt ?? dto.created_at),
    reporterUsername: stringValue(dto.reporterUsername ?? dto.reporter_username ?? dto.reporter),
    assigneeId: nullableString(dto.assigneeId ?? dto.assignee_id),
    assigneeUsername: nullableString(dto.assigneeUsername ?? dto.assignee_username),
  }
}

function mapGroup(dto: UnknownRecord): AdminGroup {
  return {
    id: stringValue(dto.id),
    name: stringValue(dto.name, 'Untitled group'),
    status: stringValue(dto.status) === 'CLOSED' ? 'CLOSED' : 'ACTIVE',
    memberCount: numberValue(dto.memberCount ?? dto.member_count ?? dto.members),
    createdAt: stringValue(dto.createdAt ?? dto.created_at),
    adminUsername: nullableString(dto.adminUsername ?? dto.admin_username),
  }
}

function mapPage<T>(
  data: UnknownRecord[] | UnknownRecord,
  mapper: (item: UnknownRecord) => T,
  fallbackPage: number,
  fallbackSize: number,
): Page<T> {
  if (Array.isArray(data)) {
    return {
      items: data.map(mapper),
      page: fallbackPage,
      size: fallbackSize,
      totalItems: data.length,
      totalPages: data.length > 0 ? 1 : 0,
    }
  }

  const items = Array.isArray(data.items) ? data.items : []
  return {
    items: items.map((item) => mapper(item as UnknownRecord)),
    page: numberValue(data.page),
    size: numberValue(data.size) || fallbackSize,
    totalItems: numberValue(data.totalItems ?? data.total_items),
    totalPages: numberValue(data.totalPages ?? data.total_pages),
  }
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const { data } = await apiClient.get<UnknownRecord>('/api/v1/admin/dashboard')
  const actions = Array.isArray(data.recentActions) ? data.recentActions : []
  const trend = Array.isArray(data.reportTrend) ? data.reportTrend : []

  return {
    users: numberValue(data.users),
    activeUsers: numberValue(data.activeUsers ?? data.active_users),
    conversations: numberValue(data.conversations),
    messages: numberValue(data.messages),
    openReports: numberValue(data.openReports ?? data.open_reports),
    inReviewReports: numberValue(data.inReviewReports ?? data.in_review_reports),
    suspendedUsers: numberValue(data.suspendedUsers ?? data.suspended_users),
    bannedUsers: numberValue(data.bannedUsers ?? data.banned_users),
    recentActions: actions.map((item) => mapAudit(item as UnknownRecord)),
    reportTrend: trend.map((item) => {
      const point = item as UnknownRecord
      return { date: stringValue(point.date), count: numberValue(point.count) }
    }),
  }
}

export async function getAdminUsers(filters: AdminUserFilters): Promise<Page<AdminUser>> {
  const { data } = await apiClient.get<UnknownRecord[] | UnknownRecord>('/api/v1/admin/users', {
    params: {
      q: filters.query,
      role: filters.role,
      status: filters.status,
      page: filters.page,
      size: filters.size,
    },
  })
  return mapPage(data, mapUser, filters.page, filters.size)
}

export async function getAdminUser(userId: string): Promise<AdminUserDetails> {
  const { data } = await apiClient.get<UnknownRecord>(`/api/v1/admin/users/${userId}`)
  const history = Array.isArray(data.moderationHistory)
    ? data.moderationHistory
    : Array.isArray(data.moderation_history)
      ? data.moderation_history
      : []

  return {
    ...mapUser(data),
    bio: nullableString(data.bio),
    emailVerified: data.emailVerified === true || data.email_verified === true,
    reportCount: numberValue(data.reportCount ?? data.report_count),
    sessionCount: numberValue(data.sessionCount ?? data.session_count),
    moderationHistory: history.map((item) => mapAudit(item as UnknownRecord)),
  }
}

export async function performUserAction(
  userId: string,
  action: 'suspend' | 'unsuspend' | 'ban' | 'unban' | 'force-logout',
  input: { reason: string; until?: string },
): Promise<void> {
  await apiClient.post(`/api/v1/admin/users/${userId}/${action}`, input)
}

export async function updateUserRole(
  userId: string,
  role: SystemRole,
  reason: string,
): Promise<void> {
  await apiClient.put(`/api/v1/admin/users/${userId}/role`, { role, reason })
}

export async function getAdminReports(filters: AdminListFilters): Promise<Page<AdminReport>> {
  const { data } = await apiClient.get<UnknownRecord[] | UnknownRecord>('/api/v1/admin/reports', {
    params: {
      q: filters.query,
      status: filters.status,
      page: filters.page,
      size: filters.size,
    },
  })
  return mapPage(data, mapReport, filters.page, filters.size)
}

export async function getAdminReport(reportId: string): Promise<AdminReportDetails> {
  const { data } = await apiClient.get<UnknownRecord>(`/api/v1/admin/reports/${reportId}`)
  const comments = Array.isArray(data.comments) ? data.comments : []
  return {
    ...mapReport(data),
    reporterId: stringValue(data.reporterId ?? data.reporter_id),
    targetUserId: nullableString(data.targetUserId ?? data.target_user_id),
    targetMessageId: nullableString(data.targetMessageId ?? data.target_message_id),
    targetConversationId: nullableString(
      data.targetConversationId ?? data.target_conversation_id,
    ),
    resolutionSummary: nullableString(data.resolutionSummary ?? data.resolution_summary),
    evidenceAvailable: data.evidenceAvailable === true || data.evidence_available === true,
    comments: comments.map((item) => {
      const comment = item as UnknownRecord
      return {
        id: stringValue(comment.id),
        authorUsername: stringValue(
          comment.authorUsername ?? comment.author_username,
          'user',
        ),
        visibility: stringValue(comment.visibility),
        body: stringValue(comment.body),
        createdAt: stringValue(comment.createdAt ?? comment.created_at),
      }
    }),
  }
}

export async function claimAdminReport(reportId: string): Promise<void> {
  await apiClient.post(`/api/v1/admin/reports/${reportId}/claim`)
}

export async function getReportEvidence(reportId: string): Promise<ReportEvidence> {
  const { data } = await apiClient.get<UnknownRecord>(
    `/api/v1/admin/reports/${reportId}/evidence`,
  )
  const snapshot = data.snapshot ?? data.evidence
  const nearby = Array.isArray(data.nearbyMessages) ? data.nearbyMessages : []

  return {
    capturedAt: stringValue(data.capturedAt ?? data.captured_at),
    targetType: stringValue(data.targetType ?? data.target_type),
    snapshot:
      typeof snapshot === 'object' && snapshot !== null
        ? (snapshot as Record<string, unknown>)
        : { raw: snapshot },
    nearbyMessages: nearby.map((item) => {
      const message = item as UnknownRecord
      return {
        id: stringValue(message.id),
        author: stringValue(message.author),
        content: nullableString(message.content),
        createdAt: stringValue(message.createdAt ?? message.created_at),
      }
    }),
  }
}

export async function resolveAdminReport(
  reportId: string,
  outcome: string,
  reason: string,
): Promise<void> {
  await apiClient.post(`/api/v1/admin/reports/${reportId}/resolve`, { outcome, reason })
}

export async function rejectAdminReport(reportId: string, reason: string): Promise<void> {
  await apiClient.post(`/api/v1/admin/reports/${reportId}/reject`, { reason })
}

export async function getAdminGroups(filters: AdminListFilters): Promise<Page<AdminGroup>> {
  const { data } = await apiClient.get<UnknownRecord[] | UnknownRecord>('/api/v1/admin/groups', {
    params: {
      q: filters.query,
      status: filters.status,
      page: filters.page,
      size: filters.size,
    },
  })
  return mapPage(data, mapGroup, filters.page, filters.size)
}

export async function moderateGroup(
  groupId: string,
  action: 'close' | 'reopen',
  reason: string,
): Promise<void> {
  await apiClient.post(`/api/v1/admin/groups/${groupId}/${action}`, { reason })
}

export async function getAuditLog(filters: AdminListFilters): Promise<Page<AuditLogEntry>> {
  const { data } = await apiClient.get<UnknownRecord[] | UnknownRecord>(
    '/api/v1/admin/audit-logs',
    {
      params: {
        q: filters.query,
        action: filters.status,
        page: filters.page,
        size: filters.size,
      },
    },
  )
  return mapPage(data, mapAudit, filters.page, filters.size)
}
