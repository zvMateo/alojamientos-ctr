/**
 * Punto de entrada principal para servicios API
 * Exporta la instancia de axios configurada y utilidades
 */

export { apiClient, default } from "./axios-instance";

/**
 * Tipos para respuestas de API
 */
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

/**
 * Helper para manejo de errores de API
 */
export const handleApiError = (error: unknown): ApiError => {
  // Type guard para axios error
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as {
      response?: {
        status: number;
        data?: { message?: string; errors?: Record<string, string[]> };
      };
      request?: unknown;
      message?: string;
    };

    if (axiosError.response) {
      return {
        message: axiosError.response.data?.message || "Error en la petición",
        status: axiosError.response.status,
        errors: axiosError.response.data?.errors,
      };
    }

    if (axiosError.request) {
      return {
        message: "No se pudo conectar con el servidor",
        status: 0,
      };
    }

    return {
      message: axiosError.message || "Error desconocido",
      status: -1,
    };
  }

  return {
    message: error instanceof Error ? error.message : "Error desconocido",
    status: -1,
  };
};
