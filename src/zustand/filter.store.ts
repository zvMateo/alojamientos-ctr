import { create } from "zustand";

interface FilterState {
  selectedFilters: {
    tipo: number | null; // ID del tipo de alojamiento
    localidad: string | null;
    region: string | null;
    estado: string | null;
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
    localidad: null,
    region: null,
    estado: null,
  },
  searchTerm: "",
  isCarouselVisible: false, // Por defecto oculto

  setFilter: (category: string, value: string | number | null) => {
    set((state) => ({
      selectedFilters: {
        ...state.selectedFilters,
        [category]: value,
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
        localidad: null,
        region: null,
        estado: null,
      },
      searchTerm: "",
    });
  },
}));
