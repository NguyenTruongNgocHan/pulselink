export interface AuthUser {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl: string | null
  role: string
  status: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  accessTokenExpiresInSeconds: number
  user: AuthUser
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  displayName?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateProfilePayload {
  displayName?: string
}

export interface ApiErrorBody {
  code: string
  message: string
  timestamp: string
  fieldErrors?: Record<string, string>
}
