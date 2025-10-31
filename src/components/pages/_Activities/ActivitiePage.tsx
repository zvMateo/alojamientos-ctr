import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
// import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPrestadoresByDepartamentoId } from "./services/prestadores.service";
import {
  getDepartamentosNameToId,
  normalizeDeptName,
} from "./services/departamentos.service";
import MapComponent from "./components/MapComponent";
import ActivitiesList from "./components/ActivitiesList";
import FilterBar from "@/components/features/filters/FilterBar";

export default function ActivitiePage() {
  const [selectedDepartamento, setSelectedDepartamento] = useState<
    string | null
  >(null);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" && window.innerWidth >= 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Eliminado: carga masiva de prestadores (se consulta por departamento)
  const prestadoresPorDepartamento = useMemo(
    () => new Map<string, never[]>(),
    []
  );

  // Traer mapa Nombre->ID de departamentos desde la API (1 sola vez)
  const { data: departamentosNameToId = {} } = useQuery({
    queryKey: ["departamentos-name-to-id"],
    queryFn: getDepartamentosNameToId,
    staleTime: 24 * 60 * 60 * 1000, // 24h
  });

  // Cargar prestadores del departamento con el endpoint nuevo
  const departamentoId = useMemo(() => {
    if (!selectedDepartamento) return undefined;
    const key = normalizeDeptName(selectedDepartamento);
    return departamentosNameToId[key];
  }, [selectedDepartamento, departamentosNameToId]);

  const { data: prestadoresDept = [] } = useQuery({
    queryKey: ["prestadores-departamento", departamentoId],
    queryFn: () => getPrestadoresByDepartamentoId(departamentoId as number),
    enabled: typeof departamentoId === "number",
    staleTime: 5 * 60 * 1000,
  });

  // Si no tenemos id mapeado aún, usamos el agrupado local como fallback
  const [barResults, setBarResults] = useState<import("./types").Prestador[]>(
    []
  );

  const basePrestadores = useMemo<import("./types").Prestador[]>(() => {
    if (!selectedDepartamento) return [];
    if (typeof departamentoId === "number") return prestadoresDept;
    return prestadoresPorDepartamento.get(selectedDepartamento) || [];
  }, [
    selectedDepartamento,
    departamentoId,
    prestadoresDept,
    prestadoresPorDepartamento,
  ]);

  const filteredPrestadores = useMemo(() => {
    if (!selectedDepartamento) return [];
    // Si la barra devolvió resultados (filtros o búsqueda), usamos esos
    if (barResults && barResults.length > 0) return barResults;
    return basePrestadores;
  }, [selectedDepartamento, barResults, basePrestadores]);

  const handleSelectDepartamento = (departamento: string) => {
    setSelectedDepartamento(departamento);
  };

  const handleDeselectDepartamento = () => {
    setSelectedDepartamento(null);
  };

  // Eliminados estados de carga/err globales (ahora se carga por departamento)

  return (
    <div className="w-full h-screen bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden relative">
      <FilterBar
        variant="activities"
        onResults={setBarResults}
        basePrestadores={basePrestadores}
        onOpenPanel={() => {
          if (!selectedDepartamento) setSelectedDepartamento("Resultados");
        }}
        panelOpen={!!selectedDepartamento}
      />
      {/* Mapa - Izquierda */}
      <motion.div
        className="h-full relative"
        initial={false}
        animate={{
          width: selectedDepartamento ? (isDesktop ? "45%" : "100%") : "100%",
        }}
        transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
        style={{ height: "100%" }}
      >
        <MapComponent
          prestadoresPorDepartamento={prestadoresPorDepartamento}
          selectedDepartamento={selectedDepartamento}
          onSelectDepartamento={handleSelectDepartamento}
          onDeselectDepartamento={handleDeselectDepartamento}
        />
      </motion.div>

      {/* Lista de Actividades */}
      <AnimatePresence>
        {selectedDepartamento && (
          <motion.div
            key="activities-panel"
            className="absolute h-full bg-white shadow-2xl"
            initial={isDesktop ? { x: "100%" } : { y: "100%" }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            exit={isDesktop ? { x: "100%" } : { y: "100%" }}
            transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
            style={{
              width: isDesktop ? "55%" : "100%",
              height: "100%",
              zIndex: 50,
              top: 0,
              right: isDesktop ? 0 : "auto",
              left: isDesktop ? "auto" : 0,
              bottom: isDesktop ? "auto" : 0,
            }}
          >
            <ActivitiesList
              prestadores={filteredPrestadores}
              departamento={selectedDepartamento}
              onClosePanel={handleDeselectDepartamento}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
