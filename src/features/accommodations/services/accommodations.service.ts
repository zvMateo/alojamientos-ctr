import { api } from "@/services/api";
import { API_CONFIG } from "@/config/api.config";
import type { Accommodation } from "../schemas/accommodation.schema";
import type { AccommodationType } from "../schemas/accommodation-type.schema";

// === TIPOS DE RESPUESTA DE LA API ===

// Respuesta del endpoint GET /api/MapaEstablecimientos
interface ApiAlojamiento {
  id: number;
  nombre: string;
  direccion: string;
  localidad: string;
  region: string | null;
  paginaWeb: string | null;
  tipo: number;
  latitud: string;
  longitud: string;
  imagenes: string[];
}

// Respuesta del endpoint GET /api/MapaEstablecimientos/simple/{id}
interface ApiAlojamientoSimple {
  id: number;
  nombre: string;
  direccion: string;
  localidad: string;
  region: string;
  telefono: string | null;
  email: string | null;
  website: string | null;
  latitud: string;
  longitud: string;
}

// Respuesta del endpoint GET /api/MapaEstablecimientos/detalle/{id}
interface ApiAlojamientoDetalle {
  id: number;
  nombre: string;
  direccion: string;
  localidad: string;
  regionNombre: string;
  telefono1: string | null;
  telefono2: string | null;
  email: string | null;
  website: string | null;
  tipo: number;
  categoria: number | null;
  nombreCategoria: string | null;
  propietario: string | null;
  latitud: string;
  longitud: string;
  imagenes?: string[];
}

// Respuesta del endpoint GET /api/MapaEstablecimientos/populares
interface ApiAlojamientosPopulares {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  results: Array<{
    id: number;
    nombre: string;
    direccion: string;
    localidad: string;
    region: string;
    phoneNumber: string | null;
    phoneNumber2: string | null;
    email: string | null;
    website: string | null;
    ownerName: string | null;
    typeId: number;
    categoryId: number | null;
    latitude: string;
    longitude: string;
    searchCount: number;
    imagenes?: string[];
  }>;
}

// === FUNCIONES DE MAPEO ===

// Función helper para construir la URL completa de la imagen
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "";

  // Si ya es una URL completa, la devolvemos tal como está
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Si es una ruta relativa, la construimos con la base URL de la API
  const baseUrl = "https://apiagenciacbaturismo.ubiko.com.ar";
  return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

// Helper para verificar si una imagen es válida (no es la imagen por defecto que no existe)
const isValidImage = (imagePath: string): boolean => {
  if (!imagePath) {
    return false;
  }

  // Normalizar el path a minúsculas para comparación
  const normalizedPath = imagePath.toLowerCase();

  // La imagen por defecto de la API no existe (404), así que la filtramos
  const isDefault =
    normalizedPath.includes("imagen-por-defecto.jpg") ||
    normalizedPath.includes("imagenpordefeto.jpg") ||
    normalizedPath.includes("imagenpordefecto.jpg") ||
    normalizedPath.includes("/establisshmentsimages/imagenpordefeto.jpg");

  return !isDefault;
};

// Mapea ApiAlojamiento a Accommodation
const mapApiToAccommodation = (apiData: ApiAlojamiento): Accommodation => {
  return {
    id: String(apiData.id),
    nombre: apiData.nombre,
    direccion: apiData.direccion,
    localidad: apiData.localidad,
    region: apiData.region || "",
    telefono: "",
    email: "",
    paginaWeb: apiData.paginaWeb || "",
    tipo: apiData.tipo,
    categoria: undefined,
    nombreCategoria: undefined,
    nombreTitular: "",
    coordenadas: {
      lat: parseFloat(apiData.latitud),
      lng: parseFloat(apiData.longitud),
    },
    estado: "Activo",
    imagenes: apiData.imagenes?.filter(isValidImage).map(getImageUrl) || [],
  };
};

// Mapea ApiAlojamientoDetalle a Accommodation
const mapApiDetalleToAccommodation = (
  apiData: ApiAlojamientoDetalle
): Accommodation => {
  return {
    id: String(apiData.id),
    nombre: apiData.nombre,
    direccion: apiData.direccion,
    localidad: apiData.localidad,
    region: apiData.regionNombre,
    telefono: apiData.telefono1 || apiData.telefono2 || "",
    email: apiData.email || "",
    paginaWeb: apiData.website || "",
    tipo: apiData.tipo,
    categoria: apiData.categoria || undefined,
    nombreCategoria: apiData.nombreCategoria || undefined,
    nombreTitular: apiData.propietario || "",
    coordenadas: {
      lat: parseFloat(apiData.latitud),
      lng: parseFloat(apiData.longitud),
    },
    estado: "Activo",
    imagenes: apiData.imagenes?.filter(isValidImage).map(getImageUrl) || [],
  };
};

// === SERVICIOS ===

// Servicio para obtener todos los alojamientos
export const getAlojamientos = async (params?: {
  RegionId?: number;
  AreaId?: number;
  TipoId?: number;
}): Promise<Accommodation[]> => {
  try {
    const response = await api.get<ApiAlojamiento[]>(
      API_CONFIG.ENDPOINTS.ALOJAMIENTOS,
      {
        params,
      }
    );
    return response.data.map(mapApiToAccommodation);
  } catch (error) {
    console.error("Error fetching alojamientos:", error);
    throw error;
  }
};

// Servicio para obtener alojamientos destacados (populares)
export const getAlojamientosDestacados = async (
  page = 1,
  pageSize = 6
): Promise<Accommodation[]> => {
  try {
    const response = await api.get<ApiAlojamientosPopulares>(
      API_CONFIG.ENDPOINTS.ALOJAMIENTOS_POPULARES,
      {
        params: { page, pageSize },
      }
    );
    return response.data.results.map((item) => ({
      id: String(item.id),
      nombre: item.nombre,
      direccion: item.direccion,
      localidad: item.localidad,
      region: item.region,
      telefono: item.phoneNumber || item.phoneNumber2 || "",
      email: item.email || "",
      paginaWeb: item.website || "",
      tipo: item.typeId,
      categoria: item.categoryId || undefined,
      nombreCategoria: undefined,
      nombreTitular: item.ownerName || "",
      coordenadas: {
        lat: parseFloat(item.latitude),
        lng: parseFloat(item.longitude),
      },
      estado: "Activo",
      imagenes: item.imagenes
        ? item.imagenes.filter(isValidImage).map(getImageUrl)
        : [],
    }));
  } catch (error) {
    console.error("Error fetching alojamientos destacados:", error);
    throw error;
  }
};

// Servicio para obtener un alojamiento simple por ID
export const getAlojamientoSimple = async (
  id: number
): Promise<Accommodation> => {
  try {
    const response = await api.get<ApiAlojamientoSimple>(
      typeof API_CONFIG.ENDPOINTS.ALOJAMIENTOS_SIMPLE === "function"
        ? API_CONFIG.ENDPOINTS.ALOJAMIENTOS_SIMPLE(id)
        : `/api/MapaEstablecimientos/simple/${id}`
    );
    return {
      id: String(response.data.id),
      nombre: response.data.nombre,
      direccion: response.data.direccion,
      localidad: response.data.localidad,
      region: response.data.region,
      telefono: response.data.telefono || "",
      email: response.data.email || "",
      paginaWeb: response.data.website || "",
      tipo: 22, // Hotel por defecto
      categoria: undefined,
      nombreCategoria: undefined,
      nombreTitular: "",
      coordenadas: {
        lat: parseFloat(response.data.latitud),
        lng: parseFloat(response.data.longitud),
      },
      estado: "Activo",
    };
  } catch (error) {
    console.error("Error fetching alojamiento simple by ID:", error);
    throw error;
  }
};

// Servicio para obtener un alojamiento detallado por ID
export const getAlojamientoDetalle = async (
  id: number
): Promise<Accommodation> => {
  try {
    const response = await api.get<ApiAlojamientoDetalle>(
      typeof API_CONFIG.ENDPOINTS.ALOJAMIENTOS_DETALLE === "function"
        ? API_CONFIG.ENDPOINTS.ALOJAMIENTOS_DETALLE(id)
        : `/api/MapaEstablecimientos/detalle/${id}`
    );
    return mapApiDetalleToAccommodation(response.data);
  } catch (error) {
    console.error("Error fetching alojamiento detalle by ID:", error);
    throw error;
  }
};

// Servicio para obtener todos los tipos de alojamiento
export const getTiposAlojamiento = async (): Promise<AccommodationType[]> => {
  try {
    const response = await api.get<AccommodationType[]>(
      API_CONFIG.ENDPOINTS.TIPOS_ALOJAMIENTO
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tipos de alojamiento:", error);
    throw error;
  }
};
