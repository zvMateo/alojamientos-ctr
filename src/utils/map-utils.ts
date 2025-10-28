import { useMemo } from "react";

// Mapeo de colores para tipos de alojamiento
const COLOR_MAP: Record<number, string> = {
  1: "#d71f33", // ALBERGUE - Rojo principal
  2: "#059669", // ALOJAMIENTO ALTERNATIVO - Verde
  3: "#0891B2", // APART CABAÑAS - Azul
  4: "#7C3AED", // APART HOTEL - Púrpura
  5: "#DC2626", // CABAÑA - Rojo oscuro
  6: "#EA580C", // CAMPAMENTO TURISTICO - Naranja
  7: "#16A34A", // COLONIA - Verde oscuro
  8: "#9333EA", // COMPLEJO ESPECIALIZADO - Violeta
  9: "#C2410C", // COMPLEJO ESPECIALIZADO DEPORTIVO - Naranja oscuro
  10: "#0891B2", // COMPLEJO TURISTICO - Azul
  11: "#7C2D12", // COMPLEJO TURISTICO ESPECIALIZADO CINEGETICO - Marrón
  12: "#059669", // COMPLEJO TURISTICO ESPECIALIZADO EN SALUD - Verde
  13: "#7C3AED", // COMPLEJO TURISTICO ESPECIALIZADO RECREATIVO - Púrpura
  14: "#16A34A", // COMPLEJO TURISTICO ESPECIALIZADO RURAL - Verde oscuro
  15: "#DC2626", // CONJUNTO DE CASAS DE USO TURISTICO - Rojo oscuro
  16: "#0891B2", // CONJUNTO DE CASAS Y/O DEPTOS - Azul
  17: "#7C3AED", // CONJUNTO DE DEPARTAMENTOS DE USO TURISTICO - Púrpura
  18: "#059669", // HOSPEDAJE - Verde
  19: "#EA580C", // HOSTAL - Naranja
  20: "#16A34A", // HOSTERIA - Verde oscuro
  21: "#9333EA", // HOSTERIA Y/O POSADA - Violeta
  22: "#d71f33", // HOTEL - Rojo principal
  23: "#C2410C", // LOCACION DE INMUEBLES - Naranja oscuro
  24: "#7C2D12", // MOTEL - Marrón
  25: "#6B7280", // NO CATEGORIZADO - Gris
  26: "#059669", // RESIDENCIAL - Verde
};

/**
 * Obtiene el color correspondiente a un tipo de alojamiento
 * @param tipoId ID del tipo de alojamiento
 * @returns Color hexadecimal
 */
export const getPinColor = (tipoId: number): string => {
  return COLOR_MAP[tipoId] || "#d71f33"; // Color por defecto
};

/**
 * Crea un SVG personalizado para el pin del mapa
 * @param color Color del pin
 * @param size Tamaño del pin
 * @param isSelected Si el pin está seleccionado
 * @returns SVG string
 */
export const createPinSVG = (
  color: string,
  size: number = 32,
  isSelected: boolean = false
): string => {
  const strokeWidth = isSelected ? 3 : 2;
  const scale = isSelected ? 1.2 : 1;
  const scaledSize = size * scale;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="${scaledSize}" height="${scaledSize}" viewBox="0 0 ${scaledSize} ${scaledSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <path d="M${scaledSize / 2} 2 L${scaledSize - 4} ${scaledSize - 8} L${
    scaledSize / 2
  } ${scaledSize - 2} L4 ${scaledSize - 8} Z" 
            fill="${color}" 
            stroke="white" 
            stroke-width="${strokeWidth}" 
            filter="url(#shadow)"/>
    </svg>
  `)}`;
};

/**
 * Hook memoizado para obtener colores de pins
 * @param tipoId ID del tipo de alojamiento
 * @returns Color hexadecimal memoizado
 */
export const usePinColor = (tipoId: number) => {
  return useMemo(() => getPinColor(tipoId), [tipoId]);
};

/**
 * Hook memoizado para crear SVG de pins
 * @param color Color del pin
 * @param size Tamaño del pin
 * @param isSelected Si el pin está seleccionado
 * @returns SVG string memoizado
 */
export const usePinSVG = (
  color: string,
  size: number = 32,
  isSelected: boolean = false
) => {
  return useMemo(
    () => createPinSVG(color, size, isSelected),
    [color, size, isSelected]
  );
};
