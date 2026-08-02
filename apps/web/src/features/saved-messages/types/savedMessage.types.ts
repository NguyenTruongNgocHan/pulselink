export interface SavedMessage {
  id: string
  content: string | null
  createdAt: string
  senderName: string
  senderUsername: string
  conversationId: string
  conversationName: string
  conversationType: 'DIRECT' | 'GROUP'
}
