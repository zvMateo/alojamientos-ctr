import { create } from "zustand";

export interface ItineraryItem {
  id: string | number;
  nombre: string;
  categoria: string;
  direccion: string;
  localidad: string;
  region: string;
  order: number;
}

interface ItineraryStore {
  isItineraryMode: boolean;
  isModalOpen: boolean;
  items: ItineraryItem[];
  toggleItineraryMode: () => void;
  setItineraryMode: (enabled: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
  addItem: (item: Omit<ItineraryItem, "order">) => void;
  removeItem: (id: string | number) => void;
  clearItems: () => void;
}

export const useItineraryStore = create<ItineraryStore>((set) => ({
  isItineraryMode: false,
  isModalOpen: false,
  items: [],
  toggleItineraryMode: () =>
    set((state) => ({ isItineraryMode: !state.isItineraryMode })),
  setItineraryMode: (enabled) => set({ isItineraryMode: enabled }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  addItem: (item) =>
    set((state) => {
      const newOrder = state.items.length + 1;
      const newItem = { ...item, order: newOrder };
      return {
        items: [...state.items, newItem],
        // Abrir modal automáticamente al agregar el primer item
        isModalOpen: state.items.length === 0 ? true : state.isModalOpen,
      };
    }),
  removeItem: (id) =>
    set((state) => ({
      items: state.items
        .filter((item) => item.id !== id)
        .map((item, index) => ({ ...item, order: index + 1 })),
    })),
  clearItems: () => set({ items: [] }),
}));
