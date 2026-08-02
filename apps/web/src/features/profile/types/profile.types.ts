export interface ProfileMedia {
  id: string
  fileName: string
  mimeType: string
  url: string
}

export interface ProfileGroup {
  id: string
  name: string
}

export interface ProfileStats {
  messageCount: number
  groupCount: number
  connectionCount: number
  reportCount: number
}

export interface UserProfile {
  id: string
  username: string
  email: string
  displayName: string
  bio: string
  avatarUrl: string | null
  role: string
  status: string
  createdAt: string
  stats: ProfileStats
  recentMedia: ProfileMedia[]
  groups: ProfileGroup[]
}

export interface UpdateProfileInput {
  displayName: string
  bio: string
}

export interface SecuritySession {
  id: string
  deviceName: string
  browser: string
  operatingSystem: string
  ipAddress: string
  location: string | null
  current: boolean
  createdAt: string
  lastUsedAt: string
  expiresAt: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}
