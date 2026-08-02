import { apiClient } from '@/shared/api/client'

import type { PrivacySettings, ProfileVisibility } from '../types/privacy.types'

type UnknownRecord = Record<string, unknown>

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function mapPrivacySettings(dto: UnknownRecord): PrivacySettings {
  const visibility = String(dto.profileVisibility ?? dto.profile_visibility ?? 'FRIENDS')
  const validVisibility: ProfileVisibility =
    visibility === 'EVERYONE' || visibility === 'NOBODY' ? visibility : 'FRIENDS'

  return {
    discoverable: booleanValue(dto.discoverable, true),
    allowFriendRequests: booleanValue(
      dto.allowFriendRequests ?? dto.allow_friend_requests,
      true,
    ),
    allowDirectMessages: booleanValue(
      dto.allowDirectMessages ?? dto.allow_direct_messages,
      true,
    ),
    sendReadReceipts: booleanValue(dto.sendReadReceipts ?? dto.send_read_receipts, true),
    showTypingIndicators: booleanValue(
      dto.showTypingIndicators ?? dto.show_typing_indicators,
      true,
    ),
    profileVisibility: validVisibility,
    showOnlineStatus: booleanValue(dto.showOnlineStatus ?? dto.show_online_status, true),
    showLastActive: booleanValue(dto.showLastActive ?? dto.show_last_active, true),
  }
}

export async function getPrivacySettings(): Promise<PrivacySettings> {
  const { data } = await apiClient.get<UnknownRecord>('/api/v1/privacy')
  return mapPrivacySettings(data)
}

export async function updatePrivacySettings(
  settings: PrivacySettings,
): Promise<PrivacySettings> {
  const { data } = await apiClient.put<UnknownRecord>('/api/v1/privacy', settings)
  return mapPrivacySettings(data)
}
