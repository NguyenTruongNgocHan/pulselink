import { apiClient } from '@/shared/api/client'
import { resolveApiUrl } from '@/shared/api/urls'

import type {
  ConversationParticipant,
  ConversationSummary,
  Message,
  MessageAttachment,
  MessageReaction,
  MessageReceipt,
  SendMessageInput,
} from '../types/conversation.types'

type UnknownRecord = Record<string, unknown>

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : Number(value ?? fallback) || fallback
}

function booleanValue(value: unknown): boolean {
  return value === true
}

function mapParticipant(dto: UnknownRecord): ConversationParticipant {
  return {
    id: text(dto.id),
    username: text(dto.username),
    displayName: text(dto.displayName ?? dto.display_name, text(dto.username)),
    avatarUrl: (dto.avatarUrl ??
      dto.avatar_url ??
      dto.avatar_object_key ??
      null) as string | null,
    role: text(dto.role, 'MEMBER') === 'ADMIN' ? 'ADMIN' : 'MEMBER',
    isOnline: booleanValue(dto.isOnline ?? dto.online),
  }
}

function mapConversation(dto: UnknownRecord): ConversationSummary {
  const participants = Array.isArray(dto.participants)
    ? dto.participants.map((item) =>
        mapParticipant(item as UnknownRecord),
      )
    : []

  return {
    id: text(dto.id),
    type: text(dto.type) === 'GROUP' ? 'GROUP' : 'DIRECT',
    name: text(
      dto.name ?? dto.displayName ?? dto.display_name,
      'Conversation',
    ),
    avatarUrl: (dto.avatarUrl ??
      dto.avatar_url ??
      dto.avatar_object_key ??
      null) as string | null,
    status: text(dto.status) === 'CLOSED' ? 'CLOSED' : 'ACTIVE',
    preview: (dto.preview ??
      dto.latestMessage ??
      dto.latest_message ??
      null) as string | null,
    latestMessageAt: (dto.latestMessageAt ??
      dto.latest_message_at ??
      dto.updated_at ??
      null) as string | null,
    unreadCount: numberValue(dto.unreadCount ?? dto.unread_count),
    memberCount: numberValue(
      dto.memberCount ?? dto.member_count,
      participants.length,
    ),
    participants,
  }
}

function mapAttachment(dto: UnknownRecord): MessageAttachment {
  return {
    id: text(dto.id),
    fileName: text(dto.fileName ?? dto.file_name, 'attachment'),
    mimeType: text(
      dto.mimeType ?? dto.mime_type,
      'application/octet-stream',
    ),
    sizeBytes: numberValue(dto.sizeBytes ?? dto.size_bytes),
    downloadUrl:
      resolveApiUrl(
        text(
          dto.downloadUrl ??
            dto.download_url ??
            dto.url,
          `/api/v1/files/${text(dto.id)}`,
        ),
      ) ?? '',
  }
}

function mapReaction(dto: UnknownRecord): MessageReaction {
  return {
    emoji: text(dto.emoji),
    count: numberValue(dto.count, 1),
    reactedByMe: booleanValue(
      dto.reactedByMe ?? dto.reacted_by_me,
    ),
  }
}

function mapReceipt(dto: UnknownRecord): MessageReceipt {
  return {
    userId: text(dto.userId ?? dto.user_id),
    displayName: text(
      dto.displayName ?? dto.display_name,
      'Member',
    ),
    seenAt: text(dto.seenAt ?? dto.seen_at),
  }
}

export function mapMessage(dto: UnknownRecord): Message {
  return {
    id: text(dto.id),
    conversationId: text(
      dto.conversationId ?? dto.conversation_id,
    ),
    senderId: text(dto.senderId ?? dto.sender_id),
    senderName: text(
      dto.senderName ?? dto.sender_name,
      text(dto.username, 'Member'),
    ),
    senderUsername: text(
      dto.senderUsername ??
        dto.sender_username ??
        dto.username,
    ),
    senderAvatarUrl: (dto.senderAvatarUrl ??
      dto.sender_avatar_url ??
      null) as string | null,
    content: (dto.content ?? null) as string | null,
    createdAt: text(dto.createdAt ?? dto.created_at),
    editedAt: (dto.editedAt ??
      dto.edited_at ??
      null) as string | null,
    deletedAt: (dto.deletedAt ??
      dto.deleted_at ??
      null) as string | null,
    moderatedAt: (dto.moderatedAt ??
      dto.moderated_at ??
      null) as string | null,
    clientMessageId: (dto.clientMessageId ??
      dto.client_message_id ??
      null) as string | null,
    attachments: Array.isArray(dto.attachments)
      ? dto.attachments.map((item) =>
          mapAttachment(item as UnknownRecord),
        )
      : [],
    reactions: Array.isArray(dto.reactions)
      ? dto.reactions.map((item) =>
          mapReaction(item as UnknownRecord),
        )
      : [],
    receipts: Array.isArray(dto.receipts)
      ? dto.receipts.map((item) =>
          mapReceipt(item as UnknownRecord),
        )
      : [],
    savedByMe: booleanValue(
      dto.savedByMe ?? dto.saved_by_me,
    ),
  }
}

export async function getConversations(): Promise<
  ConversationSummary[]
> {
  const { data } = await apiClient.get<UnknownRecord[]>(
    '/api/v1/conversations',
  )

  return data.map(mapConversation)
}

export async function getConversation(
  conversationId: string,
): Promise<ConversationSummary> {
  const { data } = await apiClient.get<UnknownRecord>(
    `/api/v1/conversations/${conversationId}`,
  )

  return mapConversation(data)
}

export async function createDirectConversation(
  personId: string,
): Promise<ConversationSummary> {
  const { data } = await apiClient.post<UnknownRecord>(
    `/api/v1/conversations/direct/${personId}`,
  )

  return mapConversation(data)
}

export async function getMessages(
  conversationId: string,
): Promise<Message[]> {
  const { data } = await apiClient.get<UnknownRecord[]>(
    `/api/v1/conversations/${conversationId}/messages`,
  )

  return data.map(mapMessage)
}

export async function sendMessage(
  input: SendMessageInput,
): Promise<Message> {
  const { data } = await apiClient.post<UnknownRecord>(
    `/api/v1/conversations/${input.conversationId}/messages`,
    {
      content: input.content,
      clientMessageId: input.clientMessageId,
      attachmentIds: input.attachmentIds ?? [],
    },
  )

  return mapMessage(data)
}

export async function editMessage(
  messageId: string,
  content: string,
): Promise<Message> {
  const { data } = await apiClient.patch<UnknownRecord>(
    `/api/v1/messages/${messageId}`,
    {
      content,
    },
  )

  return mapMessage(data)
}

export async function deleteMessage(
  messageId: string,
): Promise<void> {
  await apiClient.delete(`/api/v1/messages/${messageId}`)
}

export async function reactToMessage(
  messageId: string,
  emoji: string,
): Promise<void> {
  await apiClient.put(`/api/v1/messages/${messageId}/reaction`, {
    emoji,
  })
}

export async function removeReaction(
  messageId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/v1/messages/${messageId}/reaction`,
  )
}

export async function markConversationRead(
  conversationId: string,
): Promise<void> {
  await apiClient.post(
    `/api/v1/conversations/${conversationId}/read`,
  )
}

export async function saveMessage(
  messageId: string,
): Promise<void> {
  await apiClient.post(`/api/v1/messages/${messageId}/save`)
}

export async function unsaveMessage(
  messageId: string,
): Promise<void> {
  await apiClient.delete(`/api/v1/messages/${messageId}/save`)
}

export async function uploadAttachment(
  file: File,
  conversationId: string,
  signal?: AbortSignal,
): Promise<MessageAttachment> {
  const formData = new FormData()

  formData.append('file', file)
  formData.append('conversationId', conversationId)

  const { data } = await apiClient.post<UnknownRecord>(
    '/api/v1/files',
    formData,
    {
      signal,
    },
  )

  return mapAttachment(data)
}

export async function fetchAttachmentBlob(
  attachment: MessageAttachment,
  signal?: AbortSignal,
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    attachment.downloadUrl,
    {
      responseType: 'blob',
      signal,
    },
  )

  return response.data
}

export async function downloadAttachment(
  attachment: MessageAttachment,
): Promise<void> {
  const blob = await fetchAttachmentBlob(attachment)
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = objectUrl
  anchor.download = attachment.fileName
  anchor.style.display = 'none'

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 1_000)
}

export async function previewAttachment(
  attachment: MessageAttachment,
): Promise<void> {
  const blob = await fetchAttachmentBlob(attachment)
  const objectUrl = URL.createObjectURL(blob)
  const previewWindow = window.open(
    objectUrl,
    '_blank',
    'noopener,noreferrer',
  )

  if (!previewWindow) {
    URL.revokeObjectURL(objectUrl)
    throw new Error('The browser blocked the preview window.')
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 60_000)
}