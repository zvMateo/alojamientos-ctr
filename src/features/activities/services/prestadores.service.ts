import { api } from "@/services/api";
import { API_CONFIG } from "@/config/api.config";
import type { Prestador } from "../types";

// === TIPOS DE RESPUESTA DE LA API ===

// Respuesta del endpoint GET /api/MapaSvg/GetAllProviders
interface ApiPrestador {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
  localidad: string;
  actividades: string[];
}

// Respuesta del endpoint GET /api/MapaSvg/GetAllLocalities
interface ApiLocalidad {
  id: number;
  nombre: string; // nombre de la localidad
  departamento: string | null; // nombre del departamento
}

// Mapea ApiPrestador a Prestador
const mapApiToPrestador = (
  apiData: ApiPrestador,
  localidadToDepartamento: Map<string, string>
): Prestador => {
  const departamento =
    localidadToDepartamento.get(apiData.localidad) || "Desconocido";
  return {
    id: String(apiData.id),
    nombre: apiData.nombre,
    resolucion: "", // No disponible en la API actual
    vigenciaCredencial: "", // No disponible en la API actual
    telefono: apiData.telefono || "",
    email: apiData.email || "",
    localidad: apiData.localidad,
    departamento,
    actividades: apiData.actividades,
  };
};

// Función para obtener los prestadores desde la API
export const getPrestadores = async (): Promise<Prestador[]> => {
  try {
    // Obtener en paralelo: Localidades (para mapear departamento) y Prestadores
    const [localidadesResp, prestadoresResp] = await Promise.all([
      api.get<ApiLocalidad[]>(API_CONFIG.ENDPOINTS.LOCALIDADES),
      api.get<ApiPrestador[]>(API_CONFIG.ENDPOINTS.PRESTADORES),
    ]);

    // Construir mapa Localidad -> Departamento
    const localidadToDepartamento = new Map<string, string>();
    for (const loc of localidadesResp.data) {
      if (loc.nombre && loc.departamento) {
        localidadToDepartamento.set(loc.nombre, loc.departamento);
      }
    }

    console.log(
      "✅ Prestadores:",
      prestadoresResp.data.length,
      "| Localidades:",
      localidadesResp.data.length
    );

    return prestadoresResp.data.map((p) =>
      mapApiToPrestador(p, localidadToDepartamento)
    );
  } catch (error) {
    console.error("❌ Error fetching prestadores:", error);
    throw error;
  }
};

// Nuevo: obtener proveedores por departamento (endpoint consolidado)
interface ApiActividadItem {
  id: number;
  name: string;
}
interface ApiProveedorFull {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
  resolucion: string | null;
  vencimientoCredencial: string | null;
  localidad: string;
  actividades: ApiActividadItem[];
}
interface ApiLocalidadFull {
  localidadId: number;
  localidadNombre: string;
  departamentoNombre: string;
  proveedores: ApiProveedorFull[];
}
interface ApiDepartamentoFull {
  departamentoId: number;
  departamentoNombre: string;
  localidades: ApiLocalidadFull[];
}

export const getPrestadoresByDepartamentoId = async (
  departamentoId: number
): Promise<Prestador[]> => {
  const { data } = await api.get<ApiDepartamentoFull[]>(
    API_CONFIG.ENDPOINTS.DEPARTAMENTO_FULL_DATA(departamentoId)
  );
  const root = data?.[0];
  if (!root) return [];

  const prestadores: Prestador[] = [];
  for (const loc of root.localidades || []) {
    for (const prov of loc.proveedores || []) {
      prestadores.push({
        id: String(prov.id),
        nombre: prov.nombre,
        resolucion: prov.resolucion || "",
        vigenciaCredencial: prov.vencimientoCredencial || "",
        telefono: prov.telefono || "",
        email: prov.email || "",
        localidad: prov.localidad,
        departamento: root.departamentoNombre,
        actividades: (prov.actividades || []).map((a) => a.name),
      });
    }
  }
  return prestadores;
};

// Función para agrupar prestadores por departamento
export const groupPrestadoresByDepartamento = (
  prestadores: Prestador[]
): Map<string, Prestador[]> => {
  const grouped = new Map<string, Prestador[]>();

  prestadores.forEach((prestador) => {
    const dept = prestador.departamento;
    if (!grouped.has(dept)) {
      grouped.set(dept, []);
    }
    grouped.get(dept)?.push(prestador);
  });

  return grouped;
};

// Función para contar actividades por departamento
export const countActividadesByDepartamento = (
  prestadores: Prestador[]
): Map<string, number> => {
  const counts = new Map<string, number>();

  prestadores.forEach((prestador) => {
    prestador.actividades.forEach((actividad) => {
      const current = counts.get(actividad) || 0;
      counts.set(actividad, current + 1);
    });
  });

  return counts;
};
