import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";
import type { Prestador } from "../types";
import { COLORES_ACTIVIDADES } from "../constants/departamentos";

interface PrestadorCardProps {
  prestador: Prestador;
}

const PrestadorCard = memo(({ prestador }: PrestadorCardProps) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-primary/20">
      <CardContent className="p-6 space-y-4">
        {/* Header con nombre y resolución */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg leading-tight text-gray-900">
            {prestador.nombre}
          </h3>
        </div>

        {/* Información de contacto */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{prestador.localidad}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4 shrink-0" />
            <a
              href={`tel:${prestador.telefono}`}
              className="hover:text-primary transition-colors truncate"
            >
              {prestador.telefono}
            </a>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4 shrink-0" />
            <a
              href={`mailto:${prestador.email}`}
              className="hover:text-primary transition-colors truncate"
            >
              {prestador.email}
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Actividades habilitadas */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Actividades habilitadas:
          </p>
          <div className="flex flex-wrap gap-2">
            {prestador.actividades.map((actividad) => {
              const color = COLORES_ACTIVIDADES[actividad] || "#6B7280"; // Gray fallback
              return (
                <Badge
                  key={actividad}
                  className="text-xs px-3 py-1 font-semibold transition-all hover:scale-105 border"
                  style={{
                    backgroundColor: color + "15",
                    color,
                    borderColor: color + "40",
                  }}
                >
                  {actividad}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PrestadorCard.displayName = "PrestadorCard";

export default PrestadorCard;
