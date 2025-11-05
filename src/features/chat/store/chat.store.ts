import { create } from "zustand";

interface ChatState {
  isOpen: boolean;
  inputMessage: string;
  accommodationId: string | number | null;
  openChat: () => void;
  closeChat: () => void;
  setInputMessage: (message: string, accommodationId?: string | number) => void;
  clearInput: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  inputMessage: "",
  accommodationId: null,
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setInputMessage: (message: string, accommodationId?: string | number) =>
    set({ inputMessage: message, accommodationId: accommodationId ?? null }),
  clearInput: () => set({ inputMessage: "", accommodationId: null }),
}));
