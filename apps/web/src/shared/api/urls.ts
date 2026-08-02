const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

export function getApiBaseUrl(): string {
  if (configuredApiBaseUrl) return configuredApiBaseUrl.replace(/\/$/, '')
  return window.location.origin
}

export function resolveApiUrl(path: string | null | undefined): string | null {
  if (!path) return null

  try {
    return new URL(path, `${getApiBaseUrl()}/`).toString()
  } catch {
    return path
  }
}

export function getWebSocketUrl(): string {
  const url = new URL('/ws', `${getApiBaseUrl()}/`)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.toString()
}
