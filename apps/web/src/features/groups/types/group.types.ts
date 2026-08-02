import type { ConversationParticipant, ConversationStatus } from '@/features/conversations/types/conversation.types'

export interface GroupDetails {
  id: string
  name: string
  avatarUrl: string | null
  status: ConversationStatus
  createdAt: string
  createdBy: string
  members: ConversationParticipant[]
  currentUserRole: 'ADMIN' | 'MEMBER'
}

export interface CreateGroupInput {
  name: string
  memberIds: string[]
}
