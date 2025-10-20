import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nombre: z.string(),
})

export type User = z.infer<typeof userSchema>


