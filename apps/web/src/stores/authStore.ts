import { useSyncExternalStore } from 'react'

import type { AuthSession, AuthUser } from '@/features/auth/types'
import { resolveApiUrl } from '@/shared/api/urls'

type AuthUserPatch = Partial<
  Pick<AuthUser, 'displayName' | 'avatarUrl' | 'role' | 'status'>
>

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  setSession: (session: AuthSession) => void
  updateUser: (patch: AuthUserPatch) => void
  clearSession: () => void
}

type StateUpdater =
  | Partial<AuthState>
  | ((current: AuthState) => Partial<AuthState>)

type AuthStoreHook = {
  <Selected>(selector: (state: AuthState) => Selected): Selected
  getState: () => AuthState
  setState: (updater: StateUpdater) => void
  subscribe: (listener: () => void) => () => void
}

interface PersistedAuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
}

const STORAGE_KEY = 'pulselink-auth'
const listeners = new Set<() => void>()

function emptyPersistedState(): PersistedAuthState {
  return { accessToken: null, refreshToken: null, user: null }
}

function readPersistedState(): PersistedAuthState {
  if (typeof window === 'undefined') return emptyPersistedState()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyPersistedState()

    const parsed = JSON.parse(raw) as Partial<PersistedAuthState>
    return {
      accessToken:
        typeof parsed.accessToken === 'string' ? parsed.accessToken : null,
      refreshToken:
        typeof parsed.refreshToken === 'string' ? parsed.refreshToken : null,
      user: parsed.user
        ? {
            ...parsed.user,
            avatarUrl: resolveApiUrl(parsed.user.avatarUrl),
          }
        : null,
    }
  } catch {
    return emptyPersistedState()
  }
}

const persisted = readPersistedState()

let state: AuthState = {
  ...persisted,
  setSession: (session) => {
    setState({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: {
        ...session.user,
        avatarUrl: resolveApiUrl(session.user.avatarUrl),
      },
    })
  },
  updateUser: (patch) => {
    setState((current) => ({
      user: current.user ? { ...current.user, ...patch } : null,
    }))
  },
  clearSession: () => {
    setState({ accessToken: null, refreshToken: null, user: null })
  },
}

function persistState(current: AuthState): void {
  if (typeof window === 'undefined') return

  const value: PersistedAuthState = {
    accessToken: current.accessToken,
    refreshToken: current.refreshToken,
    user: current.user,
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Keep the in-memory session when browser storage is unavailable.
  }
}

function setState(updater: StateUpdater): void {
  const patch = typeof updater === 'function' ? updater(state) : updater
  state = { ...state, ...patch }
  persistState(state)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function useStore<Selected>(selector: (current: AuthState) => Selected): Selected {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

export const useAuthStore = Object.assign(useStore, {
  getState: () => state,
  setState,
  subscribe,
}) as AuthStoreHook
