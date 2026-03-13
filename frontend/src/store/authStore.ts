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
  setUser: (user: User | null) => void
  setGuest: (v: boolean) => void
  openAuthModal: (mode?: 'login' | 'register') => void
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
      setUser: (user) => set({ user, isGuest: false }),
      setGuest: (v) => set({ isGuest: v }),
      openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authModalMode: mode }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      logout: () => set({ user: null, isGuest: false }),
    }),
    {
      name: 'ideaprobe-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
