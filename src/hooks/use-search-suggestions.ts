import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAlojamientos } from "@/services/alojamientos.service";
import { useOptimizedSearchSuggestions } from "./use-optimized-search-suggestions";

export const useSearchSuggestions = (
  searchTerm: string,
  maxResults: number = 7
) => {
  const [isSearching, setIsSearching] = useState(false);

  // Obtener todos los alojamientos
  const { data: alojamientos, isLoading } = useQuery({
    queryKey: ["accommodations", {}], // Usar el mismo queryKey base para compartir caché
    queryFn: () => getAlojamientos(),
    // Usar defaults globales del QueryClient
  });

  // Usar el índice optimizado para búsqueda
  const { suggestions, hasResults } = useOptimizedSearchSuggestions(
    alojamientos,
    searchTerm,
    maxResults
  );

  // Simular delay de búsqueda para mejor UX (100ms - más rápido)
  useEffect(() => {
    if (searchTerm && searchTerm.length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 100); // 100ms delay - más rápido para mejor UX

      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm]);

  return {
    suggestions,
    isSearching: isSearching || isLoading,
    hasResults,
  };
};
