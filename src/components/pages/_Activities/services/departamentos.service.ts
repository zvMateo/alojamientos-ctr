import { api } from "@/services/api";
import { API_CONFIG } from "@/config/api.config";

interface ApiDepartamento {
  id: number;
  name: string;
  totalLocalidades: number;
}

interface ApiDepartamentosResponse {
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: ApiDepartamento[];
}

export const normalizeDeptName = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();

export const getDepartamentosNameToId = async (): Promise<
  Record<string, number>
> => {
  const { data } = await api.get<ApiDepartamentosResponse>(
    API_CONFIG.ENDPOINTS.DEPARTAMENTOS_ALL,
    { params: { pageNumber: 1, pageSize: 30 } }
  );
  const map: Record<string, number> = {};
  for (const d of data.data) {
    map[normalizeDeptName(d.name)] = d.id;
  }
  return map;
};
