import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPrestadores,
  groupPrestadoresByDepartamento,
} from "./services/prestadores.service";
import MapComponent from "./components/MapComponent";
import ActivitiesList from "./components/ActivitiesList";

export default function ActivitiePage() {
  const [selectedDepartamento, setSelectedDepartamento] = useState<
    string | null
  >(null);

  const {
    data: prestadores = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["prestadores"],
    queryFn: getPrestadores,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });

  // Memoizar el agrupamiento de prestadores
  const prestadoresPorDepartamento = useMemo(
    () => groupPrestadoresByDepartamento(prestadores),
    [prestadores]
  );

  // Memoizar prestadores filtrados
  const filteredPrestadores = useMemo(() => {
    if (!selectedDepartamento) return [];
    return prestadoresPorDepartamento.get(selectedDepartamento) || [];
  }, [prestadoresPorDepartamento, selectedDepartamento]);

  const handleSelectDepartamento = (departamento: string) => {
    setSelectedDepartamento(departamento);
  };

  const handleDeselectDepartamento = () => {
    setSelectedDepartamento(null);
  };

  // Estado de carga mejorado
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 animate-pulse">
            Cargando actividades...
          </p>
        </div>
      </div>
    );
  }

  // Estado de error mejorado
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error al cargar los datos
          </h2>
          <p className="text-gray-600 mb-8">
            No se pudieron cargar los prestadores. Por favor, verifica tu
            conexión e intenta nuevamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden relative">
      {/* Mapa - Izquierda */}
      <motion.div
        className="h-full relative"
        initial={false}
        animate={{
          width: selectedDepartamento ? "45%" : "100%",
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

      {/* Lista de Actividades - Derecha */}
      <AnimatePresence>
        {selectedDepartamento && (
          <motion.div
            key="activities-panel"
            className="absolute top-0 right-0 h-full bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
            style={{ width: "55%", height: "100%" }}
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
