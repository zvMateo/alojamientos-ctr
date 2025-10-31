// Configuración de la API
export const API_CONFIG = {
  // URL base de la API (producción)
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://apiagenciacbaturismo.ubiko.com.ar",

  // Endpoints de la API
  ENDPOINTS: {
    // Alojamientos
    ALOJAMIENTOS: "/api/MapaEstablecimientos",
    ALOJAMIENTOS_POPULARES: "/api/MapaEstablecimientos/populares",
    ALOJAMIENTOS_SIMPLE: (id: number) =>
      `/api/MapaEstablecimientos/simple/${id}`,
    ALOJAMIENTOS_DETALLE: (id: number) =>
      `/api/MapaEstablecimientos/detalle/${id}`,
    // Tipos de alojamiento
    TIPOS_ALOJAMIENTO: "/api/MapaEstablecimientos/GetAllTypes",
    // Prestadores de servicios turísticos (Actividades)
    PRESTADORES: "/api/MapaSvg/GetAllProviders",
    PRESTADOR_BY_ID: (id: number) => `/api/MapaSvg/GetProviderById?id=${id}`,
    ACTIVIDADES: "/api/MapaSvg/GetAllActivities",
    ACTIVIDAD_BY_ID: (id: number) => `/api/MapaSvg/GetActivityById?id=${id}`,
    LOCALIDADES: "/api/MapaSvg/GetAllLocalities",
    LOCALIDAD_BY_ID: (id: number) => `/api/MapaSvg/GetLocalityById?id=${id}`,
    // Datos completos por departamento (localidades + proveedores + actividades)
    DEPARTAMENTO_FULL_DATA: (id: number) =>
      `/api/MapaSvg/GetDepartmentsFullData?id=${id}`,
    // Listado de departamentos con ids (paginado)
    DEPARTAMENTOS_ALL: "/api/MapaSvg/GetAll",
    // Filtros de prestadores por localidad y actividad
    PRESTADORES_FILTROS: "/api/MapaSvg/filtros",
  },

  // Configuración de timeouts
  TIMEOUT: 15000, // 15 segundos

  // Headers por defecto
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "text/plain",
  },
} as const;

// Tipos para los endpoints
export type ApiEndpoint = keyof typeof API_CONFIG.ENDPOINTS;
