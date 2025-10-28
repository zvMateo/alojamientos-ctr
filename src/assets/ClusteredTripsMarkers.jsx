import {
  MarkerClusterer,
  SuperClusterAlgorithm,
} from "@googlemaps/markerclusterer";
import { useMap } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TripMarker from "./TripMarker";
import { useMapContext } from "../MapContext/MapContext";

export default function ClusteredTripsMarkers({ trips }) {
  const [markers, setMarkers] = useState({});
  // const [selectedPosition, setSelectedPosition] = useState(null);
  const { handleOpenStory } = useMapContext();
  // const infoWindowRef = useRef(null);
  const clustererRef = useRef(null);
  // const { setIsPositionSelected } = useTripMapStore();

  // Referencia para rastrear si el componente está montado
  const isMountedRef = useRef(true);

  // Referencia para rastrear si estamos en medio de una actualización
  const isUpdatingRef = useRef(false);

  const map = useMap();

  // Group trips by position
  const tripsByPosition = useMemo(() => {
    const grouped = {};

    if (!trips) return grouped;

    trips.forEach((trip) => {
      const posKey = `${trip.originLat},${trip.originLng}`;
      if (!grouped[posKey]) {
        grouped[posKey] = {
          position: {
            lat: Number.parseFloat(trip.originLat),
            lng: Number.parseFloat(trip.originLng),
          },
          trips: [],
        };
      }
      grouped[posKey].trips.push(trip);
    });

    return grouped;
  }, [trips]);

  // Get selected trips based on position
  // const selectedTrips = useMemo(() => {
  //   if (!selectedPosition) return [];
  //   const posKey = `${selectedPosition.lat},${selectedPosition.lng}`;
  //   return tripsByPosition[posKey]?.trips || [];
  // }, [selectedPosition, tripsByPosition]);

  // Create a map of position keys to trip counts for the clusterer
  const tripCountsByPosition = useMemo(() => {
    const countMap = new Map();

    Object.entries(tripsByPosition).forEach(([posKey, data]) => {
      countMap.set(posKey, data.trips.length);
    });

    return countMap;
  }, [tripsByPosition]);

  // Función para crear el clusterer
  const createClusterer = useCallback(() => {
    if (!map) return null;

    // Si ya existe un clusterer, simplemente lo devolvemos
    if (clustererRef.current) {
      return clustererRef.current;
    }

    const algorithm = new SuperClusterAlgorithm({
      radius: 100,
      maxZoom: 16,
    });

    const newClusterer = new MarkerClusterer({
      map,
      algorithm,
      onClusterClick: (_, cluster) => {
        // setSelectedPosition(null);
        const bounds = new window.google.maps.LatLngBounds();
        for (const m of cluster.markers) {
          bounds.extend(m.position);
        }
        map.fitBounds(bounds);
      },
      renderer: {
        render: (cluster, stats, map) => {
          // Calculate total trips in this cluster
          let totalTrips = 0;

          for (const marker of cluster.markers) {
            // Get the position key from the marker's position
            const position = marker.position;
            const posKey = `${position.lat},${position.lng}`;

            // Get the trip count for this position
            const tripsAtPosition = tripCountsByPosition.get(posKey) || 1;
            totalTrips += tripsAtPosition;
          }

          // Define colors based on trip count
          let color;
          if (totalTrips < 10) {
            color = "#1E88E5"; // Blue for small clusters
          } else if (totalTrips < 50) {
            color = "#FBC02D"; // Yellow for medium clusters
          } else {
            color = "#D32F2F"; // Red for large clusters
          }

          const div = document.createElement("div");
          div.className = "custom-cluster";
          div.style.width = "40px";
          div.style.height = "40px";
          div.style.borderRadius = "50%";
          div.style.backgroundColor = color;
          div.style.border = "2px solid #FFFFFF";
          div.style.color = "#FFFFFF";
          div.style.textAlign = "center";
          div.style.fontWeight = "bold";
          div.style.fontSize = "14px";
          div.style.flexDirection = "column";
          div.style.display = "flex";
          div.style.justifyContent = "center";
          div.style.alignItems = "center";
          div.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

          const svgContainer = document.createElement("div");
          svgContainer.style.width = "100%";
          svgContainer.style.height = "100%";
          svgContainer.style.display = "flex";
          svgContainer.style.justifyContent = "center";
          svgContainer.style.alignItems = "center";

          const svgString = `<svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
          >
            <path
              strokeLinejoin="round"
              strokeMiterlimit="1.5"
              d="M7 19a2 2 0 1 0 0-4a2 2 0 0 0 0 4m10 0a2 2 0 1 0 0-4a2 2 0 0 0 0 4"
            />
            <path d="M14 17V6.6a.6.6 0 0 0-.6-.6H2.6a.6.6 0 0 0-.6.6v9.8a.6.6 0 0 0 .6.6h2.05M14 17H9.05M14 9h5.61a.6.6 0 0 1 .548.356l1.79 4.028a.6.6 0 0 1 .052.243V16.4a.6.6 0 0 1-.6.6h-1.9M14 17h1" />
          </g>
        </svg>`;

          svgContainer.innerHTML = svgString;

          const span = document.createElement("span");
          span.textContent = totalTrips.toString(); // Show total trips instead of marker count
          span.style.height = "100%";
          span.style.fontSize = "0.75rem";

          div.appendChild(svgContainer);
          div.appendChild(span);

          // Increase size based on count
          const scale = Math.min(1.5, 1 + 0.05 * Math.log(totalTrips));
          div.style.transform = `scale(${scale})`;

          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: cluster.position,
            content: div,
          });

          return marker;
        },
      },
    });

    clustererRef.current = newClusterer;
    return newClusterer;
  }, [map, tripCountsByPosition]);

  // Función para actualizar los marcadores en el clusterer
  const updateMarkers = useCallback(() => {
    if (!clustererRef.current || isUpdatingRef.current) return;

    try {
      isUpdatingRef.current = true;

      // Actualizar los marcadores sin limpiar primero
      clustererRef.current.addMarkers(Object.values(markers));

      // Forzar una actualización del clusterer
      clustererRef.current.render();
    } finally {
      isUpdatingRef.current = false;
    }
  }, [markers]);

  // Efecto para crear el clusterer cuando el mapa esté listo
  useEffect(() => {
    if (!map) return;

    createClusterer();

    // Limpieza al desmontar
    return () => {
      isMountedRef.current = false;

      // Limpiar clusterer
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [map, createClusterer]);

  // Efecto para actualizar los marcadores en el clusterer
  useEffect(() => {
    if (!clustererRef.current || Object.keys(markers).length === 0) return;

    // Actualizar los marcadores
    updateMarkers();
  }, [markers, updateMarkers]);

  // Efecto para manejar cambios en los datos de viajes
  useEffect(() => {
    if (!clustererRef.current) return;

    // Cuando cambian los datos de viajes, forzamos una actualización completa
    clustererRef.current.clearMarkers();
    updateMarkers();
  }, [trips, updateMarkers]);

  const setMarkerRef = useCallback((marker, posKey) => {
    setMarkers((prevMarkers) => {
      if ((marker && prevMarkers[posKey]) || (!marker && !prevMarkers[posKey]))
        return prevMarkers;

      if (marker) {
        return { ...prevMarkers, [posKey]: marker };
      } else {
        const { [posKey]: _, ...newMarkers } = prevMarkers;
        return newMarkers;
      }
    });
  }, []);

  // const handleInfoWindowClose = useCallback(() => {
  //   setIsPositionSelected(false);
  //   setSelectedPosition(null);
  // }, []);

  const handleMarkerClick = useCallback(
    (position) => {
      // transformat lat y lng y forzar si o si a 5 decimales, agregando un 0 al final

      // const lat = Number.parseFloat(position.lat).toFixed(5);
      // const lng = Number.parseFloat(position.lng).toFixed(5);

      // const newPosition = {
      //   lat: lat,
      //   lng: lng,
      // }

 

      const trip = trips.find((trip) => {
        const tripLat = Number.parseFloat(trip.originLat);
        const tripLng = Number.parseFloat(trip.originLng);

        return tripLat === position.lat && tripLng === position.lng;
      });

      if (window.ReactNativeWebView) {
        return window.ReactNativeWebView.postMessage(
          JSON.stringify({ action: "tripId", id: trip.id })
        );
      }
      handleOpenStory(trip.id);
    },
    [trips]
  );

  // Efecto para manejar cambios de zoom
  useEffect(() => {
    if (!map) return;

    const handleMapChange = () => {
      if (!isMountedRef.current || !clustererRef.current) return;

      // No actualizar si el InfoWindow está abierto
      // if (selectedPosition) return;

      // En lugar de limpiar y volver a añadir, solo forzamos un renderizado
      clustererRef.current.render();
    };

    const zoomListener = map.addListener("zoom_changed", handleMapChange);
    const dragEndListener = map.addListener("dragend", handleMapChange);
    const idleListener = map.addListener("idle", handleMapChange);

    return () => {
      if (zoomListener) window.google.maps.event.removeListener(zoomListener);
      if (dragEndListener)
        window.google.maps.event.removeListener(dragEndListener);
      if (idleListener) window.google.maps.event.removeListener(idleListener);
    };
  }, [map]);

  return (
    <>
      {Object.entries(tripsByPosition).map(([posKey, data]) => (
        <TripMarker
          key={posKey}
          positionKey={posKey}
          position={data.position}
          tripsCount={data.trips.length}
          onClick={handleMarkerClick}
          setMarkerRef={setMarkerRef}
        />
      ))}

      {/* {selectedPosition && (
        <InfoWindow
          ref={infoWindowRef}
          minWidth={280}
          headerContent={
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>
              {selectedTrips.length > 1
                ? `${selectedTrips.length} viajes en esta ubicación`
                : "Detalles del viaje"}
            </span>
          }
          anchor={markers[`${selectedPosition.lat},${selectedPosition.lng}`]}
          onCloseClick={handleInfoWindowClose}
        >
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {selectedTrips.map((trip, index) => (
              <div
                key={trip.key}
                style={{
                  padding: "8px",
                  borderBottom:
                    index < selectedTrips.length - 1
                      ? "1px solid #eee"
                      : "none",
                }}
              >
                <ul
                  style={{
                    listStyle: "none",
                    padding: "0",
                    margin: "0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <li
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    {trip.grano}
                  </li>
                  <li
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    Origen{" "}
                    <strong
                      style={{
                        fontSize: "1rem",
                      }}
                    >
                      {trip.originName}
                    </strong>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <span>Destino</span>{" "}
                    <strong
                      style={{
                        fontSize: "1rem",
                      }}
                    >
                      {trip.destinationName}
                    </strong>
                  </li>
                  <li
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.25rem",
                    }}
                  >
                    {trip.tarifa === "SIN TARIFA"
                      ? trip.tarifa
                      : argPrice.format(trip.tarifa)}
                  </li>
                </ul>

                <RequestWhatsappButton id={trip.id} />
              </div>
            ))}
          </div>
        </InfoWindow>
      )} */}
    </>
  );
}
