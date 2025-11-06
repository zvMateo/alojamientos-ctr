import { useCallback } from "react";
import { useChatStore } from "../store/chat.store";
import { useToast } from "@/hooks/use-toast";

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

  return { addAccommodationToChat };
};
