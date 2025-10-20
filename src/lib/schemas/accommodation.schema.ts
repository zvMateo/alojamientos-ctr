import { z } from 'zod'

export const accommodationSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1),
  direccion: z.string(),
  region: z.string(),
  nombreArea: z.string(),
  localidad: z.string(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
  paginaWeb: z.string().url().optional(),
  clase: z.string(), // HOSTERIA Y/O POSADA, NO CATEGORIZADO, etc.
  categoria: z.string().optional(), // 1E, 2E, etc.
  nombreTitular: z.string(),
  coordenadas: z.object({ lat: z.number(), lng: z.number() }),
  estado: z.enum(['Activo', 'Inactivo', 'Pendiente']).default('Activo'),
})

export type Accommodation = z.infer<typeof accommodationSchema>


