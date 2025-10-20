import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/schemas/auth.schema'
// import axios from 'axios' // Comentado temporalmente

type AuthStatus = 'unauthenticated' | 'authenticated' | 'loading'

interface Credentials { email: string; password: string }

interface AuthState {
  token: string | null
  user: User | null
  status: AuthStatus
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
  checkAuthStatus: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      status: 'unauthenticated',
      login: async ({ email }) => {
        set({ status: 'loading' })
        
        // Simulación temporal - remover cuando tengas el backend
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay
        
        // Datos simulados para testing
        const mockUser: User = {
          id: '1',
          email: email,
          nombre: 'Usuario de Prueba'
        }
        
        set({ 
          token: 'mock-token-123', 
          user: mockUser, 
          status: 'authenticated' 
        })
        
        // Código original para cuando tengas el backend:
        // const baseURL = import.meta.env.VITE_API_BASE_URL
        // const res = await axios.post(`${baseURL}/api/auth/login`, { email, password })
        // const { token, user } = res.data
        // set({ token, user, status: 'authenticated' })
      },
      logout: () => set({ token: null, user: null, status: 'unauthenticated' }),
      checkAuthStatus: () => {
        const token = get().token
        set({ status: token ? 'authenticated' : 'unauthenticated' })
      },
    }),
    { name: 'auth-store' }
  )
)


