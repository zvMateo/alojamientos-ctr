import axios from "axios";

/**
 * Configuración global de Axios
 * Instancia centralizada para todas las peticiones HTTP
 */
export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://apiagenciacbaturismo.ubiko.com.ar",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de Request
 * Aquí se pueden agregar tokens de autenticación, logging, etc.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token si existe (para futuras implementaciones)
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging en desarrollo
    if (import.meta.env.DEV) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Response
 * Manejo centralizado de errores y transformaciones
 */
apiClient.interceptors.response.use(
  (response) => {
    // Logging en desarrollo
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        response.status
      );
    }

    return response;
  },
  (error) => {
    // Manejo de errores común
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error("[API Error]", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });

      // Manejo de errores específicos
      switch (error.response.status) {
        case 401:
          // Token expirado o no autorizado
          // Aquí podrías redirigir al login
          console.warn("No autorizado - considera implementar refresh token");
          break;
        case 403:
          console.warn("Acceso prohibido");
          break;
        case 404:
          console.warn("Recurso no encontrado");
          break;
        case 500:
          console.error("Error del servidor");
          break;
        default:
          console.error("Error de API:", error.response.status);
      }
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error(
        "[API Error] No se recibió respuesta del servidor",
        error.request
      );
    } else {
      // Algo pasó al configurar la petición
      console.error(
        "[API Error] Error al configurar la petición",
        error.message
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
