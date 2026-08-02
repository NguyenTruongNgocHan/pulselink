export type RelationshipStatus =
  | 'NONE'
  | 'PENDING_SENT'
  | 'PENDING_RECEIVED'
  | 'FRIEND'
  | 'BLOCKED'

export interface Person {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  isOnline: boolean
  relationshipStatus: RelationshipStatus
}

export interface FriendRequest {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  requestedAt: string
  direction: 'RECEIVED' | 'SENT'
}

export interface FriendRequestsResponse {
  received: FriendRequest[]
  sent: FriendRequest[]
}
