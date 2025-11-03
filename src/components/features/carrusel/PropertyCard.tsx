import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";
import {
  ExternalLink,
  Loader2,
  BotMessageSquareIcon,
  MapPin,
  Building,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Accommodation } from "@/lib/schemas/accommodation.schema";
import { useAccommodationTypes } from "@/hooks/use-accommodation-types";
import { useChat } from "@/hooks/use-chat";
import { memo, useState } from "react";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  accommodation: Accommodation;
}

const PropertyCard = memo(({ accommodation }: PropertyCardProps) => {
  const { nombre, localidad, direccion, paginaWeb, tipo, imagenes } =
    accommodation;
  const { data: tiposAlojamiento } = useAccommodationTypes();
  const { addAccommodationToChat } = useChat();
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Obtener el nombre del tipo de alojamiento
  const tipoNombre =
    tiposAlojamiento?.find((t) => t.id === tipo)?.name || `Tipo ${tipo}`;

  const handleAddToChat = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      addAccommodationToChat(
        nombre,
        direccion || "Sin dirección",
        accommodation.id
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="w-full h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col border-0 bg-white rounded-3xl overflow-hidden">
      {/* Imagen Principal con padding */}
      <AspectRatio
        ratio={4 / 3}
        className="overflow-hidden rounded-2xl relative"
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <img
          src={
            imagenes && imagenes.length > 0
              ? imagenes[0]
              : "/imagenpordefeto.jpg"
          }
          alt={nombre}
          loading="lazy"
          decoding="async"
          className={cn(
            "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-2xl",
            imageLoading ? "opacity-0" : "opacity-100"
          )}
          onError={(e) => {
            e.currentTarget.src = "/imagenpordefeto.jpg";
            setImageLoading(false);
          }}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
              img.src = "/imagenpordefeto.jpg";
            } else {
              setImageLoading(false);
            }
          }}
        />

        {/* Botones flotantes sobre la imagen */}
        <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
          {paginaWeb && (
            <motion.a
              href={
                paginaWeb.startsWith("http")
                  ? paginaWeb
                  : `https://${paginaWeb}`
              }
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir sitio web"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
              title="Sitio web"
              onClick={(e) => e.stopPropagation()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
            </motion.a>
          )}
        </div>
      </AspectRatio>

      {/* Contenido - más compacto */}
      <CardContent className="p-4 flex-1 flex flex-col bg-white">
        <div className="flex-1 space-y-2">
          {/* Título principal */}
          <div>
            <h3
              className="text-base font-bold text-gray-900 line-clamp-1 mb-0.5 leading-tight"
              title={nombre}
            >
              {nombre}
            </h3>
            {/* Subtítulo - tipo de alojamiento con color de marca */}
            <p
              className="leading-tight line-clamp-1 mb-0.5 text-xs font-medium text-primary/80"
              title={tipoNombre}
            >
              {tipoNombre}
            </p>
          </div>

          {/* Información de ubicación con iconos - más compacta */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              <span className="truncate" title={localidad}>
                {localidad}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Building className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              <span className="truncate" title={direccion || "Sin dirección"}>
                {direccion || "Sin dirección disponible"}
              </span>
            </div>
          </div>

          {/* Botones de acción - más compactos */}
          <div className="flex gap-2 mt-3">
            {/* Botón principal - con gradiente de marca */}
            <motion.button
              onClick={handleAddToChat}
              disabled={isAdding}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex-1 inline-flex items-center justify-center text-xs font-semibold text-white transition-all py-2.5 px-3 rounded-xl hover:shadow-lg active:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40 disabled:opacity-70 disabled:cursor-not-allowed bg-[linear-gradient(135deg,#F1010C_0%,#C34184_40%,#FE9221_80%)] hover:opacity-95"
              )}
              aria-label="Agregar alojamiento al chat"
              aria-busy={isAdding}
              title="Agregar al chat"
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              ) : (
                <BotMessageSquareIcon className="w-4 h-4 shrink-0" />
              )}
            </motion.button>

            {/* Botón secundario - con borde de color de marca */}
            <Link
              to={`/accommodation/${accommodation.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2.5 px-3 rounded-xl hover:bg-primary/5 border border-primary/20 hover:border-primary/30"
              title="Ver detalles"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PropertyCard.displayName = "PropertyCard";

export default PropertyCard;
