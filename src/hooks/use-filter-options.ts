import { useQuery } from "@tanstack/react-query";
import { getAlojamientos } from "@/services/alojamientos.service";
import type { Accommodation } from "@/lib/schemas/accommodation.schema";

// Hook para obtener opciones de filtros dinámicamente desde la API
export const useFilterOptions = () => {
  const { data: alojamientos } = useQuery({
    queryKey: ["accommodations", {}], // Usar el mismo queryKey base para compartir caché
    queryFn: () => getAlojamientos(),
    // Usar defaults globales del QueryClient
  });

  // Extraer tipos únicos de los datos reales
  const tipoOptions = alojamientos
    ? Array.from(new Set(alojamientos.map((a: Accommodation) => a.tipo)))
        .map((tipo) => ({
          value: tipo.toString(),
          label: `Tipo ${tipo}`,
        }))
        .sort((a, b) => (a.label || "").localeCompare(b.label || ""))
    : [];

  // Extraer localidades únicas de los datos reales
  const localidadOptions = alojamientos
    ? Array.from(new Set(alojamientos.map((a: Accommodation) => a.localidad)))
        .filter((localidad) => localidad && localidad.trim() !== "")
        .map((localidad) => ({
          value: localidad,
          label: localidad,
        }))
        .sort((a, b) => (a.label || "").localeCompare(b.label || ""))
    : [];

  // Extraer regiones únicas de los datos reales
  const regionOptions = alojamientos
    ? Array.from(new Set(alojamientos.map((a: Accommodation) => a.region)))
        .filter((region) => region && region.trim() !== "")
        .map((region) => ({
          value: region,
          label: region,
        }))
        .sort((a, b) => (a.label || "").localeCompare(b.label || ""))
    : [];

  return {
    tipoOptions,
    localidadOptions,
    regionOptions,
    isLoading: !alojamientos,
  };
};
