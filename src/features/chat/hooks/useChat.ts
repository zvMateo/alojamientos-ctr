import { useCallback } from "react";
import { useChatStore } from "../store/chat.store";
import { useToast } from "@/hooks/use-toast";
import type { ItineraryItem } from "@/features/accommodations/store/itinerary.store";

export const useChat = () => {
  const { appendAccommodation, openChat } = useChatStore();
  const { showToast } = useToast();

  const addAccommodationToChat = useCallback(
    (nombre: string, _direccion: string, accommodationId: string | number) => {
      // Mostrar solo el nombre en el input (sin dirección)
      const message = nombre;

      // Agregar al input existente en lugar de reemplazar
      appendAccommodation(message, accommodationId);
      openChat();
      showToast("✓ Alojamiento agregado al chat", "success", 2000);
    },
    [appendAccommodation, openChat, showToast]
  );

  const addItineraryToChat = useCallback(
    (items: ItineraryItem[]) => {
      if (items.length === 0) return;

      // Crear mensaje visible con los NOMBRES de los alojamientos
      const nombres = items.map((item) => item.nombre).join(", ");
      const message = `Quiero crear un itinerario para visitar: ${nombres}`;

      // Obtener todos los IDs de alojamientos
      const accommodationIds = items.map((item) => item.id);

      // Establecer el mensaje y los IDs en el store
      useChatStore.setState({
        inputMessage: message,
        accommodationIds: accommodationIds,
        lastAccommodationName: null,
        triggerSend: true, // Activar flag para disparar envío automático
      });

      openChat();
      showToast("✓ Itinerario agregado al chat", "success", 2000);
    },
    [openChat, showToast]
  );

  return { addAccommodationToChat, addItineraryToChat };
};
