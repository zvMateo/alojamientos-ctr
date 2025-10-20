import { create } from 'zustand'

export interface Layer {
  id: string
  name: string
  description: string
  icon: string
  color: string
  enabled: boolean
  type: 'accommodation' | 'region' | 'category' | 'status'
  filter?: {
    field: string
    value: string | string[]
  }
}

interface LayersState {
  layers: Layer[]
  activeLayers: string[]
  toggleLayer: (layerId: string) => void
  setLayerEnabled: (layerId: string, enabled: boolean) => void
  resetLayers: () => void
}

export const useLayersStore = create<LayersState>((set, get) => ({
  layers: [
    {
      id: 'all-accommodations',
      name: 'Todos los Alojamientos',
      description: 'Muestra todos los alojamientos disponibles',
      icon: '🏨',
      color: '#3B82F6',
      enabled: true,
      type: 'accommodation'
    },
    {
      id: 'hotels',
      name: 'Hoteles',
      description: 'Solo hoteles categorizados',
      icon: '🏨',
      color: '#1E40AF',
      enabled: false,
      type: 'category',
      filter: {
        field: 'clase',
        value: 'HOTEL'
      }
    },
    {
      id: 'hostels',
      name: 'Hostels',
      description: 'Alojamientos económicos',
      icon: '🏠',
      color: '#059669',
      enabled: false,
      type: 'category',
      filter: {
        field: 'clase',
        value: 'HOSTEL'
      }
    },
    {
      id: 'hosterias',
      name: 'Hosterías',
      description: 'Hosterías y posadas',
      icon: '🏡',
      color: '#D97706',
      enabled: false,
      type: 'category',
      filter: {
        field: 'clase',
        value: 'HOSTERIA Y/O POSADA'
      }
    },
    {
      id: 'cabanas',
      name: 'Cabañas',
      description: 'Cabañas y alojamientos rurales',
      icon: '🏘️',
      color: '#7C3AED',
      enabled: false,
      type: 'category',
      filter: {
        field: 'clase',
        value: 'CABAÑAS'
      }
    },
    {
      id: 'campings',
      name: 'Campings',
      description: 'Áreas de camping',
      icon: '⛺',
      color: '#16A34A',
      enabled: false,
      type: 'category',
      filter: {
        field: 'clase',
        value: 'CAMPING'
      }
    },
    {
      id: 'uncategorized',
      name: 'Sin Categorizar',
      description: 'Alojamientos sin categoría',
      icon: '❓',
      color: '#6B7280',
      enabled: false,
      type: 'category',
      filter: {
        field: 'clase',
        value: 'NO CATEGORIZADO'
      }
    },
    {
      id: 'active-only',
      name: 'Solo Activos',
      description: 'Alojamientos en estado activo',
      icon: '✅',
      color: '#10B981',
      enabled: false,
      type: 'status',
      filter: {
        field: 'estado',
        value: 'Activo'
      }
    },
    {
      id: 'with-category',
      name: 'Con Categoría',
      description: 'Alojamientos con categoría asignada',
      icon: '⭐',
      color: '#F59E0B',
      enabled: false,
      type: 'category',
      filter: {
        field: 'categoria',
        value: ['1E', '2E', '3E', '4E', '5E']
      }
    },
    {
      id: 'cordoba-capital',
      name: 'Córdoba Capital',
      description: 'Alojamientos en la capital',
      icon: '🏛️',
      color: '#DC2626',
      enabled: false,
      type: 'region',
      filter: {
        field: 'localidad',
        value: 'Córdoba Capital'
      }
    },
    {
      id: 'carlos-paz',
      name: 'Villa Carlos Paz',
      description: 'Alojamientos en Carlos Paz',
      icon: '🏖️',
      color: '#0891B2',
      enabled: false,
      type: 'region',
      filter: {
        field: 'localidad',
        value: 'Villa Carlos Paz'
      }
    },
    {
      id: 'sierras',
      name: 'Sierras',
      description: 'Alojamientos en zona serrana',
      icon: '⛰️',
      color: '#059669',
      enabled: false,
      type: 'region',
      filter: {
        field: 'localidad',
        value: ['La Cumbre', 'Achiras']
      }
    }
  ],
  
  activeLayers: [],
  
  toggleLayer: (layerId: string) => {
    const { activeLayers } = get()
    const isActive = activeLayers.includes(layerId)
    
    if (isActive) {
      // Si es la capa "Todos", no permitir desactivarla
      if (layerId === 'all-accommodations') return
      
      set({
        activeLayers: activeLayers.filter(id => id !== layerId)
      })
    } else {
      // Si se activa una capa específica, desactivar "Todos"
      const newActiveLayers = layerId === 'all-accommodations' 
        ? ['all-accommodations']
        : activeLayers.filter(id => id !== 'all-accommodations').concat(layerId)
      
      set({
        activeLayers: newActiveLayers
      })
    }
  },
  
  setLayerEnabled: (layerId: string, enabled: boolean) => {
    set(state => ({
      layers: state.layers.map(layer => 
        layer.id === layerId ? { ...layer, enabled } : layer
      )
    }))
  },
  
  resetLayers: () => {
    set({
      activeLayers: []
    })
  }
}))
