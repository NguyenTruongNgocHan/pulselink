import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/stores/authStore'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

export const apiClient = axios.create({
  baseURL,
  timeout: 20_000,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = useAuthStore.getState().accessToken

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  config.headers.set('X-Request-Id', crypto.randomUUID())
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setSession, clearSession } = useAuthStore.getState()
  if (!refreshToken) return null

  try {
    const response = await axios.post(`${baseURL}/api/v1/auth/refresh`, {
      refreshToken,
    })
    const nextSession = response.data
    setSession(nextSession)
    return nextSession.accessToken as string
  } catch {
    clearSession()
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined

    const isAuthEndpoint = originalRequest?.url?.includes('/api/v1/auth/') ?? false

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !isAuthEndpoint
    ) {
      originalRequest._retried = true
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })

      const accessToken = await refreshPromise
      if (accessToken) {
        originalRequest.headers.set('Authorization', `Bearer ${accessToken}`)
        return apiClient(originalRequest)
      }
    }

    return Promise.reject(error)
  },
)
