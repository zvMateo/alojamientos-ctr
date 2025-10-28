import { create } from "zustand";

interface FilterState {
  selectedFilters: {
    tipo: number | null; // ID del tipo de alojamiento
    localidad: string;
    region: string;
    estado: string;
  };
  searchTerm: string;
  isCarouselVisible: boolean;
  setFilter: (category: string, value: string | number | null) => void;
  setSearchTerm: (term: string) => void;
  setCarouselVisibility: (visible: boolean) => void;
  toggleCarousel: () => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedFilters: {
    tipo: null,
    localidad: "",
    region: "",
    estado: "",
  },
  searchTerm: "",
  isCarouselVisible: false, // Por defecto oculto

  setFilter: (category: string, value: string | number | null) => {
    set((state) => ({
      selectedFilters: {
        ...state.selectedFilters,
        [category]:
          state.selectedFilters[
            category as keyof typeof state.selectedFilters
          ] === value
            ? category === "tipo"
              ? null
              : ""
            : value,
      },
    }));
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },

  setCarouselVisibility: (visible: boolean) => {
    set({ isCarouselVisible: visible });
  },

  toggleCarousel: () => {
    set((state) => ({ isCarouselVisible: !state.isCarouselVisible }));
  },

  clearFilters: () => {
    set({
      selectedFilters: {
        tipo: null,
        localidad: "",
        region: "",
        estado: "",
      },
      searchTerm: "",
    });
  },
}));
