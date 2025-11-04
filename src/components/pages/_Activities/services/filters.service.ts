import { api } from "@/services/api";
import { API_CONFIG } from "@/config/api.config";
import type { Prestador } from "@/components/pages/_Activities/types";

interface ApiPrestadorFiltro {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
  localidad: string;
  actividades: string[];
}

export const getPrestadoresByFilters = async (
  localityId?: number,
  activityId?: number
): Promise<Prestador[]> => {
  try {
    const { data } = await api.get<ApiPrestadorFiltro[]>(
      API_CONFIG.ENDPOINTS.PRESTADORES_FILTROS,
      { params: { localityId, activityId } }
    );
    return (data || []).map((p) => ({
      id: String(p.id),
      nombre: p.nombre,
      resolucion: "",
      vigenciaCredencial: "",
      telefono: p.telefono || "",
      email: p.email || "",
      localidad: p.localidad,
      departamento: "",
      actividades: p.actividades || [],
    }));
  } catch (error) {
    // Si la API devuelve 404 o cualquier error, retornar array vacío
    // Esto permite mostrar el mensaje "No hay resultados con estos filtros"
    console.warn(
      "No se encontraron prestadores con los filtros aplicados:",
      error
    );
    return [];
  }
};
