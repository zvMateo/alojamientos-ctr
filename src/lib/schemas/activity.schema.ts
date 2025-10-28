import { z } from "zod";

// Tipos de actividades permitidas
export const actividadEnum = z.enum([
  "TREKKING",
  "ESCALADA",
  "CAMINATAS",
  "CICLOTURISMO",
  "4X4",
  "ASTROTURISMO",
  "TREK. GIGANTES",
  "CABALGATAS",
  "ESPELEOTURISMO",
  "OPERADOR TIROLESA",
  "SUPERVIVENCIA",
  "KAYAK/CANOTAJE",
]);

export const prestadorSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1),
  resolucion: z.string(),
  vigenciaCredencial: z.string(),
  telefono: z.string(),
  email: z.string().email("Email inválido"),
  localidad: z.string(),
  departamento: z.string(),
  actividades: z.array(actividadEnum),
});

export type Prestador = z.infer<typeof prestadorSchema>;
