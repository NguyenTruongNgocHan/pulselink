import { apiClient } from '../../../shared/api/client'
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '../types'

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>('/api/v1/auth/register', payload)
  return data
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>('/api/v1/auth/login', payload)
  return data
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.delete('/api/v1/auth/logout', { data: { refreshToken } })
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/api/v1/auth/me')
  return data
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const { data } = await apiClient.patch<AuthUser>('/api/v1/auth/me', payload)
  return data
}
