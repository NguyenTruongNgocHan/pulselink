import { apiClient } from '@/shared/api/client'

import type {
  CreateReportInput,
  ReportClarification,
  ReportStatus,
  ReportTargetType,
  UserReport,
} from '../types/report.types'

type UnknownRecord = Record<string, unknown>

function mapClarification(dto: UnknownRecord): ReportClarification {
  return {
    id: String(dto.id ?? ''),
    body: String(dto.body ?? ''),
    createdAt: String(dto.createdAt ?? dto.created_at ?? ''),
  }
}

function mapReport(dto: UnknownRecord): UserReport {
  const targetType = String(dto.targetType ?? dto.target_type ?? 'USER') as ReportTargetType
  const status = String(dto.status ?? 'OPEN') as ReportStatus
  const clarifications = Array.isArray(dto.clarifications)
    ? dto.clarifications.map((item) => mapClarification(item as UnknownRecord))
    : []

  return {
    id: String(dto.id ?? ''),
    targetType,
    targetLabel: String(
      dto.targetLabel ??
        dto.target_label ??
        (targetType === 'MESSAGE'
          ? 'Reported message'
          : targetType === 'GROUP'
            ? 'Reported group'
            : 'Reported user'),
    ),
    reason: String(dto.reason ?? ''),
    description: String(dto.description ?? ''),
    status,
    outcome: (dto.outcome ?? null) as string | null,
    resolutionSummary: (dto.resolutionSummary ?? dto.resolution_summary ?? null) as
      | string
      | null,
    createdAt: String(dto.createdAt ?? dto.created_at ?? ''),
    updatedAt: String(dto.updatedAt ?? dto.updated_at ?? ''),
    clarifications,
  }
}

export async function getMyReports(): Promise<UserReport[]> {
  const { data } = await apiClient.get<UnknownRecord[]>('/api/v1/my-reports')
  return data.map(mapReport)
}

export async function createReport(input: CreateReportInput): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/api/v1/reports', input)
  return data
}

export async function addReportClarification(reportId: string, body: string): Promise<void> {
  await apiClient.post(`/api/v1/reports/${reportId}/clarifications`, { body })
}
