// Tipos de actividades habilitadas
export type TipoActividad =
  | "TREKKING"
  | "ESCALADA"
  | "CAMINATAS"
  | "CICLOTURISMO"
  | "4X4"
  | "ASTROTURISMO"
  | "TREK. GIGANTES"
  | "CABALGATAS"
  | "ESPELEOTURISMO"
  | "OPERADOR TIROLESA"
  | "SUPERVIVENCIA"
  | "KAYAK/CANOTAJE";

// Interface para una actividad
export interface Actividad {
  nombre: TipoActividad;
  color: string;
}

// Interface para un prestador
export interface Prestador {
  id: string;
  nombre: string;
  resolucion: string;
  vigenciaCredencial: string;
  telefono?: string;
  email?: string;
  localidad: string;
  departamento: string;
  actividades: string[]; // usar string[] para cubrir todos los casos de la API
}

// Interface para un departamento
export interface Departamento {
  id: string;
  nombre: string;
  pathId?: string; // ID del path en el SVG
  prestadoresCount: number;
  actividadesCount: number;
}
