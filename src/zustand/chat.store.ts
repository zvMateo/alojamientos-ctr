import { create } from "zustand";

interface ChatState {
  isOpen: boolean;
  inputMessage: string;
  openChat: () => void;
  closeChat: () => void;
  setInputMessage: (message: string) => void;
  clearInput: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  inputMessage: "",
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setInputMessage: (message: string) => set({ inputMessage: message }),
  clearInput: () => set({ inputMessage: "" }),
}));
