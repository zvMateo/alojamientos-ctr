import {
  MarkerClusterer,
  SuperClusterAlgorithm,
} from "@googlemaps/markerclusterer";
import { useMap } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useRef } from "react";
import type { Accommodation } from "@/lib/schemas/accommodation.schema";
import { getPinColor, createPinSVG } from "@/utils/map-utils";

// Declarar google en window para TypeScript
declare global {
  interface Window {
    google: any;
  }
}

// Importar tipos de Google Maps
import type {} from "@googlemaps/markerclusterer";

interface ClusteredAccommodationMarkersProps {
  accommodations: Accommodation[];
  onMarkerClick?: (accommodation: Accommodation) => void;
}

export default function ClusteredAccommodationMarkers({
  accommodations,
  onMarkerClick,
}: ClusteredAccommodationMarkersProps) {
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const onMarkerClickRef = useRef(onMarkerClick);
  const map = useMap();

  // Mantener referencia actualizada del callback
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // Manejar click en marcador con referencia estable
  const handleMarkerClick = useCallback((accommodation: Accommodation) => {
    if (onMarkerClickRef.current) {
      onMarkerClickRef.current(accommodation);
    }
  }, []); // Sin dependencias para evitar re-renders

  // Efecto principal para crear y actualizar el clustering
  useEffect(() => {
    if (!map || !accommodations || accommodations.length === 0) return;

    // Limpiar clusterer anterior si existe
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }

    // Crear marcadores individuales
    const markers = accommodations.map((accommodation) => {
      const marker = new window.google.maps.Marker({
        position: accommodation.coordenadas,
        icon: createPinSVG(getPinColor(accommodation.tipo), 32, false),
        title: accommodation.nombre,
      });

      // Agregar listener para click
      marker.addListener("click", () => {
        handleMarkerClick(accommodation);
      });

      return marker;
    });

    // Crear clusterer con algoritmo SuperCluster
    const algorithm = new SuperClusterAlgorithm({
      radius: 100,
      maxZoom: 16,
    });

    clustererRef.current = new MarkerClusterer({
      map,
      markers,
      algorithm,
      onClusterClick: (_, cluster) => {
        const bounds = new window.google.maps.LatLngBounds();
        for (const marker of cluster.markers) {
          bounds.extend(marker.position);
        }
        map.fitBounds(bounds);
      },
      renderer: {
        render: ({ count, position }) => {
          // Colores dinámicos basados en la cantidad de marcadores
          const color =
            count > 100 ? "#d71f33" : count > 50 ? "#059669" : "#0891B2";

          return new window.google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3"/>
                  <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${count}</text>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20),
            },
          });
        },
      },
    });

    // Cleanup function
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [map, accommodations]); // Solo dependencias esenciales

  return null; // Este componente no renderiza nada directamente, solo maneja los marcadores
}
