import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { useFilterStore } from "@/zustand/filter.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Filter,
  MapPin,
  Building,
  Loader2,
  Grid3X3,
  EyeOff,
} from "lucide-react";
import { useAccommodationTypes } from "@/hooks/use-accommodation-types";
import { useFilterOptions } from "@/hooks/use-filter-options";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchSuggestions } from "@/hooks/use-search-suggestions";

interface SearchSuggestion {
  id: string;
  nombre: string;
  localidad: string;
  region: string | null;
  clase: string;
  score: number;
}

const FloatingFilterBar = memo(() => {
  const {
    selectedFilters,
    setFilter,
    searchTerm,
    setSearchTerm,
    clearFilters,
    isCarouselVisible,
    toggleCarousel,
  } = useFilterStore();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Obtener tipos de alojamiento desde la API
  const { data: tiposAlojamiento, isLoading: isLoadingTypes } =
    useAccommodationTypes();

  // Obtener opciones dinámicas desde la API (localidad y región)
  const {
    localidadOptions,
    regionOptions,
    isLoading: isLoadingOptions,
  } = useFilterOptions();

  // Debounce para la búsqueda (200ms - optimizado para mejor UX)
  const debouncedSearchTerm = useDebounce(localSearchTerm, 200);

  // Obtener sugerencias de búsqueda
  const { suggestions, isSearching, hasResults } = useSearchSuggestions(
    debouncedSearchTerm,
    7 // Máximo 7 sugerencias
  );

  // Actualizar el store cuando el término debounced cambie
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  // Sincronizar el término local con el del store
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Obtener filtros activos con sus etiquetas - memoizado
  const activeFilters = useMemo(() => {
    const filters = [];

    // Búsqueda
    if (searchTerm) {
      filters.push({
        type: "search",
        label: `"${searchTerm}"`,
        icon: Search,
        color: "bg-blue-100 text-blue-800 border-blue-200",
      });
    }

    // Tipo de alojamiento
    if (selectedFilters.tipo) {
      const tipoNombre =
        tiposAlojamiento?.find((t) => t.id === selectedFilters.tipo)?.name ||
        `Tipo ${selectedFilters.tipo}`;
      filters.push({
        type: "tipo",
        label: tipoNombre,
        icon: Building,
        color: "bg-green-100 text-green-800 border-green-200",
      });
    }

    // Localidad
    if (selectedFilters.localidad) {
      filters.push({
        type: "localidad",
        label: selectedFilters.localidad,
        icon: MapPin,
        color: "bg-purple-100 text-purple-800 border-purple-200",
      });
    }

    // Región
    if (selectedFilters.region) {
      filters.push({
        type: "region",
        label: selectedFilters.region,
        icon: MapPin,
        color: "bg-orange-100 text-orange-800 border-orange-200",
      });
    }

    return filters;
  }, [selectedFilters, searchTerm, tiposAlojamiento]);

  // Contar filtros activos - memoizado
  const activeFiltersCount = useMemo(() => {
    return activeFilters.length;
  }, [activeFilters]);

  // Manejar selección de sugerencia - memoizado
  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      setSearchTerm(suggestion.nombre);
      setLocalSearchTerm(suggestion.nombre);
      setShowSuggestions(false);
    },
    [setSearchTerm]
  );

  // Manejar cambio en el input de búsqueda - memoizado
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchTerm(value);
    setShowSuggestions(value.length >= 2);
  }, []);

  // Manejar click fuera del input para cerrar sugerencias - memoizado
  const handleInputBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  // Manejar limpiar búsqueda - memoizado
  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm("");
    setSearchTerm("");
    setShowSuggestions(false);
  }, [setSearchTerm]);

  // Manejar toggle de filtros avanzados - memoizado
  const handleToggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(!showAdvancedFilters);
  }, [showAdvancedFilters]);

  // Manejar toggle del carrusel - memoizado
  const handleToggleCarousel = useCallback(() => {
    toggleCarousel();
  }, [toggleCarousel]);

  // Función para limpiar filtros individuales - memoizada
  const handleClearIndividualFilter = useCallback(
    (filterType: string) => {
      if (filterType === "search") {
        setSearchTerm("");
        setLocalSearchTerm("");
        setShowSuggestions(false);
      } else {
        setFilter(filterType as keyof typeof selectedFilters, null);
      }
    },
    [setFilter, setSearchTerm]
  );

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm shadow-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        {/* Filtros Principales */}
        <div className="flex items-center space-x-4">
          {/* Búsqueda con Sugerencias Inteligentes */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar alojamiento por nombre..."
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(localSearchTerm.length >= 2)}
              onBlur={handleInputBlur}
              className="pl-10 pr-10 h-10 text-sm"
            />

            {/* Indicador de carga */}
            {isSearching && (
              <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
            )}

            {/* Botón de limpiar */}
            {localSearchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="w-3 h-3" />
              </Button>
            )}

            {/* Dropdown de Sugerencias */}
            {showSuggestions && localSearchTerm.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                    Buscando alojamientos...
                  </div>
                ) : hasResults ? (
                  <>
                    <div className="p-2 text-xs text-gray-500 border-b bg-gray-50">
                      {suggestions.length} alojamiento
                      {suggestions.length !== 1 ? "s" : ""} encontrado
                      {suggestions.length !== 1 ? "s" : ""}
                    </div>
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="w-full px-3 py-3 text-left hover:bg-gray-50 flex items-start gap-3 text-sm border-b border-gray-100 last:border-b-0"
                      >
                        <div className="shrink-0 mt-0.5">
                          <Building className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {suggestion.nombre}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {suggestion.localidad}, {suggestion.region}
                            </span>
                          </div>
                          <div className="text-xs text-primary mt-1">
                            {suggestion.clase}
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No se encontraron alojamientos con "{localSearchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filtros Básicos */}
          <div className="hidden md:flex items-center space-x-2">
            <Select
              value={selectedFilters.tipo?.toString() || ""}
              onValueChange={(value) =>
                setFilter("tipo", value ? parseInt(value) : null)
              }
              disabled={isLoadingTypes}
            >
              <SelectTrigger className="w-40 h-10">
                <SelectValue
                  placeholder={isLoadingTypes ? "Cargando..." : "Tipo"}
                />
              </SelectTrigger>
              <SelectContent>
                {tiposAlojamiento?.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id.toString()}>
                    {tipo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedFilters.localidad}
              onValueChange={(value) => setFilter("localidad", value)}
              disabled={isLoadingOptions}
            >
              <SelectTrigger className="w-40 h-10">
                <SelectValue
                  placeholder={isLoadingOptions ? "Cargando..." : "Localidad"}
                />
              </SelectTrigger>
              <SelectContent>
                {localidadOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value || ""}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedFilters.region}
              onValueChange={(value) => setFilter("region", value)}
              disabled={isLoadingOptions}
            >
              <SelectTrigger className="w-40 h-10">
                <SelectValue
                  placeholder={isLoadingOptions ? "Cargando..." : "Región"}
                />
              </SelectTrigger>
              <SelectContent>
                {regionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value || ""}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botón de Filtros Avanzados (Mobile) */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleAdvancedFilters}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Botón Toggle Carrusel */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleCarousel}
            className={`gap-2 transition-all duration-200 ${
              isCarouselVisible
                ? "bg-primary text-white hover:bg-primary/90 border-primary"
                : "hover:bg-gray-50"
            }`}
          >
            {isCarouselVisible ? (
              <>
                <EyeOff className="w-4 h-4" />
                Ocultar Carrusel
              </>
            ) : (
              <>
                <Grid3X3 className="w-4 h-4" />
                Mostrar Carrusel
              </>
            )}
          </Button>

          {/* Filtros Activos Individuales */}
          {activeFilters.length > 0 && (
            <div className="hidden lg:flex flex-col gap-2 flex-1 min-w-0">
              {/* Primera fila: máximo 2 filtros */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {activeFilters.slice(0, 2).map((filter) => {
                    const IconComponent = filter.icon;
                    return (
                      <div
                        key={filter.type}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 shrink-0 ${filter.color}`}
                      >
                        <IconComponent className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-40">
                          {filter.label}
                        </span>
                        <button
                          onClick={() =>
                            handleClearIndividualFilter(filter.type)
                          }
                          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                          aria-label={`Eliminar filtro ${filter.label}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {activeFilters.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 h-auto text-xs shrink-0 whitespace-nowrap"
                    title="Limpiar todos los filtros"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpiar todo
                  </Button>
                )}
              </div>

              {/* Segunda fila: filtros adicionales (3+) */}
              {activeFilters.length > 2 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {activeFilters.slice(2).map((filter) => {
                    const IconComponent = filter.icon;
                    return (
                      <div
                        key={filter.type}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 shrink-0 ${filter.color}`}
                      >
                        <IconComponent className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-40">
                          {filter.label}
                        </span>
                        <button
                          onClick={() =>
                            handleClearIndividualFilter(filter.type)
                          }
                          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                          aria-label={`Eliminar filtro ${filter.label}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filtros Activos (Mobile/Tablet) */}
        {activeFilters.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 lg:hidden">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Filtros activos ({activeFilters.length})
                </h3>
                {activeFilters.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 h-auto text-xs"
                    title="Limpiar todos los filtros"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpiar todo
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => {
                  const IconComponent = filter.icon;
                  return (
                    <div
                      key={filter.type}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 ${filter.color}`}
                    >
                      <IconComponent className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-32">{filter.label}</span>
                      <button
                        onClick={() => handleClearIndividualFilter(filter.type)}
                        className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                        aria-label={`Eliminar filtro ${filter.label}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filtros Avanzados (Mobile) */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 md:hidden">
            <div className="grid grid-cols-1 gap-3">
              <Select
                value={selectedFilters.tipo?.toString() || ""}
                onValueChange={(value) =>
                  setFilter("tipo", value ? parseInt(value) : null)
                }
                disabled={isLoadingTypes}
              >
                <SelectTrigger className="h-10">
                  <SelectValue
                    placeholder={
                      isLoadingTypes ? "Cargando..." : "Tipo de alojamiento"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {tiposAlojamiento?.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedFilters.localidad}
                onValueChange={(value) => setFilter("localidad", value)}
                disabled={isLoadingOptions}
              >
                <SelectTrigger className="h-10">
                  <SelectValue
                    placeholder={isLoadingOptions ? "Cargando..." : "Localidad"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {localidadOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value || ""}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedFilters.region}
                onValueChange={(value) => setFilter("region", value)}
                disabled={isLoadingOptions}
              >
                <SelectTrigger className="h-10">
                  <SelectValue
                    placeholder={isLoadingOptions ? "Cargando..." : "Región"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value || ""}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

FloatingFilterBar.displayName = "FloatingFilterBar";

export default FloatingFilterBar;
