import { apiClient } from '@/shared/api/client'
import { resolveApiUrl } from '@/shared/api/urls'

import type {
  ChangePasswordInput,
  SecuritySession,
  UpdateProfileInput,
  UserProfile,
} from '../types/profile.types'

type UnknownRecord = Record<string, unknown>

function value(dto: UnknownRecord, camelCase: string, snakeCase: string): unknown {
  return dto[camelCase] ?? dto[snakeCase]
}

function numberValue(input: unknown): number {
  return typeof input === 'number' ? input : Number(input ?? 0) || 0
}

function mapProfile(dto: UnknownRecord): UserProfile {
  const stats = (dto.stats ?? {}) as UnknownRecord
  const recentMediaSource = Array.isArray(dto.recentMedia)
    ? dto.recentMedia
    : Array.isArray(dto.recent_media)
      ? dto.recent_media
      : []
  const groupsSource = Array.isArray(dto.groups) ? dto.groups : []

  return {
    id: String(dto.id ?? ''),
    username: String(dto.username ?? ''),
    email: String(dto.email ?? ''),
    displayName: String(value(dto, 'displayName', 'display_name') ?? dto.username ?? ''),
    bio: String(dto.bio ?? ''),
    avatarUrl: resolveApiUrl(
      (value(dto, 'avatarUrl', 'avatar_object_key') ?? null) as string | null,
    ),
    role: String(dto.role ?? 'USER'),
    status: String(dto.status ?? 'ACTIVE'),
    createdAt: String(value(dto, 'createdAt', 'created_at') ?? ''),
    stats: {
      messageCount: numberValue(
        stats.messageCount ?? value(dto, 'messageCount', 'message_count'),
      ),
      groupCount: numberValue(stats.groupCount ?? value(dto, 'groupCount', 'group_count')),
      connectionCount: numberValue(
        stats.connectionCount ?? value(dto, 'connectionCount', 'connection_count'),
      ),
      reportCount: numberValue(stats.reportCount ?? value(dto, 'reportCount', 'report_count')),
    },
    recentMedia: recentMediaSource.map((item) => {
      const media = item as UnknownRecord
      return {
        id: String(media.id ?? ''),
        fileName: String(value(media, 'fileName', 'file_name') ?? 'attachment'),
        mimeType: String(value(media, 'mimeType', 'mime_type') ?? 'application/octet-stream'),
        url:
          resolveApiUrl(String(media.url ?? `/api/v1/files/${String(media.id ?? '')}`)) ?? '',
      }
    }),
    groups: groupsSource.map((item) => {
      const group = item as UnknownRecord
      return { id: String(group.id ?? ''), name: String(group.name ?? 'Group') }
    }),
  }
}

function mapSession(dto: UnknownRecord): SecuritySession {
  return {
    id: String(dto.id ?? ''),
    deviceName: String(value(dto, 'deviceName', 'device_name') ?? 'Unknown device'),
    browser: String(dto.browser ?? 'Unknown browser'),
    operatingSystem: String(
      value(dto, 'operatingSystem', 'operating_system') ?? 'Unknown operating system',
    ),
    ipAddress: String(value(dto, 'ipAddress', 'ip_address') ?? 'Unknown'),
    location: (dto.location ?? null) as string | null,
    current: dto.current === true,
    createdAt: String(value(dto, 'createdAt', 'created_at') ?? ''),
    lastUsedAt: String(value(dto, 'lastUsedAt', 'last_used_at') ?? ''),
    expiresAt: String(value(dto, 'expiresAt', 'expires_at') ?? ''),
  }
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<UnknownRecord>('/api/v1/profile')
  return mapProfile(data)
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const { data } = await apiClient.put<UnknownRecord>('/api/v1/profile', input)
  return mapProfile(data)
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<{ avatarUrl: string }>('/api/v1/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getSecuritySessions(): Promise<SecuritySession[]> {
  const { data } = await apiClient.get<UnknownRecord[]>('/api/v1/security/sessions')
  return data.map(mapSession)
}

export async function revokeSecuritySession(sessionId: string): Promise<void> {
  await apiClient.delete(`/api/v1/security/sessions/${sessionId}`)
}

export async function revokeOtherSessions(): Promise<void> {
  await apiClient.delete('/api/v1/security/sessions')
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiClient.put('/api/v1/security/password', input)
}

export async function deactivateAccount(reason: string): Promise<void> {
  await apiClient.post('/api/v1/security/deactivate', { reason })
}
