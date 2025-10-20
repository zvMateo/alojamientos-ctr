import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import { useState, useMemo } from "react";
import { useLayersStore } from "@/zustand/layers.store";
import { Badge } from "@/components/ui/badge";
import type { Accommodation } from "@/lib/schemas/accommodation.schema";

interface MapContainerProps {
  data?: Accommodation[];
  filteredData?: Accommodation[];
}

export default function MapContainer({
  data   = [],
  filteredData = [],
}: MapContainerProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const { layers, activeLayers } = useLayersStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Generar SVG de pin con borde blanco y tamaño variable
  const createPinSVG = (
    hexColor: string,
    size: number,
    isSelected: boolean
  ) => {
    // Usamos un viewBox 24x24 y escalamos con scaledSize
    // Agregamos stroke blanco y un halo si está seleccionado
    const stroke = "#ffffff";
    const strokeWidth = isSelected ? 2.5 : 2;
    const innerCircle = isSelected
      ? '<circle cx="12" cy="9" r="3.8" fill="white" fill-opacity="0.9" />'
      : '<circle cx="12" cy="9" r="2.6" fill="white" fill-opacity="0.9" />';

    const svg = `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000" flood-opacity="0.25"/>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${hexColor}" stroke="${stroke}" stroke-width="${strokeWidth}" />
          ${innerCircle}
        </g>
      </svg>
    `;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size),
    } as google.maps.Icon;
  };

  // Filtrar datos basado en las capas activas
  const layerFilteredData = useMemo(() => {
    // Si no hay capas activas, mostrar todos los alojamientos
    if (activeLayers.length === 0) {
      return filteredData;
    }

    // Si está activa la capa "Todos los Alojamientos", mostrar todos
    if (activeLayers.includes("all-accommodations")) {
      return filteredData;
    }

    // Filtrar por las capas específicas activas
    return filteredData.filter((accommodation) => {
      return activeLayers.some((layerId) => {
        const layer = layers.find((l) => l.id === layerId);
        if (!layer || !layer.filter) return false;

        const { field, value } = layer.filter;
        const accommodationValue = accommodation[field as keyof Accommodation];

        if (Array.isArray(value)) {
          return value.includes(accommodationValue as string);
        } else {
          return accommodationValue === value;
        }
      });
    });
  }, [filteredData, activeLayers, layers]);

  // Función para obtener el color del marcador basado en las capas activas
  const getMarkerColor = (accommodation: Accommodation) => {
    const activeLayer = layers.find(
      (layer) =>
        activeLayers.includes(layer.id) &&
        layer.filter &&
        layer.id !== "all-accommodations"
    );

    if (activeLayer) {
      const { field, value } = activeLayer.filter as {
        field: string;
        value: string | string[];
      };
      const accommodationValue = accommodation[field as keyof Accommodation];

      if (Array.isArray(value)) {
        if (value.includes(accommodationValue as string)) {
          return activeLayer.color;
        }
      } else if (accommodationValue === value) {
        return activeLayer.color;
      }
    }

    // Color por defecto basado en la clase
    const colorMap: Record<string, string> = {
      HOTEL: "#1E40AF",
      HOSTEL: "#059669",
      "HOSTERIA Y/O POSADA": "#D97706",
      CABAÑAS: "#7C3AED",
      CAMPING: "#16A34A",
      "NO CATEGORIZADO": "#6B7280",
    };

    return colorMap[accommodation.clase] || "#3B82F6";
  };

  // Mostrar error si hay problema con Google Maps
  if (loadError) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-4">Error de Google Maps</h2>
          <p className="text-gray-600 mb-4">
            Por favor configura tu clave de Google Maps API en el archivo .env
          </p>
          <div className="bg-blue-50 p-4 rounded-lg text-left">
            <p className="text-sm text-blue-800">
              <strong>Pasos:</strong>
              <br />
              1. Crear archivo .env en la raíz del proyecto
              <br />
              2. Agregar: VITE_GOOGLE_MAPS_API_KEY=tu_clave_aqui
              <br />
              3. Obtener clave en Google Cloud Console
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700 animate-pulse">
            Cargando mapa...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Contador de resultados con animación */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">
            {layerFilteredData.length} alojamiento
            {layerFilteredData.length !== 1 ? "s" : ""}
          </span>
          {activeLayers.length > 1 && (
            <Badge variant="secondary" className="text-xs">
              {activeLayers.length} capas
            </Badge>
          )}
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        center={{ lat: -31.4167, lng: -64.1833 }}
        zoom={10}
        options={{
          disableDefaultUI: false,
          zoomControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
        }}  
      >
        {layerFilteredData.map((alojamiento) => {
          const isSelected = selectedId === alojamiento.id;
          const size = isSelected ? 44 : 36; // más grande cuando está seleccionado
          const icon = createPinSVG(
            getMarkerColor(alojamiento),
            size,
            isSelected
          );
          return (
            <Marker
              key={alojamiento.id}
              position={alojamiento.coordenadas}
              onClick={() => setSelectedId(alojamiento.id)}
              icon={icon}
              zIndex={isSelected ? 2 : 1}
            />
          );
        })}
        {selectedId && layerFilteredData && (
          <InfoWindow
            position={
              layerFilteredData.find((a) => a.id === selectedId)!.coordenadas
            }
            onCloseClick={() => setSelectedId(null)}
          >
            <div className="p-3 max-w-xs animate-in fade-in-0 zoom-in-95 duration-200">
              <h3 className="font-semibold text-lg mb-2">
                {layerFilteredData.find((a) => a.id === selectedId)!.nombre}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <strong>Clase:</strong>{" "}
                  {layerFilteredData.find((a) => a.id === selectedId)!.clase}
                </p>
                <p className="text-muted-foreground">
                  <strong>Localidad:</strong>{" "}
                  {
                    layerFilteredData.find((a) => a.id === selectedId)!
                      .localidad
                  }
                </p>
                <p className="text-muted-foreground">
                  <strong>Dirección:</strong>{" "}
                  {
                    layerFilteredData.find((a) => a.id === selectedId)!
                      .direccion
                  }
                </p>
                {layerFilteredData.find((a) => a.id === selectedId)!
                  .telefono && (
                  <p className="text-muted-foreground">
                    <strong>Teléfono:</strong>{" "}
                    {
                      layerFilteredData.find((a) => a.id === selectedId)!
                        .telefono
                    }
                  </p>
                )}
                {layerFilteredData.find((a) => a.id === selectedId)!
                  .categoria && (
                  <p className="text-muted-foreground">
                    <strong>Categoría:</strong>{" "}
                    {
                      layerFilteredData.find((a) => a.id === selectedId)!
                        .categoria
                    }
                  </p>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
