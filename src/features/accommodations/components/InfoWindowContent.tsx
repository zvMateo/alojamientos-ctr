import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Globe,
  BotMessageSquareIcon,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Accommodation } from "../schemas/accommodation.schema";
import { getPinColor } from "@/utils/map-utils";
import { useAccommodationTypes } from "../hooks/useAccommodationTypes";
import { useChat } from "@/features/chat";
import { cn } from "@/lib/utils";

interface InfoWindowContentProps {
  accommodation: Accommodation;
}

const InfoWindowContent = memo(({ accommodation }: InfoWindowContentProps) => {
  const pinColor = getPinColor(accommodation.tipo);
  const { data: tiposAlojamiento } = useAccommodationTypes();
  const { addAccommodationToChat } = useChat();
  const [isAdding, setIsAdding] = useState(false);

  // Obtener el nombre del tipo de alojamiento
  const tipoNombre =
    tiposAlojamiento?.find((tipo) => tipo.id === accommodation.tipo)?.name ||
    `Tipo ${accommodation.tipo}`;

  const handleAddToChat = async () => {
    setIsAdding(true);
    try {
      addAccommodationToChat(
        accommodation.nombre,
        accommodation.direccion,
        accommodation.id
      );
      // Pequeño delay para feedback visual
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border-0 overflow-hidden">
      {/* Header con gradiente */}
      <div
        className="px-4 py-3 text-white relative"
        style={{
          background: `linear-gradient(135deg, ${pinColor}, ${pinColor}dd)`,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base leading-tight pr-2">
            {accommodation.nombre}
          </h3>
          <Badge
            variant="secondary"
            className="text-xs px-2 py-1 bg-white/20 text-white border-0 backdrop-blur-sm"
          >
            {tipoNombre}
          </Badge>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-4 py-3 space-y-3">
        {/* Dirección */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 leading-tight">
              {accommodation.direccion}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {accommodation.localidad}, {accommodation.region}
            </p>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="space-y-2">
          {accommodation.telefono && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <a
                href={`tel:${accommodation.telefono}`}
                className="text-xs text-gray-700 hover:text-primary transition-colors"
              >
                {accommodation.telefono}
              </a>
            </div>
          )}

          {accommodation.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <a
                href={`mailto:${accommodation.email}`}
                className="text-xs text-gray-700 hover:text-primary transition-colors truncate"
              >
                {accommodation.email}
              </a>
            </div>
          )}

          {accommodation.paginaWeb && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <a
                href={
                  accommodation.paginaWeb.startsWith("http")
                    ? accommodation.paginaWeb
                    : `https://${accommodation.paginaWeb}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-700 hover:text-primary transition-colors truncate"
              >
                {accommodation.paginaWeb}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="pt-2 space-y-2 px-4 pb-4">
        <motion.button
          onClick={handleAddToChat}
          disabled={isAdding}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-white rounded-lg transition-all duration-200 hover:shadow-lg active:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40 disabled:opacity-70 disabled:cursor-not-allowed bg-[linear-gradient(135deg,#F1010C_0%,#C34184_40%,#FE9221_80%)]"
          )}
          aria-label="Agregar alojamiento al chat"
          aria-busy={isAdding}
        >
          {isAdding ? (
            <>
              <span className="text-xs">Agregando...</span>
              <Loader2 className="w-3 h-3 animate-spin " />
            </>
          ) : (
            <>
              <span className="text-xs">Agregar al chat</span>
              <BotMessageSquareIcon className="w-3 h-3 " />
            </>
          )}
        </motion.button>
        <Link
          to={`/accommodation/${accommodation.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white rounded-lg transition-all duration-200 hover:shadow-md"
          style={{
            backgroundColor: pinColor,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = pinColor + "dd";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = pinColor;
          }}
        >
          Ver detalles completos
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
});

InfoWindowContent.displayName = "InfoWindowContent";

export default InfoWindowContent;
