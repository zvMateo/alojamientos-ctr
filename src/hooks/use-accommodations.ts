import { useQuery } from "@tanstack/react-query";
import { getAlojamientos } from "@/services/alojamientos.service";

interface UseAccommodationsParams {
  tipoId?: number | null;
  regionId?: number | null;
  areaId?: number | null;
}

// Hook para obtener alojamientos con filtros usando TanStack Query
export const useAccommodations = (params: UseAccommodationsParams = {}) => {
  const { tipoId, regionId, areaId } = params;

  return useQuery({
    queryKey: ["accommodations", { tipoId, regionId, areaId }],
    queryFn: () => {
      const queryParams: Record<string, number> = {};

      if (tipoId) queryParams.TipoId = tipoId;
      if (regionId) queryParams.RegionId = regionId;
      if (areaId) queryParams.AreaId = areaId;

      return getAlojamientos(
        Object.keys(queryParams).length > 0 ? queryParams : undefined
      );
    },
    // Usar defaults globales del QueryClient
  });
};
