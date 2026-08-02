export type ConversationType = 'DIRECT' | 'GROUP'
export type ConversationStatus = 'ACTIVE' | 'CLOSED'

export interface ConversationParticipant {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  role: 'ADMIN' | 'MEMBER'
  isOnline: boolean
}

export interface ConversationSummary {
  id: string
  type: ConversationType
  name: string
  avatarUrl: string | null
  status: ConversationStatus
  preview: string | null
  latestMessageAt: string | null
  unreadCount: number
  memberCount: number
  participants: ConversationParticipant[]
}

export interface MessageAttachment {
  id: string
  fileName: string
  mimeType: string
  sizeBytes: number
  downloadUrl: string
}

export interface MessageReaction {
  emoji: string
  count: number
  reactedByMe: boolean
}

export interface MessageReceipt {
  userId: string
  displayName: string
  seenAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderUsername: string
  senderAvatarUrl: string | null
  content: string | null
  createdAt: string
  editedAt: string | null
  deletedAt: string | null
  moderatedAt: string | null
  clientMessageId: string | null
  attachments: MessageAttachment[]
  reactions: MessageReaction[]
  receipts: MessageReceipt[]
  savedByMe: boolean
}

export interface SendMessageInput {
  conversationId: string
  content: string
  clientMessageId: string
  attachmentIds?: string[]
}

export interface TypingEvent {
  type: 'TYPING'
  conversationId: string
  userId: string
  displayName: string
  typing: boolean
}

export interface MessageEvent {
  type: 'MESSAGE_CREATED' | 'MESSAGE_UPDATED' | 'MESSAGE_DELETED' | 'REACTION_UPDATED' | 'READ_UPDATED'
  conversationId: string
  message: Message
}

export type ConversationRealtimeEvent = MessageEvent | TypingEvent
