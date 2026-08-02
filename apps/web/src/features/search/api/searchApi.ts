import { apiClient } from '@/shared/api/client'

import type { MessageSearchResult } from '../types/search.types'

type UnknownRecord = Record<string, unknown>

function mapSearchResult(dto: UnknownRecord): MessageSearchResult {
  return {
    id: String(dto.id ?? ''),
    content: String(dto.content ?? ''),
    createdAt: String(dto.createdAt ?? dto.created_at ?? ''),
    editedAt: (dto.editedAt ?? dto.edited_at ?? null) as string | null,
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

export async function searchMessages(
  query: string,
  conversationId?: string,
): Promise<MessageSearchResult[]> {
  if (!query.trim()) return []

  const { data } = await apiClient.get<UnknownRecord[]>('/api/v1/message-search', {
    params: { q: query.trim(), conversationId },
  })
  return data.map(mapSearchResult)
}
