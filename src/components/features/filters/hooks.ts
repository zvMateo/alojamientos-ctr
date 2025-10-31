import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { API_CONFIG } from "@/config/api.config";

type Localidad = { id: number; nombre: string; departamento: string | null };
type Actividad = { id: number; nombre: string };

export const useLocalidadesOptions = () =>
  useQuery({
    queryKey: ["localidades"],
    queryFn: async () =>
      (await api.get<Localidad[]>(API_CONFIG.ENDPOINTS.LOCALIDADES)).data,
    staleTime: 24 * 60 * 60 * 1000,
    select: (localidades) =>
      localidades.map((l) => ({ value: l.id.toString(), label: l.nombre })),
  });

export const useActividadesOptions = () =>
  useQuery({
    queryKey: ["actividades"],
    queryFn: async () =>
      (await api.get<Actividad[]>(API_CONFIG.ENDPOINTS.ACTIVIDADES)).data,
    staleTime: 24 * 60 * 60 * 1000,
    select: (acts) =>
      acts.map((a) => ({ value: a.id.toString(), label: a.nombre })),
  });
