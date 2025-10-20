import { useState } from "react";
import { useFilterStore } from "@/zustand/filter.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  MapPin,
  AlertCircle,
  X,
} from "lucide-react";
import type { Accommodation } from "@/lib/schemas/accommodation.schema";

interface StatsPanelProps {
  data: Accommodation[];
  filteredData: Accommodation[];
}

export default function StatsPanel({ data, filteredData }: StatsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedFilters, searchTerm } = useFilterStore();

  // Calcular estadísticas
  const stats = {
    total: data.length,
    filtered: filteredData.length,
    byClase: data.reduce((acc, item) => {
      acc[item.clase] = (acc[item.clase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byLocalidad: data.reduce((acc, item) => {
      acc[item.localidad] = (acc[item.localidad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byEstado: data.reduce((acc, item) => {
      acc[item.estado] = (acc[item.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    conCategoria: data.filter((item) => item.categoria && item.categoria !== "")
      .length,
    sinCategoria: data.filter(
      (item) => !item.categoria || item.categoria === ""
    ).length,
  };

  const filteredStats = {
    byClase: filteredData.reduce((acc, item) => {
      acc[item.clase] = (acc[item.clase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byLocalidad: filteredData.reduce((acc, item) => {
      acc[item.localidad] = (acc[item.localidad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 transition-all duration-200 hover:scale-105"
      >
        <BarChart3 className="w-4 h-4" />
        Stats
      </Button>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-40 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Datos en tiempo real de los alojamientos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Resumen General */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Resumen General
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </div>
                <div className="text-xs text-blue-600">Total Alojamientos</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.filtered}
                </div>
                <div className="text-xs text-green-600">Mostrados</div>
              </div>
            </div>
          </div>

          {/* Filtros Activos */}
          {(Object.values(selectedFilters).some((v) => v !== "") ||
            searchTerm) && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Filtros Activos
              </h4>
              <div className="space-y-2">
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Búsqueda: "{searchTerm}"
                  </Badge>
                )}
                {selectedFilters.tipo && (
                  <Badge variant="secondary" className="text-xs">
                    Clase: {selectedFilters.tipo}
                  </Badge>
                )}
                {selectedFilters.localidad && (
                  <Badge variant="secondary" className="text-xs">
                    Localidad: {selectedFilters.localidad}
                  </Badge>
                )}
                {selectedFilters.estado && (
                  <Badge variant="secondary" className="text-xs">
                    Estado: {selectedFilters.estado}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Por Clase */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">Por Clase</h4>
            <div className="space-y-2">
              {Object.entries(stats.byClase).map(([clase, count]) => {
                const filteredCount = filteredStats.byClase[clase] || 0;
                const percentage =
                  stats.total > 0 ? (count / stats.total) * 100 : 0;
                const filteredPercentage =
                  stats.filtered > 0
                    ? (filteredCount / stats.filtered) * 100
                    : 0;

                return (
                  <div key={clase} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium">{clase}</span>
                      <span className="text-gray-500">
                        {filteredCount}/{count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${filteredPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Por Localidad */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">
              Por Localidad
            </h4>
            <div className="space-y-2">
              {Object.entries(stats.byLocalidad).map(([localidad, count]) => {
                const filteredCount = filteredStats.byLocalidad[localidad] || 0;
                const percentage =
                  stats.total > 0 ? (count / stats.total) * 100 : 0;
                const filteredPercentage =
                  stats.filtered > 0
                    ? (filteredCount / stats.filtered) * 100
                    : 0;

                return (
                  <div key={localidad} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium">{localidad}</span>
                      <span className="text-gray-500">
                        {filteredCount}/{count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${filteredPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Por Estado */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">Por Estado</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(stats.byEstado).map(([estado, count]) => {
                const color =
                  estado === "Activo"
                    ? "bg-green-100 text-green-700"
                    : estado === "Inactivo"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700";

                return (
                  <div
                    key={estado}
                    className={`p-2 rounded-lg text-center ${color}`}
                  >
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs">{estado}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categorización */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">
              Categorización
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-xl font-bold text-orange-600">
                  {stats.conCategoria}
                </div>
                <div className="text-xs text-orange-600">Con Categoría</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xl font-bold text-gray-600">
                  {stats.sinCategoria}
                </div>
                <div className="text-xs text-gray-600">Sin Categoría</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Última actualización: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
