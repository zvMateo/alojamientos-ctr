import { useCallback } from "react";
import { useChatStore } from "@/zustand/chat.store";
import { useToast } from "@/hooks/use-toast";

export const useChat = () => {
  const { setInputMessage, openChat } = useChatStore();
  const { showToast } = useToast();

  const addAccommodationToChat = useCallback(
    (nombre: string, direccion: string) => {
      const message = `${nombre} - ${direccion}`;
      setInputMessage(message);
      openChat();
      showToast("✓ Alojamiento agregado al chat", "success", 2000);
    },
    [setInputMessage, openChat, showToast]
  );

  return { addAccommodationToChat };
};
