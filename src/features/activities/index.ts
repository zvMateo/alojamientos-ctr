/**
 * Feature: Activities
 * Gestión de actividades turísticas y prestadores de servicios
 */

// Export types
export type {
  Prestador,
  Departamento,
  Actividad,
  TipoActividad,
} from "./types";

// Export services
export {
  getPrestadores,
  getPrestadoresByDepartamentoId,
  groupPrestadoresByDepartamento,
  countActividadesByDepartamento,
} from "./services/prestadores.service";

export { getPrestadoresByFilters } from "./services/filters.service";

export {
  getDepartamentosNameToId,
  normalizeDeptName,
} from "./services/departamentos.service";

export {
  getAllLocalidades,
  getAllActividades,
} from "./services/options.service";
export type {
  LocalidadOption,
  ActividadOption,
} from "./services/options.service";

// Export constants
export { COLORES_ACTIVIDADES } from "./constants/departamentos";

// Export components
export { default as MapComponent } from "./components/MapComponent";
export { default as ActivitiesList } from "./components/ActivitiesList";
export { default as PrestadorCard } from "./components/PrestadorCard";
export { default as ActivitiesFilterBar } from "./components/ActivitiesFilterBar";
