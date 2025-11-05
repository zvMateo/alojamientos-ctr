# 🚀 Guía de Migración a Arquitectura Feature-Based

## ✅ Progreso de la Migración

### Completado

- ✅ **Estructura de carpetas creada**
- ✅ **Feature `accommodations` migrado** (servicios, hooks, schemas, store, componentes)
- ✅ **Feature `chat` migrado** (componente, hooks, store)
- ✅ **Componentes compartidos** - Layouts movidos a `components/layout`
- ✅ **Páginas** - `HomePage` y `AccommodationDetailPage` migradas a `pages/`
- ✅ **Hooks específicos** - Migrados a features correspondientes
- ✅ **Servicios globales** - Axios configurado en `services/api`
- ✅ **Actualizar imports** - App.tsx, routes.tsx actualizados

### Pendiente

- ⏳ **Feature `activities`** - Migrar página y componentes de actividades (opcional)
- ⏳ **Limpieza** - Eliminar archivos antiguos una vez verificado que todo funciona

---

## 📂 Estructura Nueva vs Antigua

### NUEVA ESTRUCTURA (Feature-Based)

```
src/
├── features/
│   ├── accommodations/          ✅ MIGRADO
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── schemas/
│   │   └── index.ts
│   ├── chat/                    ✅ MIGRADO
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── index.ts
│   └── activities/              ⏳ PENDIENTE
├── pages/                       ⏳ CREAR
├── components/
│   ├── ui/                      ✅ YA EXISTE (Shadcn)
│   ├── layout/                  ⏳ CREAR
│   └── common/                  ⏳ CREAR
├── hooks/                       ⏳ REORGANIZAR
├── services/
│   └── api/                     ⏳ CREAR
└── store/                       ⏳ CREAR
```

---

## 🎯 PASO A PASO: Completar la Migración

### PASO 1: Mover Layouts a `components/layout/`

**Archivos a mover:**

```
components/layouts/Header.tsx      → components/layout/Header.tsx
components/layouts/Footer.tsx      → components/layout/Footer.tsx
components/layouts/PublicLayout.tsx → components/layout/PublicLayout.tsx
```

**Actualizar imports en:**

- `src/routing/routes.tsx`
- Cualquier archivo que importe layouts

---

### PASO 2: Migrar componentes de accommodations

**Mover estos archivos:**

```
components/features/carrusel/PropertyCard.tsx
  → features/accommodations/components/PropertyCard.tsx

components/features/carrusel/CarruselPropiedades.tsx
  → features/accommodations/components/AccommodationCarousel.tsx

components/features/filters/FloatingFilterBar.tsx
  → features/accommodations/components/FilterBar.tsx
```

**Nota:** Los componentes del mapa (MapContainer, InfoWindowContent) también deberían ir a `features/accommodations/components/`

**Actualizar** `features/accommodations/index.ts`:

```typescript
// Export components
export { default as PropertyCard } from "./components/PropertyCard";
export { default as AccommodationCarousel } from "./components/AccommodationCarousel";
export { default as FilterBar } from "./components/FilterBar";
```

---

### PASO 3: Migrar páginas a `pages/`

**Crear archivos nuevos:**

```typescript
// pages/HomePage.tsx
import { MapContainer } from "@/features/accommodations/components/MapContainer";
import { FilterBar } from "@/features/accommodations";
import { AccommodationCarousel } from "@/features/accommodations";
import { useFilterStore } from "@/features/accommodations";
import { useAccommodations } from "@/features/accommodations";
import { useOptimizedFiltering } from "@/features/accommodations";

export default function HomePage() {
  // ... código existente de HomePage
  // Actualizar imports a los nuevos paths
}
```

```typescript
// pages/AccommodationDetailPage.tsx
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getAlojamientoDetalle } from "@/features/accommodations";
import { useAccommodationTypes } from "@/features/accommodations";
// ... resto del código
```

**Actualizar** `src/routing/routes.tsx`:

```typescript
import HomePage from "@/pages/HomePage";
const AccommodationDetailPage = lazy(
  () => import("@/pages/AccommodationDetailPage")
);
const ActivitiesPage = lazy(() => import("@/pages/ActivitiesPage"));
```

---

### PASO 4: Reorganizar hooks globales

**Hooks que SON globales (dejar en `hooks/`):**

- `use-debounce.ts` ✅
- `use-mobile.ts` ✅
- `use-toast.ts` ✅

**Hooks que SON específicos de features (ya migrados):**

- `use-accommodations.ts` → ✅ `features/accommodations/hooks/`
- `use-accommodation-types.ts` → ✅ `features/accommodations/hooks/`
- `use-chat.ts` → ✅ `features/chat/hooks/`

**Hooks que DEPENDEN de datos (mover a features):**

- `use-filter-options.ts` → `features/accommodations/hooks/useFilterOptions.ts`
- `use-search-suggestions.ts` → `features/accommodations/hooks/useSearchSuggestions.ts`
- `use-all-popular-properties.ts` → `features/accommodations/hooks/useAllPopularProperties.ts`

---

### PASO 5: Configurar servicios globales en `services/api/`

**Crear** `services/api/axios-instance.ts`:

```typescript
import axios from "axios";

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://apiagenciacbaturismo.ubiko.com.ar",
  timeout: 10000,
});

// Interceptor de autenticación (para futuro)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logging global de errores
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);
```

**Mover** `services/api.ts` → `services/api/index.ts` (y exportar apiClient)

---

### PASO 6: Migrar feature `activities`

**Crear estructura:**

```
features/activities/
├── components/
│   ├── ActivitiesPage.tsx
│   ├── ActivityCard.tsx
│   └── ActivitiesFilterBar.tsx
├── hooks/
│   └── useActivities.ts
├── services/
│   └── activities.service.ts
├── types/
│   └── activity.types.ts
└── index.ts
```

**Mover archivos desde:**

```
components/pages/_Activities/ → features/activities/
```

---

### PASO 7: Actualizar App.tsx

```typescript
import "./App.css";
import Router from "./routing/routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatWidget } from "@/features/chat"; // ✅ Nuevo import
import { ToastProvider } from "@/components/ui/toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router />
        <ChatWidget /> {/* ✅ Componente migrado */}
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
```

---

### PASO 8: Configurar path aliases avanzados (opcional)

**Actualizar** `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/store/*": ["./src/store/*"]
    }
  }
}
```

---

## 🔧 Comandos útiles para refactorizar

### Buscar todos los imports antiguos:

```powershell
# Buscar imports de alojamientos.service
Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String "@/services/alojamientos.service"

# Buscar imports de filter.store
Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String "@/zustand/filter.store"

# Buscar imports de chat.store
Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String "@/zustand/chat.store"
```

---

## 📝 Checklist de Actualización de Imports

### Buscar y reemplazar (Ctrl+H en VS Code):

1. **Accommodations service:**

   ```
   Buscar: @/services/alojamientos.service
   Reemplazar: @/features/accommodations
   ```

2. **Filter store:**

   ```
   Buscar: @/zustand/filter.store
   Reemplazar: @/features/accommodations
   ```

3. **Chat store:**

   ```
   Buscar: @/zustand/chat.store
   Reemplazar: @/features/chat
   ```

4. **Accommodation schemas:**

   ```
   Buscar: @/lib/schemas/accommodation.schema
   Reemplazar: @/features/accommodations
   ```

5. **Accommodation hooks:**

   ```
   Buscar: @/hooks/use-accommodations
   Reemplazar: @/features/accommodations
   ```

6. **Chat hook:**

   ```
   Buscar: @/hooks/use-chat
   Reemplazar: @/features/chat
   ```

7. **Layouts:**
   ```
   Buscar: @/components/layouts/
   Reemplazar: @/components/layout/
   ```

---

## ✅ Verificación Final

### 1. Ejecutar el proyecto:

```powershell
pnpm dev
```

### 2. Verificar que:

- ✅ La página principal carga correctamente
- ✅ El mapa funciona
- ✅ Los filtros funcionan
- ✅ El carrusel de propiedades funciona
- ✅ El chat widget aparece y funciona
- ✅ La página de detalle de alojamiento funciona
- ✅ La página de actividades funciona

### 3. Verificar errores de TypeScript:

```powershell
pnpm run build
```

---

## 🎓 Beneficios de esta Arquitectura

### 1. **Escalabilidad**

- Agregar nuevos features es trivial (copiar estructura de `accommodations`)
- Cada feature es independiente

### 2. **Mantenibilidad**

- Todo relacionado con una funcionalidad está en un solo lugar
- Fácil de navegar y entender

### 3. **Testing**

- Puedes testear features de forma aislada
- Cada feature tiene su propio `index.ts` como API pública

### 4. **Colaboración**

- Varios devs pueden trabajar en features distintos sin conflictos
- Menos merge conflicts en git

### 5. **Code Splitting**

- Vite puede hacer lazy loading por feature automáticamente
- Mejora el rendimiento inicial

---

## 🔄 Siguientes Pasos Sugeridos

1. **Completar la migración** siguiendo esta guía
2. **Agregar tests** para cada feature
3. **Documentar cada feature** con un README.md
4. **Crear storybook** para componentes UI
5. **Implementar CI/CD** para automatizar builds y tests

---

## 📚 Recursos Adicionales

- [React Query Best Practices](https://tanstack.com/query/latest/docs/framework/react/guides/best-practices)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture in React](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**¿Necesitas ayuda?** Puedes:

1. Seguir esta guía paso a paso
2. Pedirme ayuda con un feature específico
3. Revisar los ejemplos en los features ya migrados (`accommodations`, `chat`)
