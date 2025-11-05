// Colores para cada tipo de actividad (fallback UI si la API no trae color)
export const COLORES_ACTIVIDADES: Record<string, string> = {
  TREKKING: "#8B5CF6", // Purple
  ESCALADA: "#F97316", // Orange
  CAMINATAS: "#8B5CF6", // Purple
  CICLOTURISMO: "#22C55E", // Green
  "4X4": "#22C55E", // Green
  "4 X 4": "#22C55E", // Green (alias)
  ASTROTURISMO: "#1E40AF", // Dark blue
  "TREK. GIGANTES": "#8B5CF6", // Purple
  CABALGATAS: "#3B82F6", // Blue
  ESPELEOTURISMO: "#1E40AF", // Dark blue
  "ESPELEO (sin cuerdas)": "#1E40AF", // Dark blue (alias)
  "OPERADOR TIROLESA": "#F97316", // Orange
  "OP. DE TIROLESA": "#F97316", // Orange (alias)
  SUPERVIVENCIA: "#92400E", // Brown
  "KAYAK/CANOTAJE": "#8B5CF6", // Purple
  OBSERVACIÓN: "#0EA5E9", // Sky
  OBSERVACION: "#0EA5E9", // Sky (alias)
  "SAFARI FOTOGRÁFICO": "#E11D48", // Rose
  "SAFARI FOTOGRAFICO": "#E11D48", // Rose (alias)
  "PASEO NAUTICO": "#10B981", // Emerald
  TIROLESA: "#F97316", // Orange
  PARACAIDISMO: "#F59E0B", // Amber
  RAPPEL: "#EF4444", // Red
  PESCA: "#0284C7", // Blue
  "BAQUEANO CHAMPAQUI": "#7C3AED", // Violet
  "BAQUEANO CHAMPAQUI LADERA ESTE": "#7C3AED",
  "BAQUEANO CHAMPAQUI LADERA OESTE": "#7C3AED",
  "BAQUEANO PAMPA DE ACHALA": "#7C3AED",
  "TRAIL RUNNING": "#16A34A", // Green
};

// Configuración de colores para el mapa (UI)
export const COLORES_DEPARTAMENTOS: Record<string, string> = {
  default: "#0a52a1", // Azul por defecto
  selected: "#d71f33", // Rojo primario de la app
  hover: "#0891B2", // Cyan
};
