import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  user_id: number
  email: string
  phone: string
  full_name: string
  access_token: string
}

interface AuthState {
  user: User | null
  isGuest: boolean
  isAuthModalOpen: boolean
  authModalMode: 'login' | 'register'
  authReason: string | null
  setUser: (user: User | null) => void
  setGuest: (v: boolean) => void
  openAuthModal: (mode?: 'login' | 'register', reason?: string) => void
  closeAuthModal: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isGuest: false,
      isAuthModalOpen: false,
      authModalMode: 'login',
      authReason: null,
      setUser: (user) => set({ user, isGuest: false, isAuthModalOpen: false, authReason: null }),
      setGuest: (v) => set({ isGuest: v }),
      openAuthModal: (mode = 'login', reason) => set({ isAuthModalOpen: true, authModalMode: mode, authReason: reason ?? null }),
      closeAuthModal: () => set({ isAuthModalOpen: false, authReason: null }),
      logout: () => set({ user: null, isGuest: false, isAuthModalOpen: false, authReason: null }),
    }),
    {
      name: 'ideaprobe-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
