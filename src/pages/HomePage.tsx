import {
  MapContainer,
  FilterBar,
  AccommodationCarousel,
  useFilterStore,
  useAccommodations,
  useOptimizedFiltering,
} from "@/features/accommodations";

export default function HomePage() {
  const { selectedFilters, searchTerm } = useFilterStore();

  //hook con filtros
  const { data, isLoading, error } = useAccommodations({
    tipoId: selectedFilters.tipo,
    // regionId y areaId se pueden agregar más adelante si es necesario
  });

  // Usar el hook optimizado para filtrado
  const { filteredData } = useOptimizedFiltering(data, {
    localidad: selectedFilters.localidad,
    region: selectedFilters.region,
    estado: selectedFilters.estado,
    searchTerm,
  });

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">
            Cargando alojamientos...
          </p>
        </div>
      </div>
    );
  }

  // Mostrar estado de error
  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-4">
            Error al cargar los datos
          </h2>
          <p className="text-muted-foreground mb-4">
            No se pudieron cargar los alojamientos. Verifica tu conexión a
            internet.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col relative">
      <FilterBar />
      <div className="flex-1 relative">
        <MapContainer filteredData={filteredData} allData={data} />
        <AccommodationCarousel />
      </div>
    </div>
  );
}
