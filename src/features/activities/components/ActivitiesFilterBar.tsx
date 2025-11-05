import { memo, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Loader2 } from "lucide-react";
import type { Prestador } from "../types";
import { getPrestadoresByFilters } from "../services/filters.service";
import {
  getAllLocalidades,
  getAllActividades,
  type LocalidadOption,
  type ActividadOption,
} from "../services/options.service";

/**
 * FilterBar para Activities
 * Permite filtrar prestadores por búsqueda de texto
 */

interface ActivitiesFilterBarProps {
  onResults: (prestadores: Prestador[]) => void;
  onOpenPanel?: () => void;
  panelOpen?: boolean;
  onClearFilters?: () => void;
}

const ActivitiesFilterBar = memo(
  ({
    onResults,
    onOpenPanel,
    onClearFilters,
  }: ActivitiesFilterBarProps) => {
    const [search, setSearch] = useState("");
    const [selectedLocalidadId, setSelectedLocalidadId] = useState<
      string | null
    >(null);
    const [selectedActividadId, setSelectedActividadId] = useState<
      string | null
    >(null);
    const [isFetching, setIsFetching] = useState(false);

    // Estados para las opciones
    const [localidades, setLocalidades] = useState<LocalidadOption[]>([]);
    const [actividades, setActividades] = useState<ActividadOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Cargar opciones al montar el componente
    useEffect(() => {
      const loadOptions = async () => {
        try {
          setLoadingOptions(true);
          const [localidadesData, actividadesData] = await Promise.all([
            getAllLocalidades(),
            getAllActividades(),
          ]);
          setLocalidades(localidadesData);
          setActividades(actividadesData);
        } catch (error) {
          console.error("Error loading filter options:", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      loadOptions();
    }, []);

    // Aplicar filtros usando la API
    const handleApply = useCallback(async () => {
      try {
        setIsFetching(true);

        // Si no hay filtros, mostrar lista vacía
        if (!search.trim() && !selectedLocalidadId && !selectedActividadId) {
          onResults([]);
          return;
        }

        // Usar el servicio de filtros con los IDs seleccionados
        // Si solo hay búsqueda de texto, obtenemos todos los prestadores (sin filtros de API)
        const localityId = selectedLocalidadId
          ? Number(selectedLocalidadId)
          : undefined;
        const activityId = selectedActividadId
          ? Number(selectedActividadId)
          : undefined;

        let filtered = await getPrestadoresByFilters(localityId, activityId);

        // Aplicar búsqueda de texto sobre los resultados
        // La búsqueda filtra por: nombre del prestador, localidad, o cualquier actividad
        if (search.trim()) {
          const searchLower = search.toLowerCase().trim();
          filtered = filtered.filter(
            (p: Prestador) =>
              p.nombre.toLowerCase().includes(searchLower) ||
              p.localidad.toLowerCase().includes(searchLower) ||
              p.actividades.some((a: string) =>
                a.toLowerCase().includes(searchLower)
              )
          );
        }

        onResults(filtered);
        onOpenPanel?.();
      } catch (error) {
        console.error("Error applying filters:", error);
        onResults([]);
      } finally {
        setIsFetching(false);
      }
    }, [
      search,
      selectedLocalidadId,
      selectedActividadId,
      onResults,
      onOpenPanel,
    ]);

    // Limpiar filtros
    const handleClear = useCallback(() => {
      setSearch("");
      setSelectedLocalidadId(null);
      setSelectedActividadId(null);
      onResults([]);
      onClearFilters?.();
    }, [onResults, onClearFilters]);

    const isDirty =
      search.trim().length > 0 || selectedLocalidadId || selectedActividadId;

    return (
      <div className="bg-white border-b shadow-sm p-4">
        <div className="container mx-auto">
          <div className="flex flex-col gap-4">
            {/* Título */}
            <div className="text-lg font-semibold text-gray-900">
              Actividades Turísticas
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, localidad o actividad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                  className="pl-10 pr-10 w-full"
                  disabled={loadingOptions}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Selector de Localidad */}
              <Select
                value={selectedLocalidadId || "all"}
                onValueChange={(value) =>
                  setSelectedLocalidadId(value === "all" ? null : value)
                }
                disabled={loadingOptions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas las localidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las localidades</SelectItem>
                  {localidades.map((loc) => (
                    <SelectItem key={loc.id} value={String(loc.id)}>
                      {loc.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selector de Actividad */}
              <Select
                value={selectedActividadId || "all"}
                onValueChange={(value) =>
                  setSelectedActividadId(value === "all" ? null : value)
                }
                disabled={loadingOptions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas las actividades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las actividades</SelectItem>
                  {actividades.map((act) => (
                    <SelectItem key={act.id} value={String(act.id)}>
                      {act.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleApply}
                disabled={!isDirty || isFetching || loadingOptions}
                size="sm"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Aplicando filtros...
                  </>
                ) : (
                  "Aplicar Filtros"
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={handleClear}
                disabled={!isDirty || isFetching}
                size="sm"
              >
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ActivitiesFilterBar.displayName = "ActivitiesFilterBar";

export default ActivitiesFilterBar;
