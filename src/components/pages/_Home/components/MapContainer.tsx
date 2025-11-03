import { APIProvider, Map, InfoWindow } from "@vis.gl/react-google-maps";
import { useState, useMemo } from "react";
import type { Accommodation } from "@/lib/schemas/accommodation.schema";
import ClusteredAccommodationMarkers from "./clusterer-markers";
import InfoWindowContent from "./InfoWindowContent";

interface MapContainerProps {
  filteredData?: Accommodation[];
}

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
};

// Default center position - Córdoba Capital
const defaultCenter = { lat: -31.4201, lng: -64.1888 };

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function MapContainer({ filteredData = [] }: MapContainerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Verificar si hay API key
  const hasApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Usar los datos filtrados directamente
  const visibleData = useMemo(() => {
    return filteredData;
  }, [filteredData]);

  // Manejar click en marcador
  const handleMarkerClick = (accommodation: Accommodation) => {
    setSelectedId(accommodation.id);
  };

  if (!hasApiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-blue-500 text-6xl mb-4">🗺️</div>
          <h2 className="text-xl font-semibold mb-4">
            Configuración requerida
          </h2>
          <p className="text-muted-foreground mb-4">
            Para mostrar el mapa, necesitas configurar la API key de Google
            Maps.
          </p>
          <p className="text-sm text-muted-foreground">
            Crea un archivo .env en la raíz del proyecto con:
            <br />
            <code className="bg-gray-200 px-2 py-1 rounded">
              VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      <APIProvider apiKey={API_KEY}>
        <Map
          style={containerStyle}
          defaultCenter={defaultCenter}
          defaultZoom={10}
          gestureHandling={"greedy"}
          zoomControl={true}
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={true}
          fullscreenControl={false}
        >
          <ClusteredAccommodationMarkers
            accommodations={visibleData}
            onMarkerClick={handleMarkerClick}
          />

          {selectedId && (
            <InfoWindow
              position={
                visibleData.find((a) => a.id === selectedId)?.coordenadas
              }
              onCloseClick={() => setSelectedId(null)}
            >
              <div className="p-0 max-w-sm">
                {(() => {
                  const alojamiento = visibleData.find(
                    (a) => a.id === selectedId
                  );
                  if (!alojamiento) return null;

                  return <InfoWindowContent accommodation={alojamiento} />;
                })()}
              </div>
            </InfoWindow>
          )}

        </Map>
      </APIProvider>
    </div>
  );
}
