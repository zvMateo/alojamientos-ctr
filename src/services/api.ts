import axios from 'axios'
import { useAuthStore } from '@/zustand/auth.store'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token && config.url && !config.url.includes('/api/auth/login')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


