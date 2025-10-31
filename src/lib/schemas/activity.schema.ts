import { z } from "zod";

// La API devuelve actividades con muchas variantes (tildes, uniones, alias).
// Usamos string abierto para no filtrar proveedores por validación estricta.
export const prestadorSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1),
  resolucion: z.string(),
  vigenciaCredencial: z.string(),
  telefono: z.string().optional().nullable().transform((v) => v ?? ""),
  email: z.string().email("Email inválido").optional().nullable().transform((v) => v ?? ""),
  localidad: z.string(),
  departamento: z.string(),
  actividades: z.array(z.string()),
});

export type Prestador = z.infer<typeof prestadorSchema>;
