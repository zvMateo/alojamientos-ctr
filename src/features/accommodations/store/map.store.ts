import { create } from "zustand";

interface MapStore {
  selectedAccommodationId: string | null;
  setSelectedAccommodationId: (id: string | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  selectedAccommodationId: null,
  setSelectedAccommodationId: (id) => set({ selectedAccommodationId: id }),
}));
