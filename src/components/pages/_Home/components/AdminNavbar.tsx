import { useState } from "react";
import { useAuthStore } from "@/zustand/auth.store";
import { useFilterStore } from "@/zustand/filter.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import StatsPanel from "./StatsPanel";
import NotificationPanel from "./NotificationPanel";
import LayersPanel from "./LayersPanel";
import {
  MapPin,
  User,
  Settings,
  LogOut,
  Filter,
  Search,
  X,
} from "lucide-react";
import type { Accommodation } from "@/lib/schemas/accommodation.schema";

interface AdminNavbarProps {
  data?: Accommodation[];
  filteredData?: Accommodation[];
}

export default function AdminNavbar({
  data = [],
  filteredData = [],
}: AdminNavbarProps) {
  const { user, logout } = useAuthStore();
  const {
    selectedFilters,
    setFilter,
    searchTerm,
    setSearchTerm,
    clearFilters,
  } = useFilterStore();
  const [showFilters, setShowFilters] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Contar filtros activos
  const activeFiltersCount =
    Object.values(selectedFilters).filter((value) => value !== "").length +
    (searchTerm ? 1 : 0);

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Córdoba Turismo
              </h1>
              <p className="text-xs text-gray-500">Panel de Administración</p>
            </div>
          </div>

          {/* Controles centrales */}
          <div className="flex items-center gap-2">
            {/* Campo de búsqueda */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Buscar alojamientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 w-64 h-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100 transition-all duration-200 hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Botón de filtros */}
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Panel de capas */}
            <LayersPanel />

            {/* Panel de estadísticas */}
            <StatsPanel data={data} filteredData={filteredData} />
          </div>

          {/* Perfil del usuario */}
          <div className="flex items-center gap-3">
            {/* Panel de notificaciones */}
            <NotificationPanel />

            {/* Dropdown del perfil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.nombre?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.nombre}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <User className="w-4 h-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Panel de filtros expandible con animación */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showFilters
              ? "max-h-96 opacity-100 mt-4 pt-4 border-t border-gray-200"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-4">
            {/* Header con botón de limpiar */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Filtros Activos
              </h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2 text-xs transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                  Limpiar Todo
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tipo de Alojamiento
                </label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      selectedFilters.tipo === "HOTEL" ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("tipo", "HOTEL")}
                  >
                    Hoteles
                  </Badge>
                  <Badge
                    variant={
                      selectedFilters.tipo === "HOSTEL" ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("tipo", "HOSTEL")}
                  >
                    Hostels
                  </Badge>
                  <Badge
                    variant={
                      selectedFilters.tipo === "HOSTERIA Y/O POSADA"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("tipo", "HOSTERIA Y/O POSADA")}
                  >
                    Hosterías
                  </Badge>
                  <Badge
                    variant={
                      selectedFilters.tipo === "CABAÑAS" ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("tipo", "CABAÑAS")}
                  >
                    Cabañas
                  </Badge>
                  <Badge
                    variant={
                      selectedFilters.tipo === "CAMPING" ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("tipo", "CAMPING")}
                  >
                    Campings
                  </Badge>
                  <Badge
                    variant={
                      selectedFilters.tipo === "NO CATEGORIZADO"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("tipo", "NO CATEGORIZADO")}
                  >
                    Sin Categorizar
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Localidad
                </label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      selectedFilters.localidad === "Córdoba Capital"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("localidad", "Córdoba Capital")}
                  >
                    Córdoba Capital
                  </Badge>
                  <Badge
                    variant={
                      selectedFilters.localidad === "Villa Carlos Paz"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("localidad", "Villa Carlos Paz")}
                  >
                    Villa Carlos Paz
                  </Badge>
                  <Badge
                    variant={
                      selectedFilters.localidad === "La Cumbre"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("localidad", "La Cumbre")}
                  >
                    La Cumbre
                  </Badge>
                  <Badge
                    variant={
                      selectedFilters.localidad === "Achiras"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("localidad", "Achiras")}
                  >
                    Achiras
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Estado
                </label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      selectedFilters.estado === "Activo"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("estado", "Activo")}
                  >
                    Activos
                  </Badge>
                  <Badge
                    variant={
                      selectedFilters.estado === "Inactivo"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("estado", "Inactivo")}
                  >
                    Inactivos
                  </Badge>
                  <Badge
                    variant={
                      selectedFilters.estado === "Pendiente"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                    onClick={() => setFilter("estado", "Pendiente")}
                  >
                    Pendientes
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
