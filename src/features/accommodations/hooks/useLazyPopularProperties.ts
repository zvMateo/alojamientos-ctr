import { useQuery } from "@tanstack/react-query";
import { getAlojamientosDestacados } from "../services/accommodations.service";

/**
 * Hook optimizado para cargar propiedades populares solo cuando sea necesario
 * Implementa lazy loading para mejorar el rendimiento inicial
 */
export const useLazyPopularProperties = (isVisible: boolean) => {
  return useQuery({
    queryKey: ["alojamientos", "destacados", "lazy"],
    queryFn: async () => {
      // Solo cargar si es visible
      if (!isVisible) return [];

      const allProperties = [];
      let currentPage = 1;
      const pageSize = 12; // Aumentar pageSize para menos requests
      let hasMorePages = true;
      const maxPages = 15; // Reducir aún más para cargar más rápido

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
            if (allProperties.length >= 48) {
              hasMorePages = false;
            }
          }
        } catch (error) {
          console.warn(`Error cargando página ${currentPage}:`, error);
          hasMorePages = false;
        }
      }

      // Limitar a 48 propiedades máximo para mejor rendimiento
      return allProperties.slice(0, 48);
    },
    enabled: isVisible, // Solo ejecutar cuando sea visible
    staleTime: 30 * 60 * 1000, // 30 minutos - más tiempo en caché
    gcTime: 60 * 60 * 1000, // 1 hora en caché
    retry: 1, // Solo 1 reintento para cargar más rápido
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
