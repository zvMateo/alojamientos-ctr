// Declaraciones globales para Google Maps API
declare global {
  interface Window {
    google: typeof google;
  }
}

// Extender el namespace de Google Maps para incluir tipos adicionales
declare namespace google.maps {
  interface MarkerOptions {
    icon?: string | Icon | symbol;
    position?: LatLng | LatLngLiteral;
    title?: string;
    map?: Map;
    clickable?: boolean;
    draggable?: boolean;
    visible?: boolean;
    zIndex?: number;
    animation?: Animation;
  }

  interface Icon {
    url?: string;
    scaledSize?: Size;
    size?: Size;
    anchor?: Point;
    origin?: Point;
  }

  interface Size {
    width: number;
    height: number;
  }

  interface Point {
    x: number;
    y: number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface LatLng {
    lat(): number;
    lng(): number;
  }

  interface Map {
    fitBounds(bounds: LatLngBounds): void;
    getZoom(): number;
    setZoom(zoom: number): void;
    getCenter(): LatLng | null;
    setCenter(center: LatLng | LatLngLiteral): void;
  }

  interface LatLngBounds {
    extend(point: LatLng | LatLngLiteral): void;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
  }

  enum Animation {
    BOUNCE = 1,
    DROP = 2,
  }
}

export {};
