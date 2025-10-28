import { z } from "zod";

export const accommodationSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1),
  direccion: z.string(),
  region: z.string().nullable(),
    localidad: z.string(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  paginaWeb: z.string().nullable(),
  tipo: z.number(), // ID del tipo de alojamiento
  categoria: z.number().optional(), // ID de la categoría
  nombreCategoria: z.string().optional(), // Nombre de la categoría (ej: "NC")
  nombreTitular: z.string(),
  coordenadas: z.object({ lat: z.number(), lng: z.number() }),
  estado: z.enum(["Activo", "Inactivo", "Pendiente"]).default("Activo"),
  imagenes: z.array(z.string()).optional(),
});

export type Accommodation = z.infer<typeof accommodationSchema>;
