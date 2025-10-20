import { create } from 'zustand'

interface FilterState {
  selectedFilters: {
    tipo: string
    localidad: string
    estado: string
  }
  searchTerm: string
  setFilter: (category: string, value: string) => void
  setSearchTerm: (term: string) => void
  clearFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedFilters: {
    tipo: '',
    localidad: '',
    estado: ''
  },
  searchTerm: '',
  
  setFilter: (category: string, value: string) => {
    set((state) => ({
      selectedFilters: {
        ...state.selectedFilters,
        [category]: state.selectedFilters[category as keyof typeof state.selectedFilters] === value ? '' : value
      }
    }))
  },
  
  setSearchTerm: (term: string) => {
    set({ searchTerm: term })
  },
  
  clearFilters: () => {
    set({
      selectedFilters: {
        tipo: '',
        localidad: '',
        estado: ''
      },
      searchTerm: ''
    })
  }
}))
