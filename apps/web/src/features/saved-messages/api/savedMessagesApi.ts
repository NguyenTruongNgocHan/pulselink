import { apiClient } from '@/shared/api/client'

import type { SavedMessage } from '../types/savedMessage.types'

type UnknownRecord = Record<string, unknown>

function mapSavedMessage(dto: UnknownRecord): SavedMessage {
  return {
    id: String(dto.id ?? ''),
    content: (dto.content ?? null) as string | null,
    createdAt: String(dto.createdAt ?? dto.created_at ?? ''),
    senderName: String(dto.senderName ?? dto.sender_name ?? dto.username ?? 'Member'),
    senderUsername: String(dto.senderUsername ?? dto.sender_username ?? dto.username ?? ''),
    conversationId: String(dto.conversationId ?? dto.conversation_id ?? ''),
    conversationName: String(
      dto.conversationName ?? dto.conversation_name ?? 'Conversation',
    ),
    conversationType:
      String(dto.conversationType ?? dto.conversation_type ?? dto.type) === 'GROUP'
        ? 'GROUP'
        : 'DIRECT',
  }
}

export async function getSavedMessages(): Promise<SavedMessage[]> {
  const { data } = await apiClient.get<UnknownRecord[]>('/api/v1/saved-messages')
  return data.map(mapSavedMessage)
}

export async function removeSavedMessage(messageId: string): Promise<void> {
  await apiClient.delete(`/api/v1/messages/${messageId}/save`)
}
