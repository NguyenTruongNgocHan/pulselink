import { create } from 'zustand'

type AuthState = {
  accessToken: string | null
  setAccessToken: (accessToken: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  clearSession: () => set({ accessToken: null }),
}))
