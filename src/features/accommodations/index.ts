// Export types
export type { Accommodation } from "./schemas/accommodation.schema";
export type { AccommodationType } from "./schemas/accommodation-type.schema";

// Export schemas
export { accommodationSchema } from "./schemas/accommodation.schema";
export { accommodationTypeSchema } from "./schemas/accommodation-type.schema";

// Export services
export {
  getAlojamientos,
  getAlojamientosDestacados,
  getAlojamientoSimple,
  getAlojamientoDetalle,
  getTiposAlojamiento,
} from "./services/accommodations.service";

// Export hooks
export { useAccommodations } from "./hooks/useAccommodations";
export { useAccommodationTypes } from "./hooks/useAccommodationTypes";
export { useLazyPopularProperties } from "./hooks/useLazyPopularProperties";
export { useOptimizedFiltering } from "./hooks/useOptimizedFiltering";
export { useFilterOptions } from "./hooks/useFilterOptions";
export { useSearchSuggestions } from "./hooks/useSearchSuggestions";

// Export store
export { useFilterStore } from "./store/filters.store";

// Export components
export { default as PropertyCard } from "./components/PropertyCard";
export { default as AccommodationCarousel } from "./components/AccommodationCarousel";
export { default as FilterBar } from "./components/FilterBar";
export { default as MapContainer } from "./components/MapContainer";
export { default as InfoWindowContent } from "./components/InfoWindowContent";
export { default as ClusteredAccommodationMarkers } from "./components/ClusteredAccommodationMarkers";
