import { Link, useLocation } from "react-router";
import { Home, TargetIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const location = useLocation();

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
          </nav>
        </div>
      </div>
    </header>
  );
}
