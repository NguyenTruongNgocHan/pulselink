export type ProfileVisibility = 'EVERYONE' | 'FRIENDS' | 'NOBODY'

export interface PrivacySettings {
  discoverable: boolean
  allowFriendRequests: boolean
  allowDirectMessages: boolean
  sendReadReceipts: boolean
  showTypingIndicators: boolean
  profileVisibility: ProfileVisibility
  showOnlineStatus: boolean
  showLastActive: boolean
}
