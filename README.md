78 # 🏨 Alojamientos Córdoba Turismo

Plataforma web para la visualización y gestión de alojamientos turísticos y actividades en la provincia de Córdoba, Argentina.

## 📋 Tabla de Contenidos

- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Features Principales](#-features-principales)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Guía de Desarrollo](#-guía-de-desarrollo)
- [Convenciones de Código](#-convenciones-de-código)
- [API y Servicios](#-api-y-servicios)

---

## 🚀 Stack Tecnológico

### Core
- **React 19** - Biblioteca UI con últimas características (Compiler, Actions)
- **TypeScript 5.6** - Tipado estático para mayor seguridad
- **Vite 7.1** - Build tool ultra-rápido con HMR

### Estado y Data Fetching
- **TanStack Query (React Query) v5** - Manejo de estado del servidor (caché, refetch, invalidación)
- **Zustand 5** - Estado global del cliente (filtros, UI)

### UI y Estilos
- **TailwindCSS 3** - Utility-first CSS framework
- **Shadcn-UI** - Componentes UI accesibles basados en Radix
- **Framer Motion 11** - Animaciones fluidas
- **Lucide React** - Iconos modernos

### Routing
- **React Router v7** - Navegación y rutas

### Formularios y Validación
- **React Hook Form 7** - Manejo de formularios performante
- **Zod 3** - Validación de esquemas TypeScript-first

### HTTP y API
- **Axios 1.7** - Cliente HTTP con interceptores configurados

### Mapas
- **@vis.gl/react-google-maps 1.4** - Google Maps para React

### Otros
- **Embla Carousel** - Carruseles táctiles y responsive

---

## 🏗️ Arquitectura del Proyecto

### Patrón: Feature-Based Architecture

El proyecto sigue una **arquitectura modular basada en features** donde cada funcionalidad está autocontenida con sus propios:
- Componentes
- Hooks personalizados
- Servicios de API
- Stores de Zustand
- Tipos TypeScript
- Schemas de validación

**Ventajas:**
- ✅ Escalabilidad: Fácil agregar nuevas features sin afectar las existentes
- ✅ Mantenibilidad: Código organizado y fácil de encontrar
- ✅ Reusabilidad: Cada feature expone una API pública clara
- ✅ Testing: Testear features de forma aislada
- ✅ Colaboración: Equipos pueden trabajar en features paralelas sin conflictos

---

## 📁 Estructura de Carpetas

```
src/
├── features/                    # Features modulares (núcleo del proyecto)
│   ├── accommodations/          # Feature: Alojamientos
│   │   ├── components/          # Componentes de UI específicos
│   │   │   ├── AccommodationCarousel.tsx
│   │   │   ├── ClusteredAccommodationMarkers.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── InfoWindowContent.tsx
│   │   │   ├── MapContainer.tsx
│   │   │   └── PropertyCard.tsx
│   │   ├── hooks/               # Custom hooks del feature
│   │   │   ├── useAccommodations.ts
│   │   │   ├── useAccommodationTypes.ts
│   │   │   ├── useFilterOptions.ts
│   │   │   ├── useLazyPopularProperties.ts
│   │   │   ├── useOptimizedFiltering.ts
│   │   │   └── useSearchSuggestions.ts
│   │   ├── schemas/             # Validación con Zod
│   │   │   ├── accommodation.schema.ts
│   │   │   └── accommodation-type.schema.ts
│   │   ├── services/            # Lógica de API
│   │   │   └── accommodations.service.ts
│   │   ├── store/               # Estado global con Zustand
│   │   │   └── filters.store.ts
│   │   └── index.ts             # API pública del feature
│   │
│   ├── chat/                    # Feature: Chat de asistencia
│   │   ├── components/
│   │   │   └── ChatWidget.tsx   # Widget flotante con historial
│   │   ├── hooks/
│   │   │   └── useChat.ts
│   │   ├── store/
│   │   │   └── chat.store.ts
│   │   └── index.ts
│   │
│   └── activities/              # Feature: Actividades turísticas
│       ├── components/
│       │   ├── ActivitiesFilterBar.tsx
│       │   ├── ActivitiesList.tsx
│       │   ├── MapComponent.tsx  # Mapa SVG de Córdoba
│       │   └── PrestadorCard.tsx
│       ├── services/
│       │   ├── prestadores.service.ts
│       │   ├── filters.service.ts
│       │   ├── departamentos.service.ts
│       │   └── options.service.ts
│       ├── types/
│       │   └── index.ts         # Tipos TypeScript del feature
│       ├── constants/
│       │   └── departamentos.ts # Colores y configuración
│       └── index.ts
│
├── pages/                       # Páginas principales (rutas)
│   ├── HomePage.tsx             # / - Listado de alojamientos
│   ├── AccommodationDetailPage.tsx  # /alojamiento/:id
│   └── ActivitiesPage.tsx       # /activities
│
├── components/                  # Componentes compartidos
│   ├── layout/                  # Layouts globales
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── PublicLayout.tsx
│   └── ui/                      # Componentes UI de Shadcn
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       └── ... (40+ componentes)
│
├── services/                    # Servicios globales
│   └── api/
│       ├── axios-instance.ts    # Configuración de Axios
│       └── index.ts             # Tipos y helpers de API
│
├── config/                      # Configuraciones
│   └── api.config.ts            # URLs y endpoints de API
│
├── contexts/                    # Contextos de React
│   └── toast-context.tsx        # Sistema de notificaciones
│
├── hooks/                       # Hooks globales compartidos
│   ├── use-debounce.ts
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── lib/                         # Utilidades y helpers
│   ├── utils.ts                 # cn() y otras utilidades
│   └── colors.ts
│
├── routing/                     # Configuración de rutas
│   └── routes.tsx               # Definición de rutas
│
├── types/                       # Tipos globales
│   └── google-maps.d.ts
│
├── utils/                       # Utilidades específicas
│   └── map-utils.ts
│
├── App.tsx                      # Componente raíz
├── main.tsx                     # Entry point
└── index.css                    # Estilos globales
```

---

## ✨ Features Principales

### 1. 🏨 Accommodations (Alojamientos)

**Ubicación:** `src/features/accommodations/`

**Funcionalidad:**
- Visualización de alojamientos en mapa interactivo con Google Maps
- Sistema de filtros avanzado (tipo, localidad, región, búsqueda)
- Clustering de marcadores para mejor rendimiento
- Carrusel de propiedades populares con lazy loading
- Búsqueda inteligente con sugerencias en tiempo real
- Vista de detalle de cada alojamiento

**Componentes clave:**
- `MapContainer` - Mapa con marcadores clusterizados
- `FilterBar` - Barra de filtros con búsqueda inteligente
- `AccommodationCarousel` - Carrusel de propiedades destacadas
- `PropertyCard` - Tarjeta de alojamiento individual

**Hooks:**
- `useAccommodations` - Fetch de alojamientos con React Query
- `useOptimizedFiltering` - Filtrado optimizado con memoización
- `useSearchSuggestions` - Sugerencias de búsqueda con debounce

**Store (Zustand):**
```typescript
{
  selectedFilters: { tipo, localidad, region, estado },
  searchTerm: string,
  isCarouselVisible: boolean,
  setFilter(), clearFilters(), toggleCarousel()
}
```

---

### 2. 🎯 Activities (Actividades Turísticas)

**Ubicación:** `src/features/activities/`

**Funcionalidad:**
- Mapa SVG interactivo de departamentos de Córdoba
- Listado de prestadores de servicios turísticos
- Filtros por localidad, actividad y búsqueda de texto
- Información detallada de cada prestador (contacto, actividades)
- Vista responsive con panel deslizable

**Componentes clave:**
- `MapComponent` - Mapa SVG de Córdoba con departamentos
- `ActivitiesFilterBar` - Filtros de localidad y actividad
- `ActivitiesList` - Lista de prestadores con búsqueda
- `PrestadorCard` - Tarjeta de prestador individual

**Servicios:**
- `prestadores.service.ts` - CRUD de prestadores
- `filters.service.ts` - Filtrado por localidad/actividad
- `options.service.ts` - Obtener listas de localidades y actividades
- `departamentos.service.ts` - Mapeo de departamentos

---

### 3. 💬 Chat

**Ubicación:** `src/features/chat/`

**Funcionalidad:**
- Widget de chat flotante y draggable
- Integración con n8n webhook
- Historial de conversación en localStorage
- Efecto nebula animado
- Compartir alojamientos directamente al chat

**Store (Zustand):**
```typescript
{
  isOpen: boolean,
  inputMessage: string,
  accommodationId: string | null,
  toggleChat(), setInputMessage(), setAccommodationId()
}
```

---

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- pnpm 8+ (recomendado) o npm

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd alojamientos-ctr
```

### 2. Instalar dependencias
```bash
pnpm install
# o
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz:

```env
# API Base URL
VITE_API_BASE_URL=https://apiagenciacbaturismo.ubiko.com.ar

# Google Maps API Key (opcional, para producción)
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

### 4. Ejecutar en desarrollo
```bash
pnpm dev
# o
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

---

## 📜 Scripts Disponibles

```json
{
  "dev": "vite",                    // Servidor de desarrollo
  "build": "tsc -b && vite build",  // Build de producción
  "lint": "eslint .",               // Linter de código
  "preview": "vite preview"         // Preview del build
}
```

### Comandos útiles

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build

# Preview del build
pnpm preview

# Linting
pnpm lint

# Type checking
pnpm tsc --noEmit
```

---

## 📖 Guía de Desarrollo

### Agregar un nuevo Feature

1. **Crear estructura del feature:**
```bash
src/features/mi-feature/
├── components/
├── hooks/
├── services/
├── store/
├── types/
└── index.ts
```

2. **Implementar componentes y lógica**

3. **Exportar API pública en `index.ts`:**
```typescript
// src/features/mi-feature/index.ts
export { default as MiComponente } from './components/MiComponente';
export { useMiHook } from './hooks/useMiHook';
export { miService } from './services/mi-service';
export type { MiTipo } from './types';
```

4. **Usar el feature en páginas:**
```typescript
import { MiComponente, useMiHook } from '@/features/mi-feature';
```

---

### Crear un nuevo Servicio de API

**Ubicación:** `src/features/[feature]/services/`

**Template:**
```typescript
import api from '@/services/api/axios-instance';
import { API_CONFIG } from '@/config/api.config';

// Tipos de la API
interface ApiResponse {
  id: number;
  nombre: string;
}

// Tipos del dominio
interface DomainModel {
  id: string;
  name: string;
}

// Servicio
export async function getData(): Promise<DomainModel[]> {
  try {
    const response = await api.get<ApiResponse[]>(
      API_CONFIG.ENDPOINTS.MI_ENDPOINT
    );
    
    // Mapear de API a dominio
    return response.data.map(item => ({
      id: item.id.toString(),
      name: item.nombre,
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}
```

---

### Crear un Custom Hook con React Query

**Ubicación:** `src/features/[feature]/hooks/`

**Template:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { getData } from '../services/mi-service';

interface UseDataOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useData(options: UseDataOptions = {}) {
  return useQuery({
    queryKey: ['data', options],
    queryFn: () => getData(),
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 min
    enabled: options.enabled ?? true,
  });
}
```

---

### Crear un Store con Zustand

**Ubicación:** `src/features/[feature]/store/`

**Template:**
```typescript
import { create } from 'zustand';

interface MiState {
  // Estado
  count: number;
  items: string[];
  
  // Acciones
  increment: () => void;
  decrement: () => void;
  addItem: (item: string) => void;
  reset: () => void;
}

export const useMiStore = create<MiState>((set) => ({
  // Estado inicial
  count: 0,
  items: [],
  
  // Acciones
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  reset: () => set({ count: 0, items: [] }),
}));
```

---

## 📐 Convenciones de Código

### Nomenclatura

- **Componentes:** PascalCase - `MyComponent.tsx`
- **Hooks:** camelCase con prefijo `use` - `useMyHook.ts`
- **Servicios:** camelCase con sufijo `.service` - `my-data.service.ts`
- **Stores:** camelCase con sufijo `.store` - `my-state.store.ts`
- **Tipos:** PascalCase - `interface MyType {}`
- **Constantes:** UPPER_SNAKE_CASE - `const MAX_ITEMS = 10;`

### Estructura de Componentes

```typescript
import { memo } from 'react';

// Props interface
interface MyComponentProps {
  title: string;
  onSubmit: () => void;
}

// Componente
const MyComponent = memo(({ title, onSubmit }: MyComponentProps) => {
  // Hooks
  const [state, setState] = useState();
  
  // Handlers
  const handleClick = () => {
    // lógica
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
});

MyComponent.displayName = 'MyComponent';

export default MyComponent;
```

### Imports

Orden recomendado:
```typescript
// 1. React y librerías externas
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Features (@ alias)
import { useAccommodations } from '@/features/accommodations';

// 3. Componentes UI compartidos
import { Button } from '@/components/ui/button';

// 4. Hooks, utils y tipos compartidos
import { useDebounce } from '@/hooks/use-debounce';
import type { MyType } from '@/types';

// 5. Imports relativos
import { MyService } from '../services/my-service';
```

---

## 🔌 API y Servicios

### Configuración Base

**Archivo:** `src/config/api.config.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: "https://apiagenciacbaturismo.ubiko.com.ar",
  TIMEOUT: 15000,
  ENDPOINTS: {
    // Alojamientos
    ALOJAMIENTOS: "/api/MapaEstablecimientos",
    TIPOS_ALOJAMIENTO: "/api/MapaEstablecimientos/GetAllTypes",
    // ... más endpoints
  }
}
```

### Axios Instance

**Archivo:** `src/services/api/axios-instance.ts`

Instancia configurada con:
- ✅ Base URL automática
- ✅ Timeout de 15s
- ✅ Interceptor de requests (logging)
- ✅ Interceptor de responses (manejo de errores)
- ✅ Headers por defecto

### Endpoints Disponibles

#### Alojamientos
- `GET /api/MapaEstablecimientos` - Todos los alojamientos
- `GET /api/MapaEstablecimientos/populares` - Alojamientos populares
- `GET /api/MapaEstablecimientos/detalle/:id` - Detalle de alojamiento
- `GET /api/MapaEstablecimientos/GetAllTypes` - Tipos de alojamiento

#### Actividades
- `GET /api/MapaSvg/GetAllProviders` - Todos los prestadores
- `GET /api/MapaSvg/GetDepartmentsFullData?id={id}` - Prestadores por departamento
- `GET /api/MapaSvg/GetAllLocalities` - Todas las localidades
- `GET /api/MapaSvg/GetAllActivities` - Todas las actividades
- `GET /api/MapaSvg/filtros` - Filtrar prestadores (query params: localityId, activityId)

---

## 🎨 Sistema de Diseño

### Colores (Tailwind)
- `primary` - Color principal del sitio
- `secondary` - Color secundario
- `accent` - Color de acento
- `muted` - Texto/fondos apagados
- `destructive` - Errores y acciones destructivas

### Componentes UI (Shadcn)
Todos en `src/components/ui/`:
- `button`, `input`, `select`, `badge`
- `dialog`, `sheet`, `popover`, `tooltip`
- `card`, `accordion`, `tabs`
- `table`, `pagination`
- Y 40+ más...

---

## 🧪 Testing (Futuro)

Recomendaciones para testing:

```bash
# Instalar dependencias de testing
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

Estructura sugerida:
```
src/features/accommodations/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── services/
```

---

## 🚀 Deployment

### Build de Producción

```bash
pnpm build
```

Genera carpeta `dist/` lista para deployment.

### Configuración para IIS (web.config)

El proyecto incluye `web.config` configurado para:
- Rewrite rules para SPA
- Soporte de React Router
- Headers de seguridad

---

## 📝 Notas Importantes

### Path Aliases
El proyecto usa `@/` para imports absolutos:
```typescript
import { Button } from '@/components/ui/button';
import { useAccommodations } from '@/features/accommodations';
```

Configurado en:
- `tsconfig.json` - Para TypeScript
- `vite.config.ts` - Para Vite

### React Query DevTools
Habilitadas en desarrollo para inspeccionar queries y cache.

### Google Maps API
Configurada con componente `APIProvider` en layout principal.

---

## 👥 Equipo y Contribución

Para contribuir al proyecto:

1. Crear feature branch: `git checkout -b feature/mi-feature`
2. Hacer commits descriptivos
3. Seguir convenciones de código
4. Crear Pull Request

---

## 📞 Contacto y Soporte

Para dudas o problemas:
- Documentación interna del equipo
- Revisar este README
- Consultar código existente como referencia

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0  
**Mantenido por:** Equipo de Desarrollo - Agencia Córdoba Turismo
