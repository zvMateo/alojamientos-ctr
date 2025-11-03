import { memo, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import SearchInput from "@/components/features/filters/SearchInput";
import SelectApi from "@/components/features/filters/SelectApi";
import {
  useLocalidadesOptions,
  useActividadesOptions,
} from "@/components/features/filters/hooks";
import { getPrestadoresByFilters } from "../services/filters.service";
import { getPrestadores } from "../services/prestadores.service";
import type { Prestador } from "../types";

// Tipos de apoyo (no usados directamente tras hooks compartidos)

interface ActivitiesFilterBarProps {
  onResults: (prestadores: Prestador[]) => void;
  basePrestadores: Prestador[]; // para búsqueda por texto cuando no hay filtros API
  onOpenPanel?: () => void;
  panelOpen?: boolean;
}

// hooks compartidos

const ActivitiesFilterBar = memo(
  ({
    onResults,
    basePrestadores,
    onOpenPanel,
    panelOpen,
  }: ActivitiesFilterBarProps) => {
    const { data: localidadOptions = [], isLoading: isLoadingLoc } =
      useLocalidadesOptions();
    const { data: actividadOptions = [], isLoading: isLoadingAct } =
      useActividadesOptions();

    const [localityId, setLocalityId] = useState<number | undefined>(undefined);
    const [activityId, setActivityId] = useState<number | undefined>(undefined);
    const [search, setSearch] = useState("");
    const [isFetchingFilters, setIsFetchingFilters] = useState(false);
    const [lastApplied, setLastApplied] = useState<{
      localityId?: number;
      activityId?: number;
      search: string;
    }>({ search: "" });
    const isBusy = !!panelOpen && isFetchingFilters;
    const isDirty =
      search.trim() !== (lastApplied.search || "").trim() ||
      localityId !== lastApplied.localityId ||
      activityId !== lastApplied.activityId;

    const normalize = (str: string) =>
      (str || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}+/gu, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    // Si el panel se cierra, solo detenemos estados de carga.
    // Los filtros y la búsqueda se mantienen hasta que el usuario pulse "Limpiar".
    useEffect(() => {
      if (!panelOpen) {
        setIsFetchingFilters(false);
      }
    }, [panelOpen]);

    // Ejecutar filtros y/o búsqueda solo al presionar "Aplicar"
    const handleApply = useCallback(async () => {
      const s = search.trim().toLowerCase();
      const hasFilters = !!localityId || !!activityId;
      const hasSearch = s.length > 0;

      // Si no hay nada que aplicar, limpiar y no abrir panel
      if (!hasFilters && !hasSearch) {
        setIsFetchingFilters(false);
        onResults([]);
        return;
      }

      setIsFetchingFilters(true);
      try {
        if (hasFilters) {
          const res = await getPrestadoresByFilters(localityId, activityId);
          onResults(res);
          onOpenPanel?.();
          setLastApplied({ localityId, activityId, search });
          return;
        }
        // Solo búsqueda de texto sobre el base
        const term = normalize(s);
        // Si no hay base (no se seleccionó un departamento), cargamos todos y filtramos
        const source: Prestador[] =
          basePrestadores.length > 0 ? basePrestadores : await getPrestadores();
        const filtered = source.filter((p) => {
          const nNombre = normalize(p.nombre);
          const nLocalidad = normalize(p.localidad);
          const inNombre = nNombre.includes(term);
          const inLocalidad = nLocalidad.includes(term);
          const inActividad = (p.actividades || []).some((a) =>
            normalize(a).includes(term)
          );
          return inNombre || inLocalidad || inActividad;
        });
        onResults(filtered);
        onOpenPanel?.();
        setLastApplied({ localityId, activityId, search });
      } finally {
        setIsFetchingFilters(false);
      }
    }, [
      search,
      localityId,
      activityId,
      basePrestadores,
      onResults,
      onOpenPanel,
    ]);

    const handleClear = useCallback(() => {
      setLocalityId(undefined);
      setActivityId(undefined);
      setSearch("");
      onResults([]);
    }, [onResults]);

    return (
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-md border-b">
        <div className="container mx-auto px-2 sm:px-4 py-3">
          {/* Fila 1: Búsqueda en móvil, con botones en desktop */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Búsqueda */}
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar..."
              className="flex-1 min-w-0"
              onSubmit={handleApply}
            />

            {/* Botones solo en desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                className="h-10 whitespace-nowrap"
                onClick={handleApply}
                disabled={!isDirty && !isBusy}
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Buscando
                  </>
                ) : (
                  <>Aplicar</>
                )}
              </Button>
              <Button variant="ghost" className="h-10" onClick={handleClear}>
                Limpiar
              </Button>
            </div>
          </div>

          {/* Fila 2: Selectores y botones en móvil */}
          <div className="flex items-center gap-2 mt-2 md:mt-3">
            {/* Localidad */}
            <SelectApi
              value={localityId?.toString()}
              onChange={(v) => setLocalityId(v ? parseInt(v) : undefined)}
              options={localidadOptions}
              placeholder={isLoadingLoc ? "..." : "Localidad"}
              disabled={isLoadingLoc}
              className="flex-1 md:flex-initial md:w-40"
            />

            {/* Actividad */}
            <SelectApi
              value={activityId?.toString()}
              onChange={(v) => setActivityId(v ? parseInt(v) : undefined)}
              options={actividadOptions}
              placeholder={isLoadingAct ? "..." : "Actividad"}
              disabled={isLoadingAct}
              className="flex-1 md:flex-initial md:w-40"
            />

            {/* Botones en móvil */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden h-10 px-3 shrink-0"
              onClick={handleApply}
              disabled={!isDirty && !isBusy}
            >
              {isBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Aplicar"
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-10 px-3 shrink-0"
              onClick={handleClear}
            >
              Limpiar
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

ActivitiesFilterBar.displayName = "ActivitiesFilterBar";

export default ActivitiesFilterBar;
