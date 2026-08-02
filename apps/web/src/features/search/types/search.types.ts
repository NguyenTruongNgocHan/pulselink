export interface MessageSearchResult {
  id: string
  content: string
  createdAt: string
  editedAt: string | null
  senderName: string
  senderUsername: string
  conversationId: string
  conversationName: string
  conversationType: 'DIRECT' | 'GROUP'
}
