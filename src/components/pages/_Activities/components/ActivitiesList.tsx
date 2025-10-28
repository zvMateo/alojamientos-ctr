import { memo, useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Prestador } from "../types";
import PrestadorCard from "./PrestadorCard";

interface ActivitiesListProps {
  prestadores: Prestador[];
  departamento: string;
  onClosePanel?: () => void;
}

const ActivitiesList = memo(
  ({ prestadores, departamento, onClosePanel }: ActivitiesListProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    // const inputRef = useRef<HTMLInputElement>(null);

    // Memoizar prestadores filtrados
    const filteredPrestadores = useMemo(() => {
      if (!searchTerm.trim()) return prestadores;

      const term = searchTerm.toLowerCase().trim();
      return prestadores.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.localidad.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term) ||
          p.actividades.some((a) => a.toLowerCase().includes(term))
      );
    }, [prestadores, searchTerm]);

    const clearSearch = () => {
      setSearchTerm("");
    };

    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header con gradiente */}
        <div className="bg-linear-to-r from-primary to-pink-600 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Actividades</h1>
              <p className="text-white/90">
                {departamento} • {prestadores.length} prestadores
              </p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, localidad, email o actividad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/40"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPrestadores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm
                  ? "No se encontraron resultados"
                  : "No hay actividades en este departamento"}
              </h3>
              <p className="text-gray-500 max-w-md">
                {searchTerm
                  ? `No hay prestadores que coincidan con "${searchTerm}".`
                  : `Aún no hay actividades registradas en ${departamento}.`}
              </p>
              {!searchTerm && (
                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => onClosePanel?.()}
                    className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    Volver al mapa
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPrestadores.map((prestador) => (
                <PrestadorCard key={prestador.id} prestador={prestador} />
              ))}
            </div>
          )}
        </div>

        {/* Footer con contador */}
        {filteredPrestadores.length > 0 && (
          <div className="border-t bg-gray-50 px-6 py-3">
            <p className="text-sm text-gray-600 text-center">
              Mostrando {filteredPrestadores.length} de {prestadores.length}{" "}
              prestadores
            </p>
          </div>
        )}
      </div>
    );
  }
);

ActivitiesList.displayName = "ActivitiesList";

export default ActivitiesList;
