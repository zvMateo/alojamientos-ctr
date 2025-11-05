/**
 * Servicio para obtener opciones de filtros (localidades y actividades)
 */

import api from "@/services/api/axios-instance";
import { API_CONFIG } from "@/config/api.config";

// Tipos de respuesta de la API
interface ApiLocalidad {
  id: number;
  nombre: string;
}

interface ApiActividad {
  id: number;
  nombre: string;
}

// Tipos exportados para el componente
export interface LocalidadOption {
  id: number;
  nombre: string;
}

export interface ActividadOption {
  id: number;
  nombre: string;
}

/**
 * Obtiene todas las localidades disponibles
 */
export async function getAllLocalidades(): Promise<LocalidadOption[]> {
  try {
    const response = await api.get<ApiLocalidad[]>(
      API_CONFIG.ENDPOINTS.LOCALIDADES
    );

    return response.data.map((loc) => ({
      id: loc.id,
      nombre: loc.nombre,
    }));
  } catch (error) {
    console.error("Error fetching localidades:", error);
    return [];
  }
}

/**
 * Obtiene todas las actividades disponibles
 */
export async function getAllActividades(): Promise<ActividadOption[]> {
  try {
    const response = await api.get<ApiActividad[]>(
      API_CONFIG.ENDPOINTS.ACTIVIDADES
    );

    return response.data.map((act) => ({
      id: act.id,
      nombre: act.nombre,
    }));
  } catch (error) {
    console.error("Error fetching actividades:", error);
    return [];
  }
}
