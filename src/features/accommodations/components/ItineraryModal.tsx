import { memo } from "react";
import { X, MapPin, Trash2, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useItineraryStore } from "../store/itinerary.store";
import { useChat } from "@/features/chat";
import { cn } from "@/lib/utils";

const ItineraryModal = memo(() => {
  const { isModalOpen, items, closeModal, removeItem, clearItems } =
    useItineraryStore();
  const { addItineraryToChat } = useChat();

  const handleCreateItinerary = () => {
    addItineraryToChat(items);
    closeModal();
  };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b bg-linear-to-r from-primary/10 to-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Navigation className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Mi Itinerario
                    </h2>
                    <p className="text-sm text-gray-600">
                      {items.length} {items.length === 1 ? "lugar" : "lugares"}{" "}
                      agregados
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      onClick={clearItems}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Volver a comenzar
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Cerrar modal"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <MapPin className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay lugares en tu itinerario
                  </h3>
                  <p className="text-sm text-gray-600 text-center max-w-md">
                    Activa el "Modo Itinerario" y comienza a agregar lugares
                    para planificar tu viaje.
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-3">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      {/* Número de orden */}
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-linear-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                        {item.order}
                      </div>

                      <div className="pl-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-gray-900 mb-1">
                              {item.nombre}
                            </h3>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 bg-primary/60 rounded-full" />
                                <span className="font-medium">
                                  {item.categoria}
                                </span>
                              </p>
                              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                {item.direccion}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.localidad}, {item.region}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className={cn(
                              "p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200",
                              "opacity-0 group-hover:opacity-100"
                            )}
                            aria-label={`Eliminar ${item.nombre} del itinerario`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {items.length}
                    </span>{" "}
                    {items.length === 1
                      ? "destino en tu ruta"
                      : "destinos en tu ruta"}
                  </p>
                  <button
                    onClick={handleCreateItinerary}
                    className="px-4 py-2 bg-linear-to-r from-primary to-primary/80 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Crear itinerario con IA
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

ItineraryModal.displayName = "ItineraryModal";

export default ItineraryModal;
