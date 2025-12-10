import { Link, useLocation } from "react-router";
import { Home, TargetIcon, MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useItineraryStore } from "@/features/accommodations/store/itinerary.store";

export default function Header() {
  const location = useLocation();
  const { isItineraryMode, toggleItineraryMode, items, openModal } =
    useItineraryStore();

  const navLinks = [
    {
      to: "/",
      label: "Inicio",
      icon: Home,
    },
    {
      to: "/activities",
      label: "Actividades",
      icon: TargetIcon,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/logcbanew.png"
              alt="Agencia Córdoba Turismo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Navegación */}
          <nav className="flex items-center space-x-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
                    "text-sm md:text-base",
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium hidden sm:inline">{label}</span>
                </Link>
              );
            })}

            {/* Botón Modo Itinerario - Solo activa/desactiva */}
            <button
              onClick={toggleItineraryMode}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
                "text-sm md:text-base font-medium",
                isItineraryMode
                  ? "bg-[linear-gradient(135deg,#F1010C_0%,#C34184_40%,#FE9221_80%)] text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary border border-gray-300"
              )}
              aria-label="Activar/desactivar modo itinerario"
              aria-pressed={isItineraryMode}
            >
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Modo Itinerario</span>
            </button>

            {/* Botón Ver Itinerario - Abre modal y muestra contador */}
            {items.length > 0 && (
              <button
                onClick={openModal}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 relative",
                  "text-sm md:text-base font-medium",
                  "text-primary hover:bg-primary/10 border border-primary"
                )}
                aria-label="Ver mi itinerario"
              >
                <span className="hidden sm:inline">
                  Ver Itinerario ({items.length})
                </span>
                <span className="sm:hidden">Itinerario</span>
                {/* Badge contador */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {items.length}
                </span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
