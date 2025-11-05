import { useMemo } from "react";
import type { Accommodation } from "../schemas/accommodation.schema";

interface FilterOptions {
  localidad?: string | null;
  region?: string | null;
  estado?: string | null;
  searchTerm?: string;
}

/**
 * Hook optimizado para filtrado de alojamientos
 * Utiliza memoización y early returns para máximo rendimiento
 */
export const useOptimizedFiltering = (
  accommodations: Accommodation[] | undefined,
  filters: FilterOptions
) => {
  const filteredData = useMemo(() => {
    if (!accommodations || accommodations.length === 0) return [];

    const { localidad, region, estado, searchTerm } = filters;

    // Optimización: crear variables una sola vez fuera del loop
    const hasLocalidadFilter = localidad;
    const hasRegionFilter = region;
    const hasEstadoFilter = estado;
    const hasSearchTerm = searchTerm;
    const searchTermLower = hasSearchTerm ? searchTerm.toLowerCase() : "";

    return accommodations.filter((accommodation) => {
      // Validar que el alojamiento tenga los campos básicos necesarios
      if (
        !accommodation.nombre ||
        !accommodation.localidad ||
        !accommodation.region
      ) {
        return false;
      }

      // Filtros locales - optimizados con early returns
      if (hasLocalidadFilter && accommodation.localidad !== localidad) {
        return false;
      }

      if (hasRegionFilter && accommodation.region !== region) {
        return false;
      }

      if (hasEstadoFilter && accommodation.estado !== estado) {
        return false;
      }

      // Búsqueda por nombre - optimizada
      if (hasSearchTerm) {
        const nombreLower = accommodation.nombre.toLowerCase();
        const localidadLower = accommodation.localidad.toLowerCase();
        const direccionLower = (accommodation.direccion || "").toLowerCase();

        if (
          !nombreLower.includes(searchTermLower) &&
          !localidadLower.includes(searchTermLower) &&
          !direccionLower.includes(searchTermLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [accommodations, filters]);

  // Estadísticas de filtrado para debugging/analytics
  const stats = useMemo(() => {
    if (!accommodations) return null;

    return {
      total: accommodations.length,
      filtered: filteredData.length,
      filteredPercentage:
        accommodations.length > 0
          ? Math.round((filteredData.length / accommodations.length) * 100)
          : 0,
    };
  }, [accommodations, filteredData]);

  return {
    filteredData,
    stats,
  };
};
