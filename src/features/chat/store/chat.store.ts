import { create } from "zustand";

interface ChatState {
  isOpen: boolean;
  inputMessage: string;
  accommodationIds: (string | number)[]; // Lista de IDs de alojamientos agregados
  lastAccommodationName: string | null; // Último nombre agregado
  openChat: () => void;
  closeChat: () => void;
  setInputMessage: (message: string) => void;
  appendAccommodation: (
    message: string,
    accommodationId: string | number
  ) => void;
  clearInput: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  inputMessage: "",
  accommodationIds: [],
  lastAccommodationName: null,
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setInputMessage: (message: string) => set({ inputMessage: message }),
  appendAccommodation: (message: string, accommodationId: string | number) =>
    set((state) => {
      const currentText = state.inputMessage;

      // Agregar separador inteligente
      const needsSpaceBefore = currentText && !currentText.endsWith(" ");
      const separator = needsSpaceBefore ? " " : "";

      const newMessage = `${currentText}${separator}${message}`;

      return {
        inputMessage: newMessage,
        accommodationIds: [...state.accommodationIds, accommodationId],
        lastAccommodationName: message, // Guardar el nombre exacto
      };
    }),
  clearInput: () =>
    set({
      inputMessage: "",
      accommodationIds: [],
      lastAccommodationName: null,
    }),
}));
