import { useQuery } from "@tanstack/react-query";
import { getAlojamientosDestacados } from "@/services/alojamientos.service";

// Hook optimizado para cargar propiedades populares con mejor rendimiento
export const useAllPopularProperties = () => {
  return useQuery({
    queryKey: ["alojamientos", "destacados", "all"],
    queryFn: async () => {
      const allProperties = [];
      let currentPage = 1;
      const pageSize = 12; // Aumentar pageSize para menos requests
      let hasMorePages = true;
      const maxPages = 20; // Reducir límite para mejor rendimiento

      // Cargamos páginas de forma más eficiente
      while (hasMorePages && currentPage <= maxPages) {
        try {
          const pageData = await getAlojamientosDestacados(
            currentPage,
            pageSize
          );

          if (pageData.length === 0) {
            hasMorePages = false;
          } else {
            allProperties.push(...pageData);
            currentPage++;

            // Si ya tenemos suficientes propiedades, parar
            if (allProperties.length >= 60) {
              hasMorePages = false;
            }
          }
        } catch (error) {
          console.warn(`Error cargando página ${currentPage}:`, error);
          hasMorePages = false;
        }
      }

      // Limitar a 60 propiedades máximo para mejor rendimiento
      return allProperties.slice(0, 60);
    },
    staleTime: 30 * 60 * 1000, // 30 minutos - más tiempo en caché
    gcTime: 60 * 60 * 1000, // 1 hora en caché
    retry: 1, // Solo 1 reintento para cargar más rápido
    refetchOnWindowFocus: false,
    refetchOnReconnect: false, // No recargar al reconectar
  });
};
