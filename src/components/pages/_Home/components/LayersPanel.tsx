import { useState } from "react";
import { useLayersStore } from "@/zustand/layers.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Layers, X, RotateCcw } from "lucide-react";

export default function LayersPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { layers, activeLayers, toggleLayer, resetLayers } = useLayersStore();

  const activeCount = activeLayers.length;

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 transition-all duration-200 hover:scale-105"
      >
        <Layers className="w-4 h-4" />
        Capas
        {activeCount > 1 && (
          <Badge
            variant="secondary"
            className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {activeCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed top-20 left-4 z-40 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Capas del Mapa</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetLayers}
                className="h-8 px-2 text-xs gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Activa/desactiva diferentes capas de información
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 overflow-hidden">
          {/* Resumen de capas activas */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                Capas Activas
              </span>
              <Badge variant="secondary" className="text-xs">
                {activeCount}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {activeLayers.map((layerId) => {
                const layer = layers.find((l) => l.id === layerId);
                return layer ? (
                  <Badge
                    key={layerId}
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: layer.color, color: layer.color }}
                  >
                    {layer.icon} {layer.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>

          {/* Lista de capas */}
          <div className="space-y-3">
            {layers.map((layer) => {
              const isActive = activeLayers.includes(layer.id);

              return (
                <div
                  key={layer.id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                        style={{
                          backgroundColor: isActive ? layer.color : "#f3f4f6",
                          color: isActive ? "white" : layer.color,
                        }}
                      >
                        {layer.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-medium ${
                            isActive ? "text-primary" : "text-gray-900"
                          }`}
                        >
                          {layer.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {layer.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => toggleLayer(layer.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>

                  {/* Indicador de tipo de capa */}
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        layer.type === "accommodation"
                          ? "border-blue-500 text-blue-600"
                          : layer.type === "category"
                          ? "border-green-500 text-green-600"
                          : layer.type === "status"
                          ? "border-orange-500 text-orange-600"
                          : "border-purple-500 text-purple-600"
                      }`}
                    >
                      {layer.type === "accommodation"
                        ? "General"
                        : layer.type === "category"
                        ? "Categoría"
                        : layer.type === "status"
                        ? "Estado"
                        : "Región"}
                    </Badge>

                    {layer.filter && (
                      <Badge variant="secondary" className="text-xs">
                        Filtro: {layer.filter.field}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Información adicional */}
          <div className="pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <strong>💡 Tip:</strong> Puedes combinar múltiples capas para
                análisis avanzado
              </p>
              <p>
                <strong>🎯 Filtros:</strong> Las capas se combinan con los
                filtros activos
              </p>
              <p>
                <strong>🔄 Reset:</strong> Vuelve a la vista "Todos los
                Alojamientos"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
