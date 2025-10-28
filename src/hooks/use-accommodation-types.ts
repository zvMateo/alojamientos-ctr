import { useQuery } from "@tanstack/react-query";
import { getTiposAlojamiento } from "@/services/alojamientos.service";

// Hook para obtener tipos de alojamiento con TanStack Query
export const useAccommodationTypes = () => {
  return useQuery({
    queryKey: ["accommodation-types"],
    queryFn: getTiposAlojamiento,
    staleTime: 30 * 60 * 1000, // 30 minutos - los tipos no cambian frecuentemente
    gcTime: 60 * 60 * 1000, // 1 hora en caché
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
