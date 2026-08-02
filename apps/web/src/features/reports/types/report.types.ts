export type ReportTargetType = 'USER' | 'MESSAGE' | 'GROUP'
export type ReportStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED'

export interface UserReport {
  id: string
  targetType: ReportTargetType
  targetLabel: string
  reason: string
  description: string
  status: ReportStatus
  outcome: string | null
  resolutionSummary: string | null
  createdAt: string
  updatedAt: string
  clarifications: ReportClarification[]
}

export interface ReportClarification {
  id: string
  body: string
  createdAt: string
}

export interface CreateReportInput {
  targetType: ReportTargetType
  targetUserId?: string
  targetMessageId?: string
  targetConversationId?: string
  reason: string
  description?: string
}
